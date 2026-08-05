# Handoff

## Next action

All approved milestones through D5 and R1 are complete. The approved public repository is live; the Supabase Free project `elhhydpltongfdziroio` in `us-east-2` has the verified two-row `risk.public_demo_monitoring` publication; the Render Free API is live at https://payments-risk-api.onrender.com; and the Vercel production dashboard is live at https://payments-fraud-risk-dashboard.vercel.app. On 2026-08-04 R1 deployment `dpl_2q8s16KyeB8DjqJC6opq6YEisTqk` deployed revision `d33f46170f8e7cb37581f4526844a7723c3cdf36`, returned HTTP 200, and had no initial Vercel runtime errors.

## Exact next action

1. No additional phase is approved. Preserve the existing R1 deployment and obtain written approval before any dashboard, provider, hosted-data, API-contract, public-exposure, or cost change.
2. Retain the API key only in Render and Vercel's Production secret stores. If it must be rotated, redeploy Render first, update Vercel's matching masked `RISK_API_KEY`, then redeploy Vercel and repeat the aggregate-only verification.
3. Preserve the $0 monthly cap and the two-row aggregate-only Supabase relation. Do not add raw events, personal data, scoring, or payment-decision functionality.
4. Run `uv run --frozen --group dev python scripts/project_kit.py check` after any future record change.

## Safety boundary

Do not use paid services, exceed the $0 monthly cap, host event-level or raw data, inspect or expose platform secrets, or make payment-decision claims. Raw data remains Git-ignored and local-only; analytical inputs must comply with `contracts/sparkov-source.yml`.
