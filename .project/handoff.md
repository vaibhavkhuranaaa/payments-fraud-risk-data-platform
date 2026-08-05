# Handoff

## Next action

All approved milestones through D5 are complete. The approved public repository is live; the Supabase Free project `elhhydpltongfdziroio` in `us-east-2` has the verified two-row `risk.public_demo_monitoring` publication; the Render Free API is live at https://payments-risk-api.onrender.com; and the Vercel production dashboard is live at https://payments-fraud-risk-dashboard.vercel.app. On 2026-08-04 the Render server-only API key was rotated, revision `d1f8db2` was redeployed, `/health` returned 200, and Vercel Production deployment `BdM84XXscBy894334KVNYshPkGWK` successfully rendered the aggregate dashboard through the protected API contract.

## Exact next action

1. R1 is approved for deployment to the existing Vercel project only. Deploy the reviewed revision, verify its production URL and aggregate-only runtime contract, then record the deployment ID and completion evidence.
2. Retain the API key only in Render and Vercel's Production secret stores. If it must be rotated, redeploy Render first, update Vercel's matching masked `RISK_API_KEY`, then redeploy Vercel and repeat the aggregate-only verification.
3. Preserve the $0 monthly cap and the two-row aggregate-only Supabase relation. Do not add raw events, personal data, scoring, or payment-decision functionality.
4. Run `uv run --frozen --group dev python scripts/project_kit.py check` after any future record change.

## Safety boundary

Do not use paid services, exceed the $0 monthly cap, host event-level or raw data, inspect or expose platform secrets, or make payment-decision claims. Raw data remains Git-ignored and local-only; analytical inputs must comply with `contracts/sparkov-source.yml`.
