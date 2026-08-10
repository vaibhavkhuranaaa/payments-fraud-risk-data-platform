"""Read-only aggregate API for the analyst-triage demonstration."""
from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from hmac import compare_digest
from pathlib import Path
from typing import Annotated

import psycopg
from fastapi import Depends, FastAPI, Header, HTTPException, status


EVALUATION_PATH = Path(os.environ.get("EVALUATION_PATH", "data/validated/evaluation.json"))
MONITORING_COLUMNS = (
    "source_file",
    "event_count",
    "fraud_count",
    "fraud_rate",
    "first_event_at",
    "last_event_at",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    database_url = os.environ.get("DATABASE_URL")
    api_key = os.environ.get("API_KEY")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    if not api_key:
        raise RuntimeError("API_KEY is required")
    app.state.connection = psycopg.connect(database_url, autocommit=True)
    app.state.api_key = api_key
    yield
    app.state.connection.close()


app = FastAPI(title="Payments Risk Platform", version="0.1.0", lifespan=lifespan)


def require_api_key(
    x_api_key: Annotated[str | None, Header()] = None,
) -> None:
    if not x_api_key or not compare_digest(x_api_key, app.state.api_key):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid API key")


@app.get("/health")
def health() -> dict[str, str]:
    try:
        app.state.connection.execute("SELECT 1")
    except Exception as error:
        raise HTTPException(status_code=503, detail="database unavailable") from error
    return {"status": "ok"}


@app.get("/v1/monitoring", dependencies=[Depends(require_api_key)])
def monitoring() -> dict[str, object]:
    rows = app.state.connection.execute(
        """
        SELECT source_file, event_count, fraud_count, fraud_rate, first_event_at, last_event_at
        FROM risk.public_demo_monitoring
        ORDER BY source_file
        """
    ).fetchall()
    return {
        "scope": "aggregate analyst triage only; no payment decisions",
        "sources": [dict(zip(MONITORING_COLUMNS, row)) for row in rows],
    }


@app.get("/v1/evaluation", dependencies=[Depends(require_api_key)])
def evaluation() -> dict[str, object]:
    """Serve precomputed aggregate evaluation evidence, never event-level scores."""
    try:
        return json.loads(EVALUATION_PATH.read_text())
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail="evaluation evidence unavailable") from error
