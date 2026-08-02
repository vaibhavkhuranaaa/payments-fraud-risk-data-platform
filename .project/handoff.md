# Handoff

## Next action

D4/M5 are complete and D5 is in progress. The approved public repository is live and the Supabase Free project `elhhydpltongfdziroio` in `us-east-2` has the verified two-row `risk.public_demo_monitoring` publication. The next action is to commit and push `render.yaml`, then provision the approved Render Free API with server-only `DATABASE_URL` and `API_KEY` values. The hosted database must never receive `risk.events` or raw data.

## Safety boundary

Do not use paid services, exceed the $0 monthly cap, host event-level or raw data, or make payment-decision claims. Raw data remains Git-ignored and local-only; analytical inputs must comply with `contracts/sparkov-source.yml`.
