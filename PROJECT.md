# Payments Fraud Risk Data Platform

## Portfolio contract

- **Category / industry:** data engineering / Payments Risk Data
- **Industry question:** How can a governed transaction-risk data product validate events, create leakage-safe features, monitor quality, and support analyst triage?
- **Owner-facing user and decision:** Payments-risk analyst reviews aggregate risk alerts and data-quality exceptions; no transaction is automatically blocked or approved.
- **Data classification:** Public, license-verified fraud data only after approval. Candidate sources require a documented license and retention review; synthetic fixtures are permitted for deterministic tests.
- **Demo status:** Planned local-first data product. No public exposure or payment-processing claim before approval and release verification.
- **First-demo workflow:** Ingest a checksum-pinned approved source, validate a typed event contract, build point-in-time features, compare baseline/challenger fraud scores, and surface aggregate monitoring plus failure states.
- **Public URL target:** `/projects/payments-fraud-risk-data-platform`
- **GitHub repository:** Not requested. Local-only until a human approves repository creation and publication.

## Success criteria

1. A reviewer can reproduce event validation, idempotent processing, point-in-time feature generation, model evaluation, and data-quality monitoring locally.
2. Evaluation reports PR-AUC, recall at a fixed review rate, calibration, alert-volume stability, data-quality failure recovery, and latency/cost evidence.
3. The project documents source licensing, retention, prohibited fields, data lineage, analyst-only decision boundaries, and model limitations.

## Delivery constraints

- Candidate datasets such as IEEE-CIS or OpenML must not be downloaded until licensing and terms are recorded and approved.
- Do not deploy, create a repository, obtain paid services, or download data until the corresponding `.project/approvals.yml` entry is explicitly approved.
- Public materials must use aggregate metrics and synthetic fixtures unless source terms explicitly permit disclosure.
