# Release runbook: approval required before execution

## What is ready locally

- FastAPI image definition with a frozen runtime dependency contract.
- Dashboard production build with lint and build gates.
- Versioned PostgreSQL migrations for the governed schema, least-privilege reader, public event view, and supporting indexes.
- CI for migrations, API tests, dashboard lint, and production build.
- Runtime contract: `DATABASE_URL` remains in the API host secret store; `EVALUATION_PATH` is a runtime path; `API_BASE_URL` is dashboard configuration.

## Preconditions for full-row publication

Record all of the following in the private delivery state before any external action:

1. Repository owner, intended commit, visibility, branch protections, and secret owner.
2. Database provider and tier with enough storage above the measured 2,266 MB footprint, plus operational headroom.
3. Region, monthly cost cap, billing owner, retention, backups, and teardown condition.
4. Confirmation that only the seven allowlisted event fields will be loaded.
5. Public API exposure, throttling, connection pooling, timeouts, monitoring, and rollback revision.
6. Dashboard exposure and disclosure that the data is simulated and the product is not a payment decision system.

## Controlled release sequence

1. Approve the exact repository revision and provider plan.
2. Configure CI, runtime secrets, and provider audit access.
3. Provision PostgreSQL in the approved region, apply migrations in order, and create a LOGIN credential that inherits `risk_api` only.
4. Load only allowlisted governed records. Verify 1,852,394 rows, lineage totals, prohibited-column absence, and indexed cursor plans.
5. Verify the API role can read `risk.public_events` and `risk.public_demo_monitoring`, cannot read `risk.events`, and cannot write.
6. Build and deploy the FastAPI image. Verify health, pagination, filters, detail lookup, bounded errors, rate controls, and aggregate endpoints.
7. Deploy the dashboard with the approved API base URL. Verify loading, empty, unavailable, desktop, mobile, and no-horizontal-overflow states.
8. Record service revisions, migration versions, checks, cost controls, deployed-source verification, and rollback targets.

## Rollback and teardown

- Dashboard and API: revert to the last verified revision or disable public traffic.
- Database: stop application traffic before restore or teardown. Do not repair data through the public service.
- Retirement: remove dashboard, API, database, credentials, and provider logs under the approved retention plan. Delete the local raw source separately because it is never hosted.

This runbook does not authorize a push, provider change, paid resource, upload, or deployment.
