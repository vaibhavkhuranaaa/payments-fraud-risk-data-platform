# Architecture decision

## Approved status

- Status: `approved — local-first architecture; D5 free-tier publication verified`
- Initial delivery: local PostgreSQL, FastAPI, and a local Next.js analytical dashboard
- Cloud authority: none

## Decision boundary

The system demonstrates data-quality and model-monitoring practices for a payments-risk analyst. It does not process payments or approve, block, or investigate real transactions.

## Proposed local architecture

`approved source + synthetic test fixtures → typed event validation → idempotent local pipeline → point-in-time feature table → baseline/challenger models → capacity-aware evaluation → aggregate analyst workflow + model card`

## Verified M2 implementation

- `src/postgres_ingest.py` verifies approved source metadata, selects only approved analytical fields, and loads a governed local PostgreSQL schema idempotently.
- Event IDs are deterministic hashes of the source checksum and source row index; a rerun does not append duplicate events.
- `risk.event_features` exposes merchant and category history features from prior rows only, ordered by timestamp and deterministic event ID. Labels remain outputs, not model features.
- `risk.public_monitoring_summary` is aggregate-only. Raw source data remains Git-ignored and local-only.

## Data policy

No fraud dataset is selected or downloaded until its license, terms, retention, attribution, and public-artifact constraints are approved. Raw data is ignored by Git and never served publicly.

## Scale and cost boundary

The full first release is local. Any repository, hosted endpoint, scheduled job, warehouse, or public demo requires a separate approval with owner, cost cap, exposure, rollback, and teardown plan.

## Verified deployment evolution

The verified deployment is documented in `docs/deployment-plan.md`: Supabase Free hosts only the two approved aggregate monitoring rows; a Render Free FastAPI service exposes read-only aggregate APIs behind a server-to-server key; and a Vercel Hobby dashboard renders the aggregate contract. PostgreSQL has replaced DuckDB as the local and target deployment storage engine. The $0 monthly cost cap, analyst-triage-only boundary, and no-raw-data boundary remain in force.

## Proposed R1 dashboard remediation (local only)

The dashboard may generate a deterministic, browser-only synthetic review stream. It is not fetched from the API, persisted, scored, or associated with a payment. This preserves the deployed aggregate-only contract while allowing an interactive demonstration of queue review language and refusal boundaries. R1 does not authorize any provider, hosted-data, exposure, or cost change.
