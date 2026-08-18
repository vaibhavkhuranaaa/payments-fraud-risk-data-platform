# Dashboard

Server-rendered Next.js evidence desk for the aggregate-only analyst-triage demonstration.

## Runtime contract

- `API_BASE_URL` points to the protected FastAPI service.
- `RISK_API_KEY` is server-side only and must never use a `NEXT_PUBLIC_` prefix.
- The browser receives rendered aggregates and deterministic synthetic signals only.

## Local commands

```sh
npm ci
npm run lint
npm run build
API_BASE_URL=http://127.0.0.1:8000 RISK_API_KEY=local-demo-key npm run dev
```

The dashboard includes explicit loading, empty, unavailable, and refusal states. It has no event-level route, scoring endpoint, or payment action.
