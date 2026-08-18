#!/usr/bin/env python3
"""Publish only safe source-level monitoring aggregates for the hosted demo."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import psycopg


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    parser.add_argument("--output", type=Path, default=Path("data/validated/hosted-monitoring.json"))
    args = parser.parse_args()
    if not args.database_url:
        raise SystemExit("DATABASE_URL is required")

    with psycopg.connect(args.database_url) as connection:
        rows = connection.execute(
            """
            SELECT source_file, event_count, fraud_count, fraud_rate, first_event_at, last_event_at
            FROM risk.public_monitoring_summary
            ORDER BY source_file
            """
        ).fetchall()
        with connection.cursor() as cursor:
            cursor.executemany(
                """
                INSERT INTO risk.public_demo_monitoring
                  (source_file, event_count, fraud_count, fraud_rate, first_event_at, last_event_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (source_file) DO UPDATE SET
                  event_count = EXCLUDED.event_count,
                  fraud_count = EXCLUDED.fraud_count,
                  fraud_rate = EXCLUDED.fraud_rate,
                  first_event_at = EXCLUDED.first_event_at,
                  last_event_at = EXCLUDED.last_event_at,
                  published_at = now()
                """,
                rows,
            )
        connection.commit()

    payload = {
        "scope": "aggregate analyst triage only; no payment decisions",
        "sources": [
            {
                "source_file": source_file,
                "event_count": event_count,
                "fraud_count": fraud_count,
                "fraud_rate": float(fraud_rate),
                "first_event_at": first_event_at.isoformat(),
                "last_event_at": last_event_at.isoformat(),
            }
            for source_file, event_count, fraud_count, fraud_rate, first_event_at, last_event_at in rows
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
