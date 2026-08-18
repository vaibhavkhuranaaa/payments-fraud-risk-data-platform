# Architecture

## Decision boundary

This project supports one decision: which model policy is credible enough to populate a fixed-capacity analyst review queue. It does not score a live payment, automate a payment outcome, or expose a transaction record.

## End-to-end flow

```text
Approved simulated CSV files
  -> schema and source validation
  -> idempotent PostgreSQL event load
  -> prior-row-only feature view
  -> chronological baseline and challenger evaluation
  -> aggregate publication table and fixed evaluation artifact
  -> protected FastAPI endpoints
  -> server-rendered Next.js evidence desk
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
| FastAPI | Aggregate relation and evaluation artifact | Health, monitoring, and evaluation JSON | Data endpoints require a server-side key; missing evidence returns 503 |
| Next.js | Protected aggregate API | Analyst evidence desk | Shows explicit unavailable or empty states and never falls back to raw data |

## Data access

The `risk_api` role can select from `risk.public_demo_monitoring`. It cannot select from `risk.events`. The dashboard server owns the API key; browser JavaScript receives only rendered aggregate values and deterministic synthetic signals.

## Failure recovery

- A rejected source remains outside PostgreSQL. Correct the source or contract, then rerun validation.
- A repeated load is safe because event IDs and ingestion runs are unique.
- An API or database outage produces a bounded unavailable state. No local file or event table is used as a fallback.
- Missing aggregate rows produce an empty state that asks the publication owner to verify the aggregate refresh.
- A weak challenger is rejected. The baseline remains the measured policy, with its limitations visible.

## Deployment shapes

| Concern | Current evidence demo | Scaled design |
| --- | --- | --- |
| Storage | Local PostgreSQL for full events; Supabase Free for two aggregates | Partitioned PostgreSQL or warehouse tables with separate restricted schemas |
| Compute | Local batch validation and evaluation | Scheduled container jobs with bounded retries and immutable inputs |
| Serving | Render Free API and Vercel Hobby dashboard | Autoscaled API behind managed identity and cached aggregate reads |
| Observability | Test logs, health endpoint, aggregate evidence | Structured run logs, freshness alerts, job metrics, and release tracing |
| Cost | $0 monthly cap | Not provisioned; requires a new cost and teardown approval |

The scaled design is a plan, not deployed evidence. Any provider, data, exposure, or cost change requires a separate approval.
