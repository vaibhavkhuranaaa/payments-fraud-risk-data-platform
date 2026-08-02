# Handoff

## Next action

D4/M5 are complete and D5 is in progress. The approved public repository is live, the Supabase Free project `elhhydpltongfdziroio` in `us-east-2` has the verified two-row `risk.public_demo_monitoring` publication, and the Render Free API is live at https://payments-risk-api.onrender.com. The next action is to resolve the Render `API_KEY` mismatch: the health endpoint is healthy, but three server-only key rotations received 401 from `/v1/monitoring`. Do not weaken or remove API-key protection. After verification, provision Vercel with the same server-only key and the Render URL. The hosted database must never receive `risk.events` or raw data.

## Safety boundary

Do not use paid services, exceed the $0 monthly cap, host event-level or raw data, or make payment-decision claims. Raw data remains Git-ignored and local-only; analytical inputs must comply with `contracts/sparkov-source.yml`.
