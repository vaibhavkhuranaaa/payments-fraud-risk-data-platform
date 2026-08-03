# Handoff

## Next action

D4/M5 are complete and D5 is in progress. The approved public repository is live; the Supabase Free project `elhhydpltongfdziroio` in `us-east-2` has the verified two-row `risk.public_demo_monitoring` publication; the Render Free API is live at https://payments-risk-api.onrender.com; and the Vercel production dashboard is live at https://payments-fraud-risk-dashboard.vercel.app.

## Exact next action

1. In Render, set a new strong `API_KEY` and redeploy the API. Verify `GET /health` returns 200 and `GET /v1/monitoring` with the matching `X-API-Key` returns only two source-level aggregate rows.
2. In Vercel Production, set `API_BASE_URL=https://payments-risk-api.onrender.com` and `RISK_API_KEY` to that exact Render key, then redeploy.
3. Verify the Vercel dashboard renders aggregate monitoring and evaluation evidence rather than its unavailable state. Confirm no browser-visible secret, raw source, event-level row, or scoring workflow exists.
4. Update `.project/approvals.yml`, `.project/state.md`, `.project/evidence.yml`, and this handoff with the verified revisions and URLs; run `uv run --frozen --group dev python scripts/project_kit.py check` before declaring D5 complete.

## Safety boundary

Do not use paid services, exceed the $0 monthly cap, host event-level or raw data, inspect or expose platform secrets, or make payment-decision claims. Raw data remains Git-ignored and local-only; analytical inputs must comply with `contracts/sparkov-source.yml`.
