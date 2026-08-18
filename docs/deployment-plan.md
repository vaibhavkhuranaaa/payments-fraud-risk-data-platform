# Deployment plan: full-row public event release

## Target architecture

`local approved raw source -> local validation and feature job -> managed PostgreSQL allowlisted event view -> public read-only FastAPI -> Next.js dashboard`

The release candidate is an analytical demonstration over simulated events. It never blocks, approves, declines, or investigates a real payment. Raw files and synthetic cardholder-like fields remain local-only.

## Milestones

| ID | Deliverable | Evidence / exit criteria | External authority |
| --- | --- | --- | --- |
| D0 | Revised public-data contract | Allowlist, exclusions, threat boundary, cost gate, and decision 0006 recorded | None |
| D1 | PostgreSQL query layer | Versioned view and indexes; exact row count; least-privilege integration tests | None for local container |
| D2 | Public read-only API | Cursor pagination, parameterized filters, 100-row cap, health and failure contracts | None locally |
| D3 | Analytical dashboard | Complete event register, aggregate monitoring, model evidence, responsive states | None locally |
| D4 | Release artifacts | CI, environment contract, release runbook, screenshots, security and rollback checks | None |
| D5 | Provision and publish | Approved provider, cost, region, exposure, abuse controls, rollback, teardown, and deployed revision | Explicit human approval required |

## Data and access boundary

- **Permitted in managed PostgreSQL and public API:** generated event ID, event timestamp, merchant, category, amount, fraud label, source partition, aggregate monitoring, and fixed evaluation evidence.
- **Prohibited:** raw source files; `cc_num`; names; gender; street, city, state, or ZIP; geographic coordinates; job; date of birth; transaction number; Unix timestamp; point-in-time features; model scores; or unapproved identifiers.
- **API contract:** unauthenticated read-only access is deliberate. Event queries use exact filters, an opaque cursor, deterministic ordering, and a 100-row maximum. The database role cannot read the governed base table.
- **Dashboard contract:** server-rendered analytical controls, explicit loading, empty, and unavailable states, and no payment action.

## Existing deployment target

The existing free services predate decision 0006 and are the approved publication target:

- Supabase Free project `elhhydpltongfdziroio` in Ohio receives the compact public store.
- Render Free API `https://payments-risk-api.onrender.com` serves the protected aggregate contract.
- Vercel Hobby dashboard `https://payments-fraud-risk-dashboard.vercel.app` renders that aggregate contract.
- The prior aggregate revision remains the rollback target until the full-row release passes deployed verification.

Only an exact remote row count, endpoint checks, and deployed-source verification count as evidence that the full-row architecture is public.

## Approved $0 deployment decision

The governed local PostgreSQL database is 2,266 MB. The normalized public store removes development-only repetition and retains all 1,852,394 approved records in about 266 MB including indexes. The approved release uses the existing free services and keeps the monthly cost cap at $0:

1. Supabase Free in the existing region, with a 500 MB database limit and measured headroom.
2. A $0 monthly cost cap. Any upgrade or paid add-on requires a new approval.
3. Public-query abuse controls such as request throttling, connection pooling, query timeouts, and monitoring.
4. A bulk-load method that never uploads raw files or prohibited fields.
5. API and dashboard revisions, rollback targets, and deployed-source verification.

No provider change or paid resource is part of this release.

## Local release checklist

1. Build the FastAPI image and verify it contains code and fixed evaluation evidence, not raw source data or a database dump.
2. Apply migrations `001` through `006`. Create a LOGIN credential outside the repository that inherits `risk_api` only.
3. Verify `risk_api` can select from `risk.public_events` and `risk.public_demo_monitoring`, cannot select from `risk.events`, and has no write privilege on either public view.
4. Verify all 1,852,394 rows are reachable, default pagination uses the event-time index, filters are parameterized, and malformed cursors or inverted ranges fail safely.
5. Verify `/health`, `/v1/events`, `/v1/events/{event_id}`, `/v1/monitoring`, and `/v1/evaluation` plus dashboard loading, empty, unavailable, mobile, and desktop states.
6. Record test, lint, build, screenshot, query-plan, and clean-repository evidence before requesting D5 approval.

The local `docker-compose.yml` user is a development-only superuser. It is not an acceptable deployment credential.
