# Payments Fraud Risk Data Platform

Status: planned. This repository starts from a local-first, evidence-led delivery plan.

## Project

- Decision owner: define in `PROJECT.md`.
- Data boundary: Public, license-verified fraud data only after approval. Candidate sources require a documented license and retention review; synthetic fixtures are permitted for deterministic tests.
- First demo: Ingest a checksum-pinned approved source, validate a typed event contract, build point-in-time features, compare baseline/challenger fraud scores, and surface aggregate monitoring plus failure states.

Read `AGENTS.md` and `.project/` before contributing.

## Local PostgreSQL verification

The approved source is local-only and Git-ignored. Start the local PostgreSQL container, apply migrations, ingest the approved analytical fields, and run the integration tests:

```sh
docker compose up -d postgres
uv sync --group dev
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo uv run python scripts/migrate_postgres.py
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo uv run python src/postgres_ingest.py
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo uv run python scripts/publish_aggregate_demo.py
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo uv run python -m unittest discover -s tests -v
```

The pipeline uses PostgreSQL constraints, idempotency keys, row-level security, and aggregate-only public views. It does not make payment decisions.

## Local dashboard

The browser receives aggregate monitoring and precomputed evaluation evidence only. It has no event-level drill-down or scoring interaction.

```sh
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo API_KEY=local-demo-key uv run uvicorn src.api:app --host 127.0.0.1 --port 8000
cd dashboard && npm run dev
```

## Release boundary

`pyproject.toml` and `uv.lock` are the pinned dependency contract; the Dockerfile and dashboard build are present for a future approved release. They are not a deployment: creating a repository, cloud database, service, public URL, or paid account still requires the D5 approval recorded in `.project/approvals.yml`.
