# Release runbook: approval required before execution

## What is ready locally

- FastAPI image definition: `Dockerfile` with a frozen `uv.lock` runtime dependency contract.
- Dashboard production build: `dashboard/` with `npm ci`, lint, and build commands.
- Versioned PostgreSQL migrations: governed schema and aggregate-reader role.
- CI definition: `.github/workflows/quality.yml` for records, API compilation/tests, and dashboard checks.
- Runtime contract: `DATABASE_URL` stays in the API host secret store; `EVALUATION_PATH` is a local container path; `API_BASE_URL` is dashboard configuration.

## Preconditions for D5 approval

Record all of the following in `.project/approvals.yml` before creating anything externally:

1. Repository owner, visibility, default-branch protections, and secret-management owner.
2. Provider accounts, approved region, a monthly cost cap, and the billing owner.
3. Supabase database project, non-superuser API credential with the `risk_api` role, and confirmation that no raw source or prohibited fields are uploaded.
4. Render service exposure (private API or authenticated public API) and its rollback revision.
5. Vercel project exposure and the public wording that it is an analyst-triage demonstration, not a decision system.
6. Teardown owner and a date or condition for closing all provider resources.

## Controlled release sequence

1. Create the approved repository and protect the default branch.
2. Configure CI, runtime secrets, and provider audit access.
3. Provision PostgreSQL in the approved region, apply migrations in order, and create a LOGIN credential that inherits `risk_api` only.
4. Verify the role cannot read `risk.events`; it may read only `risk.public_monitoring_summary`.
5. Load only approved, hosted-safe records; verify lineage, aggregate counts, and no prohibited columns before API deployment.
6. Build and deploy the FastAPI image. Verify `/health`, `/v1/monitoring`, and `/v1/evaluation` with authenticated operational access.
7. Deploy the dashboard with the approved API base URL. Verify loading, unavailable-service, and aggregate-only display states.
8. Record service revisions, migration versions, test results, cost controls, and the rollback target in project evidence.

## Rollback and teardown

- Dashboard/API: revert to the last verified revision or disable public traffic; do not attempt data repair through the public service.
- Database: stop application traffic before a restore. Use a provider snapshot only under the approved retention policy.
- Retirement: remove dashboard, API, database, service credentials, and provider logs according to the approved retention plan. Delete the local raw source separately, because it is never hosted.

This file does not authorize provider changes beyond the completed D5 release. Any future provider action remains a human decision gate.
