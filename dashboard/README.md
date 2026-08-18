# Dashboard

Server-rendered Next.js validation register for the public simulated-event and analyst-triage demonstration.

## Runtime contract

- `API_BASE_URL` points to the public read-only FastAPI service.
- The browser receives only allowlisted event fields, aggregate monitoring, and fixed evaluation evidence.
- Event queries use cursor pagination and return at most 100 rows per request.

## Local commands

```sh
npm ci
npm run lint
npm run build
API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

The dashboard includes explicit loading, empty, unavailable, and refusal states. It has no scoring endpoint or payment action.
