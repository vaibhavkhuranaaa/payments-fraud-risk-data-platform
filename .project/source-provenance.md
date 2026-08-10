# Approved source provenance — M1

## Approved source

- Title: Credit Card Transactions Fraud Detection Dataset
- Provider / attribution: Kartik Shenoy (`kartik2112`); simulation generated with Brandon Harris's Sparkov Data Generation tool.
- Canonical URL: https://www.kaggle.com/datasets/kartik2112/fraud-detection
- Dataset reference: `kartik2112/fraud-detection` (Kaggle dataset ID `817870`)
- Version: `1` — initial release, published 2020-08-05T15:20:55.217Z
- License: CC0: Public Domain (Kaggle metadata, verified 2026-08-01)
- Scope: simulated credit-card transactions from 2019-01-01 through 2020-12-31; two CSV files, `fraudTrain.csv` and `fraudTest.csv`.

## Permitted M1 handling

- Download only to `data/raw/`, which is Git-ignored and local to this project.
- Compute and record SHA-256 checksums for each received file immediately after acquisition; a file without a recorded checksum is not an approved processing input.
- Retain raw data only for this local project and delete it when the project is retired.
- Use an allowlisted analytical schema only. Exclude synthetic cardholder-like identifiers and location/address fields: `cc_num`, `first`, `last`, `street`, `city`, `state`, `zip`, `lat`, `long`, `city_pop`, `dob`, `trans_num`, `unix_time`, and `merch_lat` / `merch_long` unless a later human approval changes this boundary.
- Do not publish raw rows, serve the source, or use it to block, approve, or investigate real transactions.

## Acquisition status

- Status: acquired and validated locally on 2026-08-01.
- `fraudTrain.csv`: SHA-256 `fd7139200dbfcbed0b6742bbe05a4f1abce532c4fef20918228a651647a3e75d` (1,296,675 rows; 7,506 fraud labels).
- `fraudTest.csv`: SHA-256 `12d553ab19440c752d2531ee1af44bb64f12cc3d3839f1649f19e81c230545f0` (555,719 rows; 2,145 fraud labels).
- Validation: `python3 scripts/validate_sparkov_source.py` verifies the exact source schema, non-null allowlisted fields, binary labels, and strictly ordered temporal split; it emits aggregate-only evidence to `data/validated/sparkov-source-profile.json`.
