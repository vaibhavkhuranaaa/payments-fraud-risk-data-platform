"""Read-only public API for simulated fraud-risk analytical data."""

from __future__ import annotations

import base64
import binascii
import json
import os
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Annotated

import psycopg
from fastapi import FastAPI, HTTPException, Query, status

EVALUATION_PATH = Path(
    os.environ.get("EVALUATION_PATH", "data/validated/evaluation.json")
)
MONITORING_COLUMNS = (
    "source_file",
    "event_count",
    "fraud_count",
    "fraud_rate",
    "first_event_at",
    "last_event_at",
)
EVENT_COLUMNS = (
    "event_id",
    "event_ts",
    "merchant",
    "category",
    "amount",
    "is_fraud",
    "source_file",
)
MAX_PAGE_SIZE = 100


def encode_cursor(event_ts: datetime, event_id: str) -> str:
    payload = json.dumps([event_ts.isoformat(), event_id], separators=(",", ":"))
    return base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")


def decode_cursor(value: str) -> tuple[datetime, str]:
    try:
        padding = "=" * (-len(value) % 4)
        event_ts, event_id = json.loads(base64.urlsafe_b64decode(value + padding))
        return datetime.fromisoformat(event_ts), str(event_id)
    except (binascii.Error, TypeError, ValueError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=400, detail="invalid event cursor") from error


def event_payload(row: tuple[object, ...]) -> dict[str, object]:
    payload = dict(zip(EVENT_COLUMNS, row))
    payload["amount"] = float(payload["amount"])
    payload["event_ts"] = payload["event_ts"].isoformat()
    return payload


@asynccontextmanager
async def lifespan(app: FastAPI):
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    app.state.database_url = database_url
    with psycopg.connect(database_url) as connection:
        app.state.event_count = connection.execute(
            "SELECT count(*) FROM risk.public_events"
        ).fetchone()[0]
    yield


app = FastAPI(title="Payments Risk Platform", version="0.2.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    try:
        with psycopg.connect(app.state.database_url) as connection:
            connection.execute("SELECT 1")
    except Exception as error:
        raise HTTPException(status_code=503, detail="database unavailable") from error
    return {"status": "ok"}


@app.get("/v1/monitoring")
def monitoring() -> dict[str, object]:
    with psycopg.connect(app.state.database_url) as connection:
        rows = connection.execute(
            """
            SELECT source_file, event_count, fraud_count, fraud_rate, first_event_at, last_event_at
            FROM risk.public_demo_monitoring
            ORDER BY source_file
            """
        ).fetchall()
    return {
        "scope": "public row-level simulated events plus aggregate monitoring",
        "sources": [dict(zip(MONITORING_COLUMNS, row)) for row in rows],
    }


@app.get("/v1/evaluation")
def evaluation() -> dict[str, object]:
    """Serve precomputed model evidence, never event-level model scores."""
    try:
        return json.loads(EVALUATION_PATH.read_text())
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503, detail="evaluation evidence unavailable"
        ) from error


@app.get("/v1/events")
def events(
    limit: Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)] = 25,
    merchant: Annotated[str | None, Query(max_length=200)] = None,
    category: Annotated[str | None, Query(max_length=100)] = None,
    source_file: Annotated[str | None, Query(max_length=40)] = None,
    is_fraud: bool | None = None,
    min_amount: Annotated[float | None, Query(ge=0)] = None,
    max_amount: Annotated[float | None, Query(ge=0)] = None,
    from_ts: datetime | None = None,
    to_ts: datetime | None = None,
    cursor: Annotated[str | None, Query(max_length=256)] = None,
) -> dict[str, object]:
    if min_amount is not None and max_amount is not None and min_amount > max_amount:
        raise HTTPException(
            status_code=400, detail="min_amount must not exceed max_amount"
        )
    if from_ts is not None and to_ts is not None and from_ts > to_ts:
        raise HTTPException(status_code=400, detail="from_ts must not exceed to_ts")

    clauses = ["TRUE"]
    parameters: list[object] = []
    filters = (
        (merchant, "merchant = %s"),
        (category, "category = %s"),
        (source_file, "source_file = %s"),
        (is_fraud, "is_fraud = %s"),
        (min_amount, "amount >= %s"),
        (max_amount, "amount <= %s"),
        (from_ts, "event_ts >= %s"),
        (to_ts, "event_ts <= %s"),
    )
    for value, clause in filters:
        if value is not None:
            clauses.append(clause)
            parameters.append(value)
    if cursor:
        cursor_ts, cursor_id = decode_cursor(cursor)
        clauses.append("(event_ts, event_id) > (%s, %s)")
        parameters.extend((cursor_ts, cursor_id))
    parameters.append(limit + 1)

    query = f"""
        SELECT {", ".join(EVENT_COLUMNS)}
        FROM risk.public_events
        WHERE {" AND ".join(clauses)}
        ORDER BY event_ts, event_id
        LIMIT %s
    """
    with psycopg.connect(app.state.database_url) as connection:
        rows = connection.execute(query, parameters).fetchall()

    has_more = len(rows) > limit
    page = rows[:limit]
    next_cursor = encode_cursor(page[-1][1], page[-1][0]) if has_more and page else None
    return {
        "scope": "all allowlisted simulated event rows; identity-like source columns excluded",
        "dataset_rows": app.state.event_count,
        "returned_rows": len(page),
        "has_more": has_more,
        "next_cursor": next_cursor,
        "events": [event_payload(row) for row in page],
    }


@app.get("/v1/events/{event_id}")
def event(event_id: str) -> dict[str, object]:
    with psycopg.connect(app.state.database_url) as connection:
        row = connection.execute(
            f"SELECT {', '.join(EVENT_COLUMNS)} FROM risk.public_events WHERE event_id = %s",
            (event_id,),
        ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="event not found"
        )
    return event_payload(row)
