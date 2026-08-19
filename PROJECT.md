# Payments Fraud Risk Data Platform

## Portfolio contract

- **Category / industry:** data engineering, data science, and data analysis / payments risk
- **Industry question:** How can a governed fraud-risk data product validate events, build point-in-time features, compare model policies, and support a capacity-aware analyst queue?
- **Owner-facing user and decision:** A payments-risk analyst selects a measured review policy, inspects aggregate monitoring, and queries the complete allowlisted simulated event register. No payment is automatically blocked, approved, declined, or investigated.
- **Data classification:** Public simulated source processed locally under a recorded CC0 1.0 listing. Raw files and synthetic cardholder-like fields are never published.
- **Demo status:** Full-row public demo verified on the existing $0 service profile.
- **First-demo workflow:** Validate a source, load approved fields idempotently, build prior-row features, evaluate policies chronologically, inspect monitoring, and query all allowlisted event rows through bounded read-only controls.
- **Public URL target:** `/projects/payments-fraud-risk-data-platform`
- **Repository:** `https://github.com/vaibhavkhuranaaa/payments-fraud-risk-data-platform`
- **Demo:** `https://payments-fraud-risk-dashboard.vercel.app`

## Success criteria

1. A reviewer can reproduce source validation, idempotent processing, point-in-time features, chronological evaluation, aggregate monitoring, and all-row publication locally.
2. Evaluation reports PR-AUC, recall at a fixed review rate, Brier score, calibration, monthly alert volume, failure behavior, and local runtime.
3. The interface supports exact filters and cursor pagination over 1,852,394 allowlisted event records without exposing identity-like source fields, scores, or payment actions.
4. Public documentation states source licensing, retention, prohibited fields, lineage, analyst-only boundaries, and model limitations.
5. CI verifies migrations, PostgreSQL privileges, public read-only API contracts, unit logic, dashboard lint, and production build.

## Release boundary

Publication on the existing free services is approved. Provider changes, paid infrastructure, public visibility changes, and cost increases require separate approval.
