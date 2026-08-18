# Scope

## Stakeholder decision

A payments-risk analyst or reviewer assesses whether a model policy provides useful rare-event ranking within a fixed 1% review budget. The product makes the selected policy, queue volume, data lineage, calibration weakness, and evidence boundary visible together.

## Included

- License-recorded simulated fraud data processed locally.
- A strict analytical allowlist containing event time, merchant, category, amount, and label.
- Idempotent PostgreSQL ingestion and prior-row-only history features.
- A chronological train and holdout split.
- Baseline and class-weighted logistic policies evaluated on the same holdout.
- PR-AUC, recall at fixed review capacity, Brier score, calibration bins, and monthly alert volume.
- Aggregate source monitoring, all-row allowlisted event queries, and a responsive analyst validation register.
- Public read-only endpoints with exact filters, cursor pagination, and a 100-row request cap.
- Loading, empty, unavailable, and refusal states.

## Excluded

- Real payments, real customers, personal data, raw source-file hosting, identity-like source fields, features, or model scores.
- Live scoring, payment approval, payment decline, case investigation, or model-trigger disclosure.
- A threshold sweep, fairness evaluation, uncertainty intervals, delayed-label feedback loop, or causal claims.
- A materially different challenger model.
- Production reliability, fraud-loss savings, reviewer-hour savings, or customer-friction claims.
- New cloud resources, provider changes, paid infrastructure, or deployment of this revision without approval.

## Release rule

The baseline remains the displayed policy because the class-weighted challenger does not beat it. That result supports a model-selection decision only. It does not establish production readiness.
