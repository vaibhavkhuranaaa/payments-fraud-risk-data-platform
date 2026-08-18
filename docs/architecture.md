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
| Publication job | Governed events and monitoring summary | Normalized public store and two source-level aggregate rows | Load only the approved public contract |
| Public event view | Compact event store and dictionaries | Seven allowlisted columns over every event | Read-only grant; identity-like source fields do not exist in the public store |
| FastAPI | Public event view, aggregates, evaluation artifact | Health, events, monitoring, and evaluation JSON | Cursor and filter validation reject malformed or unbounded requests |
| Next.js | Public read-only API | Analytical validation register | Shows explicit unavailable or empty states and never falls back to raw files |

## Data access

The `risk_api` role can select from the compact publication tables, `risk.public_events`, and `risk.public_demo_monitoring`. It cannot select from `risk.events`, feature views, or ingestion tables. The public event view contains only event ID, event time, merchant, category, amount, fraud label, and source partition. API values are parameterized, pages are cursor-based, and each request returns at most 100 rows.

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
| Storage | Local governed PostgreSQL plus a 266 MB compact public store sized for Supabase Free | Managed PostgreSQL or warehouse with additional headroom, backups, and retention controls |
| Compute | Local batch validation and evaluation | Scheduled container jobs with bounded retries and immutable inputs |
| Serving | Read-only API and dashboard with indexed cursor reads | Public read-only API with stronger abuse controls, connection pooling, and service objectives |
| Observability | Test logs, health endpoint, aggregate evidence | Structured run logs, freshness alerts, job metrics, and release tracing |
| Cost | $0 monthly cap on existing free services | Any paid or production shape requires a new cost and teardown approval |

The compact row-level design is verified locally at about 266 MB for all approved rows and indexes. The 2,266 MB governed development database remains local. Free-tier capacity, cold starts, and lack of production service objectives are explicit constraints.
