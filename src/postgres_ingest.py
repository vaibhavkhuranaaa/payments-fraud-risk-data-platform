"""Load only approved analytical fields into PostgreSQL with idempotent keys."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import uuid
from pathlib import Path

import psycopg
from psycopg.rows import dict_row


SOURCE = "kartik2112/fraud-detection"
SOURCE_VERSION = 1
ALLOWED = ("trans_date_trans_time", "merchant", "category", "amt", "is_fraud")
BATCH_SIZE = 10_000
INSERT_EVENT_SQL = """
    INSERT INTO risk.events
      (event_id, event_ts, merchant, category, amount, is_fraud, source_file, source_sha256)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (event_id) DO NOTHING
"""


def event_id(source_sha: str, row_index: str) -> str:
    return hashlib.sha256(f"{source_sha}:{row_index}".encode()).hexdigest()


def load_file(
    connection: psycopg.Connection,
    path: Path,
    source_sha: str,
) -> tuple[int, int]:
    input_rows = 0
    inserted_rows = 0
    with path.open(newline="", encoding="utf-8") as source:
        reader = csv.DictReader(source)
        if not set(ALLOWED).issubset(reader.fieldnames or ()):
            raise ValueError(f"{path.name}: missing approved analytical fields")
        with connection.cursor() as cursor:
            batch: list[tuple[str, str, str, str, str, bool, str, str]] = []
            for record in reader:
                if any(not record[field] for field in ALLOWED):
                    raise ValueError(f"{path.name}: null allowlisted field")
                if record["is_fraud"] not in {"0", "1"}:
                    raise ValueError(f"{path.name}: invalid fraud label")
                batch.append(
                    (
                        event_id(source_sha, record[""]),
                        record["trans_date_trans_time"],
                        record["merchant"],
                        record["category"],
                        record["amt"],
                        record["is_fraud"] == "1",
                        path.name,
                        source_sha,
                    )
                )
                input_rows += 1
                if len(batch) < BATCH_SIZE:
                    continue
                cursor.executemany(INSERT_EVENT_SQL, batch)
                inserted_rows += cursor.rowcount
                batch.clear()
            if batch:
                cursor.executemany(INSERT_EVENT_SQL, batch)
                inserted_rows += cursor.rowcount
    return input_rows, inserted_rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    parser.add_argument(
        "--profile",
        type=Path,
        default=Path("data/validated/sparkov-source-profile.json"),
    )
    parser.add_argument("--raw-dir", type=Path, default=Path("data/raw"))
    args = parser.parse_args()
    if not args.database_url:
        raise SystemExit("DATABASE_URL is required")

    profile = json.loads(args.profile.read_text(encoding="utf-8"))
    if profile.get("source") != SOURCE or profile.get("source_version") != SOURCE_VERSION:
        raise SystemExit("unapproved source profile")

    with psycopg.connect(
        args.database_url,
        autocommit=False,
        row_factory=dict_row,
    ) as connection:
        for filename in ("fraudTrain.csv", "fraudTest.csv"):
            source_sha = profile["files"][filename]["sha256"]
            path = args.raw_dir / filename
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT EXISTS(
                      SELECT 1 FROM risk.ingestion_runs
                      WHERE source_sha256 = %s AND source_file = %s
                    ) AS already_loaded
                    """,
                    (source_sha, filename),
                )
                if cursor.fetchone()["already_loaded"]:
                    continue
            input_rows, inserted_rows = load_file(connection, path, source_sha)
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO risk.ingestion_runs
                      (run_id, source_name, source_version, source_sha256, source_file,
                       input_rows, inserted_rows, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 'completed')
                    ON CONFLICT (source_sha256, source_file) DO NOTHING
                    """,
                    (
                        uuid.uuid4(),
                        SOURCE,
                        SOURCE_VERSION,
                        source_sha,
                        filename,
                        input_rows,
                        inserted_rows,
                    ),
                )
        connection.commit()


if __name__ == "__main__":
    main()
