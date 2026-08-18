# Payments Fraud Risk Data Platform

[![Quality](https://github.com/vaibhavkhuranaaa/payments-fraud-risk-data-platform/actions/workflows/quality.yml/badge.svg)](https://github.com/vaibhavkhuranaaa/payments-fraud-risk-data-platform/actions/workflows/quality.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-1857c9.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/demo-aggregate--only-b94c31.svg)](https://payments-fraud-risk-dashboard.vercel.app)

Status: locally verified release candidate. The live demo remains the earlier approved release until this revision receives deployment approval.

![Fraud-risk validation register showing the release disposition, synthetic review queue, and capacity constraint](docs/images/dashboard-overview.png)

## What it does

This project turns 1,852,394 simulated payment events into a governed analyst-triage workflow:

- validates a license-recorded source and rejects schema or field failures;
- loads only five approved analytical fields with deterministic idempotency keys;
- builds merchant and category history from prior rows only;
- compares ordinary and class-weighted logistic policies on a chronological holdout;
- sizes a fixed-capacity review queue and makes calibration weakness visible;
- publishes two source-level monitoring aggregates and fixed evaluation evidence;
- provides safe browser-only queue interaction without scoring or payment actions.

Decision: retain the ordinary logistic baseline for the measured 1% review queue. The class-weighted challenger does not improve ranking, recall, or probability error.

## Architecture

```text
Local approved source -> PostgreSQL validation and prior-row features
                      -> chronological model evaluation
                      -> aggregate-only publication -> protected FastAPI
                                                     -> Next.js validation register
```

Raw files, prohibited source fields, event-level records, and scores remain outside the public system. The API role can read only the aggregate publication table. See [the full architecture](docs/architecture.md) and [scope](docs/scope.md).

## Evaluation

Both policies use the same six allowlisted and point-in-time inputs. They train on the 1,296,675-row earlier partition and evaluate on the 555,719-row later partition.

| Measure | Baseline | Class-weighted challenger | Direction |
| --- | ---: | ---: | --- |
| PR-AUC | 0.160 | 0.112 | Higher is better |
| Recall at 1% review | 51.3% | 45.4% | Higher is better |
| Brier score | 0.004 | 0.077 | Lower is better |
| Review slots | 5,557 | 5,557 | Fixed capacity |

The converged local evaluation completed in 24.73 seconds on one machine. This is reproducibility evidence, not a production latency claim. Definitions and limitations are in the [metric glossary](docs/metric-glossary.md).

## Limits

- The source is simulated and covers January 2019 through December 2020.
- Evidence comes from one chronological holdout without confidence intervals.
- The challenger is the same logistic model family with class weighting, not a materially different model.
- Calibration is uneven. Scores are not reliable probabilities without more work.
- No fairness analysis, threshold sweep, delayed-label feedback loop, or production drift study is claimed.
- No raw data, event-level browsing, live scoring, payment approval, payment decline, or automated decision exists.
- Free-tier services may cold-start or pause.

## Scaling

The demonstrated full-data workflow is local PostgreSQL batch processing. The public demo serves only two aggregates, which keeps exposure and monthly cost at zero. A scaled design would add scheduled container jobs, partitioned analytical storage, run-level observability, freshness alerts, and managed identity. That design is documented but not provisioned. Any provider, exposure, or cost change requires separate approval.

## Run locally

Prerequisites: Python 3.12, uv, Node.js 22, Docker, and the Sparkov files `fraudTrain.csv` and `fraudTest.csv` under ignored `data/raw/`. Source and license details are recorded in [the source contract](contracts/sparkov-source.yml).

```sh
docker compose up -d postgres
uv sync --frozen --group dev
uv run python scripts/validate_sparkov_source.py
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo uv run python scripts/migrate_postgres.py
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo uv run python src/postgres_ingest.py
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo uv run python scripts/evaluate_models.py
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo uv run python scripts/publish_aggregate_demo.py
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo API_KEY=local-demo-key FULL_DATA_VALIDATION=1 uv run python -m unittest discover -s tests -v
```

Start the protected local API and dashboard:

```sh
DATABASE_URL=postgresql://postgres:postgres@localhost:54329/risk_demo API_KEY=local-demo-key uv run uvicorn src.api:app --host 127.0.0.1 --port 8000
cd dashboard
npm ci
API_BASE_URL=http://127.0.0.1:8000 RISK_API_KEY=local-demo-key npm run dev
```

CI uses a real PostgreSQL service with tiny synthetic aggregates. Full-volume tests remain an explicit local gate because the approved raw source is never committed.

## License

Project code is available under the [MIT License](LICENSE). The Sparkov-based source is separately listed as CC0 1.0 by its provider and is not redistributed here.
