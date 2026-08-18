# 0002 Use prior-row features and a chronological holdout

## Decision

Build merchant and category history with SQL windows ending one row before the current event. Train on the earlier source partition and evaluate on the later partition.

## Why

Current-row labels and future activity are unavailable at scoring time. Prior-row windows and a time-ordered holdout preserve that point-in-time constraint.

## Alternatives rejected

- A random split would mix later behavior into training and overstate temporal generalization.
- Current-row rolling windows would include the event being evaluated.
- A feature store would add infrastructure without improving this single local workflow.

## Not done

No online feature service, scheduled retraining, or delayed-label feedback loop is claimed.

## Changed

Evaluation now consumes the prior merchant and category count and amount-history fields already produced by `risk.event_features`.
