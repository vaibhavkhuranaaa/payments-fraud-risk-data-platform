#!/usr/bin/env python3
"""Apply immutable local PostgreSQL migrations."""
from __future__ import annotations

import argparse
import os
from pathlib import Path

import psycopg


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-url", default=os.environ.get("DATABASE_URL"))
    parser.add_argument("--migrations", type=Path, default=Path("migrations"))
    args = parser.parse_args()
    if not args.database_url:
        raise SystemExit("DATABASE_URL is required")
    with psycopg.connect(args.database_url, autocommit=False) as connection:
        with connection.cursor() as cursor:
            cursor.execute("CREATE SCHEMA IF NOT EXISTS risk")
            cursor.execute("CREATE TABLE IF NOT EXISTS risk.schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())")
        for migration in sorted(args.migrations.glob("*.sql")):
            version = migration.name
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM risk.schema_migrations WHERE version = %s", (version,))
                if cursor.fetchone():
                    continue
                cursor.execute(migration.read_text(encoding="utf-8"))
                cursor.execute("INSERT INTO risk.schema_migrations (version) VALUES (%s)", (version,))
        connection.commit()

if __name__ == "__main__":
    main()
