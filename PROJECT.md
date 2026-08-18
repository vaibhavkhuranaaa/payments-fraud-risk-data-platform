# Payments Fraud Risk Data Platform

## Portfolio contract

- **Category / industry:** data engineering, data science, and data analysis / payments risk
- **Industry question:** How can a governed fraud-risk data product validate events, build point-in-time features, compare model policies, and support a capacity-aware analyst queue?
- **Owner-facing user and decision:** A payments-risk analyst selects a measured review policy and inspects aggregate monitoring. No payment is automatically blocked, approved, declined, or investigated.
- **Data classification:** Public simulated source processed locally under a recorded CC0 1.0 listing. Raw files and synthetic cardholder-like fields are never published.
- **Demo status:** Existing aggregate-only public demo; current revision is a locally verified release candidate awaiting deployment approval.
- **First-demo workflow:** Validate a source, load approved fields idempotently, build prior-row features, evaluate baseline and challenger policies chronologically, and inspect aggregate monitoring plus safe failure states.
- **Public URL target:** `/projects/payments-fraud-risk-data-platform`
- **Repository:** `https://github.com/vaibhavkhuranaaa/payments-fraud-risk-data-platform`
- **Demo:** `https://payments-fraud-risk-dashboard.vercel.app`

## Success criteria

1. A reviewer can reproduce source validation, idempotent processing, point-in-time features, chronological evaluation, and aggregate monitoring locally.
2. Evaluation reports PR-AUC, recall at a fixed review rate, Brier score, calibration, monthly alert volume, failure behavior, and local runtime.
3. The interface changes a capacity and review-progress decision without exposing raw data, event records, scores, or payment actions.
4. Public documentation states source licensing, retention, prohibited fields, lineage, analyst-only boundaries, and model limitations.
5. CI verifies migrations, PostgreSQL privileges, protected API contracts, unit logic, dashboard lint, and production build.

## Release boundary

Local implementation and evidence work is authorized. No push, deployment, provider change, public metadata change, paid infrastructure, or portfolio publication is authorized for this revision without a separate approval.
