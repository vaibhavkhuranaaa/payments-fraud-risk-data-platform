# 0003 Reject the class-weighted challenger

## Decision

Retain ordinary logistic regression as the measured 1% queue policy. Do not promote the class-weighted configuration.

## Why

Both policies use the same features and chronological holdout. The challenger must improve the named capacity-aware metrics to justify added probability distortion. It does not.

## Alternatives rejected

- Calling class weighting a materially different model would exaggerate the comparison.
- Selecting the challenger because fraud is imbalanced would ignore its measured ranking and calibration loss.
- Adding a larger model before the data and threshold policy justify it would increase complexity without evidence.

## Not done

No production threshold, automated decision, fraud-loss value, or challenger deployment is claimed.

## Changed

The dashboard leads with the selection decision, shows both policies side by side, and labels the challenger as rejected.
