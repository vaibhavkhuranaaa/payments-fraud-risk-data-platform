# Case study: Payments Fraud Risk Data Platform

## Question

How can a fraud-risk data product support an analyst queue decision while proving lineage, point-in-time correctness, model limitations, and a strict public-data boundary?

## Data boundary

The selected Sparkov dataset is simulated and listed as CC0 1.0 by its provider. Its two local files contain 1,852,394 events from January 2019 through December 2020. Only event time, merchant, category, amount, and fraud label enter the governed analytical schema. Synthetic cardholder-like identifiers, names, addresses, demographics, and location fields are prohibited.

Raw files remain local and Git-ignored. The hosted relation contains two source-level aggregate rows. The browser receives rendered aggregates and fixed evaluation evidence, never raw or event-level data.

## Engineering approach

PostgreSQL migrations create the restricted schema, constraints, idempotent ingestion ledger, point-in-time feature view, aggregate monitoring view, and least-privilege API role. Event IDs are deterministic for a source row. Reprocessing the same file does not append duplicates.

Merchant and category history windows end one row before the current event and use event time plus deterministic event ID for ordering. This prevents the current event and its label from entering its own history features.

The loader processes 10,000 rows at a time inside the file transaction. This bounds Python memory without weakening rollback behavior.

## Evaluation

The earlier 1,296,675-row source partition trains both policies. The later 555,719-row partition is the holdout. Both policies use amount, merchant, category, prior merchant count, prior merchant mean amount, and prior category count.

| Measure | Baseline | Challenger |
| --- | ---: | ---: |
| PR-AUC | 0.160 | 0.112 |
| Recall in the highest-scored 1% | 51.3% | 45.4% |
| Brier score | 0.004 | 0.077 |
| Review slots | 5,557 | 5,557 |

The baseline is ordinary logistic regression. The challenger is the same model family with class weighting. It converged but lost on all reported measures, so it is rejected. The product keeps the baseline visible as a measured comparison, not as a production-ready fraud model.

Calibration is uneven across fixed score bands. Monthly review volume ranges from 349 to 1,211 alerts under the fixed 1% policy. This describes retrospective workload, not future demand.

## Analyst experience

The evidence desk leads with the model-selection decision and its review-capacity constraint. Analysts can compare 0.5%, 1%, and 2% workload scenarios. Only the 1% scenario displays measured recall; other settings explicitly say performance was not measured.

A deterministic synthetic queue supports start, pause, filter, record-review, and reopen-review interactions. Those signals stay in browser memory. No control scores, approves, declines, retrieves, or alters a payment.

Loading, empty, unavailable, and refusal states preserve the same data boundary. The dashboard never falls back to raw records.

## Verification

- 1,852,394 event rows and 1,852,394 point-in-time feature rows.
- Zero duplicate event IDs.
- Eleven Python and PostgreSQL tests passing.
- Real PostgreSQL contract tests in CI, with full-volume verification kept local.
- Next.js lint and production build passing.
- Exact 1440px and 390px browser checks with no horizontal overflow.
- Zero automated WCAG A or AA violations; SVG text contrast received manual review because the tool could not infer the SVG background.
- Loading, capacity, queue filtering, reversible review progress, empty queue, and refusal behavior exercised in a browser.

## Limits

The source is simulated, old, and not evidence of current attack behavior. Results use one holdout and no confidence intervals. No fairness study, threshold sweep, reviewer-time study, fraud-loss value, customer-friction analysis, live scoring, production feedback loop, or managed scale test is claimed.

This revision is locally verified. Updating the existing public demo requires a separate deployment approval.
