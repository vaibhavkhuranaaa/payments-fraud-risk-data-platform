"""Read-only public API for simulated fraud-risk analytical data."""

from __future__ import annotations

import base64
import binascii
import json
import os
from contextlib import asynccontextmanager
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Annotated, Literal

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


def encode_cursor(event_id: int) -> str:
    return base64.urlsafe_b64encode(str(event_id).encode()).decode().rstrip("=")


def decode_cursor(value: str) -> int:
    try:
        padding = "=" * (-len(value) % 4)
        event_id = int(base64.urlsafe_b64decode(value + padding))
        if event_id < 1:
            raise ValueError
        return event_id
    except (binascii.Error, TypeError, ValueError) as error:
        raise HTTPException(status_code=400, detail="invalid event cursor") from error


def event_payload(row: tuple[object, ...]) -> dict[str, object]:
    payload = dict(zip(EVENT_COLUMNS, row))
    payload["event_id"] = str(payload["event_id"])
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
            "SELECT count(*) FROM risk.public_event_store"
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
    source_file: Literal["fraudTrain.csv", "fraudTest.csv"] | None = None,
    is_fraud: bool | None = None,
    min_amount: Annotated[Decimal | None, Query(ge=0)] = None,
    max_amount: Annotated[Decimal | None, Query(ge=0)] = None,
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
        (
            merchant,
            "events.merchant_id = (SELECT merchant_id FROM risk.public_merchants WHERE merchant = %s)",
        ),
        (
            category,
            "events.category_id = (SELECT category_id FROM risk.public_categories WHERE category = %s)",
        ),
        (
            source_file == "fraudTest.csv" if source_file is not None else None,
            "events.source_partition = %s",
        ),
        (is_fraud, "events.is_fraud = %s"),
        (min_amount, "events.amount_cents >= ROUND(%s * 100)"),
        (max_amount, "events.amount_cents <= ROUND(%s * 100)"),
        (from_ts, "events.event_ts >= %s"),
        (to_ts, "events.event_ts <= %s"),
    )
    for value, clause in filters:
        if value is not None:
            clauses.append(clause)
            parameters.append(value)
    if cursor:
        clauses.append("events.event_id > %s")
        parameters.append(decode_cursor(cursor))
    parameters.append(limit + 1)

    query = f"""
        SELECT events.event_id, events.event_ts, merchants.merchant, categories.category,
               (events.amount_cents::NUMERIC / 100)::NUMERIC(14, 2) AS amount,
               events.is_fraud,
               CASE WHEN events.source_partition THEN 'fraudTest.csv' ELSE 'fraudTrain.csv' END AS source_file
        FROM risk.public_event_store AS events
        JOIN risk.public_merchants AS merchants USING (merchant_id)
        JOIN risk.public_categories AS categories USING (category_id)
        WHERE {" AND ".join(clauses)}
        ORDER BY events.event_id
        LIMIT %s
    """
    with psycopg.connect(app.state.database_url) as connection:
        rows = connection.execute(query, parameters).fetchall()

    has_more = len(rows) > limit
    page = rows[:limit]
    next_cursor = encode_cursor(page[-1][0]) if has_more and page else None
    return {
        "scope": "all allowlisted simulated event rows; identity-like source columns excluded",
        "dataset_rows": app.state.event_count,
        "returned_rows": len(page),
        "has_more": has_more,
        "next_cursor": next_cursor,
        "events": [event_payload(row) for row in page],
    }


@app.get("/v1/events/{event_id}")
def event(event_id: int) -> dict[str, object]:
    with psycopg.connect(app.state.database_url) as connection:
        row = connection.execute(
            """
            SELECT events.event_id, events.event_ts, merchants.merchant, categories.category,
                   (events.amount_cents::NUMERIC / 100)::NUMERIC(14, 2) AS amount,
                   events.is_fraud,
                   CASE WHEN events.source_partition THEN 'fraudTest.csv' ELSE 'fraudTrain.csv' END AS source_file
            FROM risk.public_event_store AS events
            JOIN risk.public_merchants AS merchants USING (merchant_id)
            JOIN risk.public_categories AS categories USING (category_id)
            WHERE events.event_id = %s
            """,
            (event_id,),
        ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="event not found"
        )
    return event_payload(row)
