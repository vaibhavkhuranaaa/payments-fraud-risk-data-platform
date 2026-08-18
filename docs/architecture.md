# Architecture

## Decision boundary

This project supports two related analytical decisions: which measured model policy is credible enough for a fixed-capacity review queue, and which simulated source events warrant closer offline analysis. It does not score a live payment or automate a payment outcome.

## End-to-end flow

```text
Approved simulated CSV files
  -> schema and source validation
  -> idempotent PostgreSQL event load
  -> prior-row-only feature view
  -> chronological baseline and challenger evaluation
  -> allowlisted public event view, aggregate monitoring, and evaluation artifact
  -> public read-only FastAPI endpoints
  -> server-rendered Next.js validation register
```

The raw source remains local and Git-ignored. PostgreSQL constraints reject invalid amounts and labels. Deterministic event IDs make a repeated load idempotent. Window frames end one row before the current event, so history features are available at the event timestamp without using the current label.

## Component contracts

| Component | Input | Output | Failure behavior |
| --- | --- | --- | --- |
| Source validator | Approved local CSV files | Aggregate source profile | Reject schema drift, null analytical fields, invalid labels, or an unordered split |
| PostgreSQL loader | Allowlisted source fields | Governed `risk.events` rows | Roll back the file transaction on validation or database failure |
| Feature view | Governed event rows | Prior merchant and category history | Deterministic ordering by event time and event ID |
| Evaluation job | Point-in-time feature view | Aggregate model and capacity evidence | No output is published when the job fails |
| Publication job | Local monitoring summary | Two source-level aggregate rows | Upsert only the approved aggregate relation |
| Public event view | Governed events | Seven allowlisted columns over every event | Read-only grant; identity-like source fields do not exist in the governed table |
| FastAPI | Public event view, aggregates, evaluation artifact | Health, events, monitoring, and evaluation JSON | Cursor and filter validation reject malformed or unbounded requests |
| Next.js | Public read-only API | Analytical validation register | Shows explicit unavailable or empty states and never falls back to raw files |

## Data access

The `risk_api` role can select from `risk.public_events` and `risk.public_demo_monitoring`. It cannot select from `risk.events`, feature views, or ingestion tables. The public event view contains only event ID, event time, merchant, category, amount, fraud label, and source partition. API values are parameterized, pages are cursor-based, and each request returns at most 100 rows.

## Failure recovery

- A rejected source remains outside PostgreSQL. Correct the source or contract, then rerun validation.
- A repeated load is safe because event IDs and ingestion runs are unique.
- An API or database outage produces a bounded unavailable state. No local file or event table is used as a fallback.
- A malformed cursor or inverted range returns a bounded validation error.
- A valid query with no matching events produces an explicit empty state.
- A weak challenger is rejected. The baseline remains the measured policy, with its limitations visible.

## Deployment shapes

| Concern | Current evidence demo | Scaled design |
| --- | --- | --- |
| Storage | Local PostgreSQL with all event rows; legacy Supabase Free deployment with two aggregates | Managed PostgreSQL or warehouse sized above the measured 2,266 MB footprint |
| Compute | Local batch validation and evaluation | Scheduled container jobs with bounded retries and immutable inputs |
| Serving | Local read-only API and dashboard; legacy aggregate deployment remains live | Public read-only API with abuse controls, connection pooling, and indexed cursor reads |
| Observability | Test logs, health endpoint, aggregate evidence | Structured run logs, freshness alerts, job metrics, and release tracing |
| Cost | $0 monthly cap | Not provisioned; requires a new cost and teardown approval |

The row-level public design is verified locally, not deployed. The existing 500 MB database tier cannot host the measured 2,266 MB database. Any provider, data, exposure, or cost change requires separate approval.
