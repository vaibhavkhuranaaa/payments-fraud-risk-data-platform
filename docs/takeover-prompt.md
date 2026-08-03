# Takeover prompt

Use this prompt to continue the project in a new agent chat:

```text
Continue the approved D5 deployment for /Users/vaibhavkhurana/Development/repos/Analytics/payments-fraud-risk-data-platform.

Read PROJECT.md, CASE-STUDY.md, AGENTS.md, all .project records, docs/takeover-prompt.md, and graphify-out/GRAPH_REPORT.md first. Use the project-delivery skill for record/governance changes, the Supabase skill for Supabase work, and the relevant deployment skill before any provider action.

Current verified state:
- GitHub: https://github.com/vaibhavkhuranaaa/payments-fraud-risk-data-platform
- Supabase Free Ohio project ref: elhhydpltongfdziroio; exactly two aggregate monitoring rows; no event table or raw data hosted; advisor checks clean.
- Render Free API: https://payments-risk-api.onrender.com; /health is verified public and healthy.
- Vercel Hobby dashboard: https://payments-fraud-risk-dashboard.vercel.app; production build is ready but intentionally unavailable until server-side variables are configured.
- Cost boundary: $0/month; no paid upgrades or payment method.
- Governance: analyst-triage only; never expose raw data, event-level records, scoring, decisioning, database credentials, or API secrets.

First milestone only: complete the protected contract. Ask the user to set a new Render API_KEY if they have not already done so. Verify /v1/monitoring with the matching X-API-Key returns only the two aggregate source rows. Then set Vercel Production API_BASE_URL=https://payments-risk-api.onrender.com and RISK_API_KEY to the same secret, redeploy, and verify the dashboard renders aggregate evidence. Do not weaken authentication to make verification easier.

Before claiming D5 complete: update approvals/state/evidence/handoff with verified revisions and URLs, run project_kit check and relevant tests, and obtain any missing explicit approval before a paid change, rollback, teardown, or expanded data exposure. Preserve the named PostgreSQL volume if restarting local Docker; the local Compose services were intentionally stopped for this handoff.
```
