# Deployment plan — hiring-manager-ready risk data platform

## Target architecture

`local approved raw source → local validation/feature job → managed PostgreSQL (approved analytical and aggregate tables) → FastAPI → Next.js dashboard`

The deployed system is an analyst-triage demonstration. It never blocks, approves, or investigates a real payment. Raw source files and synthetic cardholder-like fields remain local-only and are not sent to the cloud.

## Milestones

| ID | Deliverable | Evidence / exit criteria | External authority |
| --- | --- | --- | --- |
| D0 | Deployment decision and guarded data contract | Architecture, hosted-data allowlist, threat boundary, provider/cost/release gates documented | None |
| D1 | PostgreSQL data layer | Versioned migrations; constrained schema; idempotent ingestion; lineage; local integration tests | None for local container |
| D2 | Risk evaluation and protected API | Baseline/challenger metrics, capacity-aware monitoring, FastAPI contract, health/readiness, aggregate-only endpoints | None |
| D3 | Hiring-manager dashboard | Next.js dashboard with lineage, monitoring, model limits, loading/error/refusal states | None |
| D4 | Release artifacts | CI, container configuration, environment contract, migration/release runbook, security and rollback checks | None |
| D5 | Provision and publish | Selected-provider approval, repository approval, cost cap, region, exposure, rollback/teardown, deployed revision verification | Explicit human approval required |

## Data and access boundary

- **Permitted in managed PostgreSQL:** generated event IDs, timestamps, merchant/category aggregates, amounts, fraud labels, leakage-safe features, evaluation metrics, data-quality outcomes, and lineage metadata.
- **Prohibited from managed PostgreSQL and public API:** raw source files; `cc_num`, names, gender, street/city/state/ZIP, geographic coordinates, job, date of birth, transaction number, Unix timestamp, or unapproved derived identifiers.
- **Public dashboard:** aggregate metrics and synthetic examples only. No event-level records or scoring endpoint.
- **API:** read-only aggregate endpoints; service credential is server-side only; least-privilege database role; health endpoint contains no data.

## Approved deployment decision for D5

- Managed PostgreSQL: Supabase Postgres, with migrations, a non-public application schema, least-privilege roles, and RLS enabled for any exposed schema.
- API: FastAPI container on Render, private database connection string held only in platform secrets.
- Dashboard: Next.js on Vercel; requests only aggregate API responses.
- Release safeguards: protected default branch, CI gates, health check, immutable migration history, rollback to prior service revision, and provider-resource teardown on project retirement.

The approved providers are now provisioned: GitHub public repository, Supabase Free project `elhhydpltongfdziroio` in Ohio, Render Free API at `https://payments-risk-api.onrender.com`, and Vercel Hobby dashboard at `https://payments-fraud-risk-dashboard.vercel.app`.

## Verified protected runtime contract (2026-08-04)

- Render's server-only API key was rotated and Render redeployed revision `d1f8db2`; the public, non-data `/health` endpoint returned HTTP 200 with `{"status":"ok"}`.
- Vercel Production holds `API_BASE_URL=https://payments-risk-api.onrender.com` and a masked `RISK_API_KEY`; neither is browser-visible and the key is not recorded in this repository.
- Vercel Production deployment `BdM84XXscBy894334KVNYshPkGWK` is ready. It renders exactly the two approved aggregate source partitions and precomputed evaluation evidence through the protected API.
- The verified page has no raw source, event-level record, drill-down, score endpoint, or payment-decision workflow. The $0/month cap remains in force; no paid resource or payment method was added.

D5 is complete: the approved free-tier providers, protected aggregate-only runtime contract, and deployed revisions have been verified. Any expansion beyond this published demonstration requires a new written approval.

## Proposed free-first portfolio profile

This profile is suitable for a personal hiring-manager demonstration, not a production payment-risk service.

| Concern | Proposed choice | Constraint / control |
| --- | --- | --- |
| Source control | Public GitHub repository under `vaibhavkhuranaaa` | Raw data, `.env`, local database files, and build outputs remain ignored; enable secret scanning and Dependabot after creation. |
| Database | Supabase Free, `us-east-2` (Ohio) | Host only a compact aggregate publication table and evaluation evidence, never `risk.events` or raw source data. The full local event table is about 3 GB and cannot fit the 500 MB free tier. |
| API | Render Free public web service | Use an API-only database credential and a server-to-server API key from the Next.js host. Explicitly disclose its idle cold start. |
| Dashboard | Vercel Hobby | Use only for this personal, non-commercial portfolio. The dashboard is public and never receives database credentials or raw/event-level data. |
| Budget | $0/month | Do not add a payment method or enable paid upgrades. Treat provider limits as suspension rather than overage approval. |
| Region | US East | Keep the database in Ohio; select the closest available US-East API region and record it at provision time. |
| Rollback / teardown | Owner: Vaibhav Khurana | Revert to prior Git revision, disable public services, then remove provider projects and secrets on retirement. |

Free-tier availability is intentionally visible in the portfolio limitations: Supabase Free projects can pause after a week of inactivity, and Render Free web services spin down after 15 minutes of inactivity. The dashboard must retain its explicit unavailable-service state.

## Local release checklist (D4)

1. Build the FastAPI image from `Dockerfile`; it contains the API and precomputed aggregate evaluation evidence, not raw source data.
2. Run `migrations/001_governed_risk_schema.sql` then `migrations/002_api_reader_role.sql`. A provider operator must create the LOGIN credential outside the repository and grant it the `risk_api` role.
3. Configure `DATABASE_URL` only in the API host secret store, `EVALUATION_PATH` as a non-secret runtime path, and `API_BASE_URL` only in the dashboard host configuration.
4. Verify `/health`, `/v1/monitoring`, `/v1/evaluation`, the dashboard error state, and the no-event-level-public-data contract before release.
5. Record the deployed image revision, migration versions, provider/region, cost cap, rollback revision, and teardown owner before exposure.

The local `docker-compose.yml` user is a development-only superuser. It is not an acceptable deployment credential.
