# Metric glossary

## PR-AUC

Area under the precision-recall curve on the chronological holdout. Higher is better. It measures ranking quality for a rare positive class without hiding class imbalance behind accuracy.

## Recall at 1% review

Share of fraud labels found among the highest-scored 1% of holdout events. Higher is better. The 1% rate is a fixed review-capacity assumption, not a production threshold.

## Brier score

Mean squared error between predicted probability and observed label on the holdout. Lower is better. A low aggregate score does not prove calibration in every risk band.

## Calibration bins

Observed fraud rate for fixed predicted-probability bands. The comparison shows whether a model score behaves like a probability. Sparse high-risk bins and one holdout limit the conclusion.

## Alert volume

Number of holdout events assigned to the fixed review queue. Monthly volume describes retrospective workload under the measured policy. It is not a demand forecast.

## Data-quality failure rate

Share of tested prohibited or malformed inputs that fail closed before analytical use. The automated suite covers schema drift and null allowlisted fields. It is not an exhaustive data-quality study.

## Evaluation runtime

Wall-clock time for one local model evaluation over the approved source on the recorded machine. It supports local reproducibility only and is not a service-latency claim.
