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

## Legacy deployment, unchanged

The existing public release predates decision 0006:

- Supabase Free project `elhhydpltongfdziroio` in Ohio contains two aggregate rows.
- Render Free API `https://payments-risk-api.onrender.com` serves the protected aggregate contract.
- Vercel Hobby dashboard `https://payments-fraud-risk-dashboard.vercel.app` renders that aggregate contract.
- The verified 2026-08-04 release remains unchanged. This repository revision has not been pushed or deployed.

The legacy deployment is not evidence that the new full-row architecture is publicly available.

## Required deployment decision

The current local PostgreSQL database is 2,266 MB, including the event table and indexes. The existing Supabase Free database limit is 500 MB, so the approved $0 profile cannot hold this release. Publishing requires a new written decision covering:

1. A database provider and tier sized for the full allowlisted dataset, indexes, and operational headroom.
2. A monthly cost cap, billing owner, region, retention period, backup policy, and teardown owner.
3. Public-query abuse controls such as request throttling, connection pooling, query timeouts, and monitoring.
4. A bulk-load method that never uploads raw files or prohibited fields.
5. API and dashboard revisions, rollback targets, and deployed-source verification.

No provider change, paid resource, data upload, push, or deployment is authorized by this plan.

## Local release checklist

1. Build the FastAPI image and verify it contains code and fixed evaluation evidence, not raw source data or a database dump.
2. Apply migrations `001` through `005`. Create a LOGIN credential outside the repository that inherits `risk_api` only.
3. Verify `risk_api` can select from `risk.public_events` and `risk.public_demo_monitoring`, cannot select from `risk.events`, and has no write privilege on either public view.
4. Verify all 1,852,394 rows are reachable, default pagination uses the event-time index, filters are parameterized, and malformed cursors or inverted ranges fail safely.
5. Verify `/health`, `/v1/events`, `/v1/events/{event_id}`, `/v1/monitoring`, and `/v1/evaluation` plus dashboard loading, empty, unavailable, mobile, and desktop states.
6. Record test, lint, build, screenshot, query-plan, and clean-repository evidence before requesting D5 approval.

The local `docker-compose.yml` user is a development-only superuser. It is not an acceptable deployment credential.
