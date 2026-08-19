#!/usr/bin/env python3
"""Upload the compact allowlisted event store through a temporary Supabase RPC."""

from __future__ import annotations

import argparse
import json
import os
import time
import urllib.error
import urllib.request

import psycopg


def post_batch(url: str, api_key: str, token: str, batch: list[dict[str, object]]) -> None:
    request = urllib.request.Request(
        url,
        data=json.dumps({"batch": batch, "token": token}, separators=(",", ":")).encode(),
        headers={
            "apikey": api_key,
            "authorization": f"Bearer {api_key}",
            "content-type": "application/json",
        },
        method="POST",
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                if response.status != 200:
                    raise RuntimeError(f"upload returned HTTP {response.status}")
            return
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(2**attempt)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    parser.add_argument("--supabase-url", default=os.environ.get("SUPABASE_URL"))
    parser.add_argument("--api-key", default=os.environ.get("SUPABASE_PUBLISHABLE_KEY"))
    parser.add_argument("--token", default=os.environ.get("INGEST_TOKEN"))
    parser.add_argument("--batch-size", type=int, default=5_000)
    parser.add_argument("--start-after", type=int, default=0)
    args = parser.parse_args()
    if not all((args.database_url, args.supabase_url, args.api_key, args.token)):
        raise SystemExit(
            "DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and INGEST_TOKEN are required"
        )
    if not 1 <= args.batch_size <= 5_000:
        raise SystemExit("batch size must be between 1 and 5000")

    endpoint = f"{args.supabase_url}/rest/v1/rpc/load_compact_event_batch_20260818"
    uploaded = 0
    with (
        psycopg.connect(args.database_url) as connection,
        connection.cursor(name="public_event_upload") as cursor,
    ):
        cursor.execute(
            """
            SELECT event_id, event_ts, merchant_id, category_id, amount_cents,
                   is_fraud, source_partition
            FROM risk.public_event_store
            WHERE event_id > %s
            ORDER BY event_id
            """,
            (args.start_after,),
        )
        while rows := cursor.fetchmany(args.batch_size):
            batch = [
                {
                    "event_id": row[0],
                    "event_ts": row[1].isoformat(),
                    "merchant_id": row[2],
                    "category_id": row[3],
                    "amount_cents": row[4],
                    "is_fraud": row[5],
                    "source_partition": row[6],
                }
                for row in rows
            ]
            post_batch(endpoint, args.api_key, args.token, batch)
            uploaded += len(batch)
            if uploaded % 100_000 < len(batch):
                print(f"uploaded {uploaded:,} rows")
    print(f"uploaded {uploaded:,} rows; complete")


if __name__ == "__main__":
    main()
