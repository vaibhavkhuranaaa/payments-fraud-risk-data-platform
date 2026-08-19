#!/usr/bin/env python3
"""Validate the quarantined Sparkov source and emit source-profile evidence."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path

RAW_FILES = ("fraudTrain.csv", "fraudTest.csv")
ALLOWLIST = ("trans_date_trans_time", "merchant", "category", "amt", "is_fraud")
EXPECTED_COLUMNS = (
    "",
    "trans_date_trans_time",
    "cc_num",
    "merchant",
    "category",
    "amt",
    "first",
    "last",
    "gender",
    "street",
    "city",
    "state",
    "zip",
    "lat",
    "long",
    "city_pop",
    "job",
    "dob",
    "trans_num",
    "unix_time",
    "merch_lat",
    "merch_long",
    "is_fraud",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def profile(path: Path) -> dict[str, object]:
    nulls = Counter()
    labels = Counter()
    categories: set[str] = set()
    merchants: set[str] = set()
    amount_total = 0.0
    amount_min: float | None = None
    amount_max: float | None = None
    start: datetime | None = None
    end: datetime | None = None
    rows = 0

    with path.open(newline="", encoding="utf-8") as source:
        reader = csv.DictReader(source)
        if tuple(reader.fieldnames or ()) != EXPECTED_COLUMNS:
            raise ValueError(f"{path.name}: source schema drifted from the approved contract")
        for row in reader:
            rows += 1
            for field in ALLOWLIST:
                if not row[field]:
                    nulls[field] += 1
            label = row["is_fraud"]
            if label not in {"0", "1"}:
                raise ValueError(f"{path.name}: unexpected label {label!r}")
            labels[label] += 1
            timestamp = datetime.strptime(
                row["trans_date_trans_time"], "%Y-%m-%d %H:%M:%S"
            ).replace(tzinfo=UTC)
            start = timestamp if start is None or timestamp < start else start
            end = timestamp if end is None or timestamp > end else end
            amount = float(row["amt"])
            amount_total += amount
            amount_min = amount if amount_min is None or amount < amount_min else amount_min
            amount_max = amount if amount_max is None or amount > amount_max else amount_max
            categories.add(row["category"])
            merchants.add(row["merchant"])

    if any(nulls.values()):
        raise ValueError(f"{path.name}: null values in allowlisted fields: {dict(nulls)}")
    if not rows or not labels["0"] or not labels["1"]:
        raise ValueError(f"{path.name}: both fraud classes are required")
    return {
        "sha256": sha256(path),
        "rows": rows,
        "label_counts": {"non_fraud": labels["0"], "fraud": labels["1"]},
        "fraud_rate": labels["1"] / rows,
        "time_range_utc": {"start": start.isoformat(sep=" "), "end": end.isoformat(sep=" ")},
        "allowlisted_field_null_counts": {field: nulls[field] for field in ALLOWLIST},
        "amount": {"min": amount_min, "max": amount_max, "mean": amount_total / rows},
        "distinct_merchants": len(merchants),
        "distinct_categories": len(categories),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", type=Path, default=Path("data/raw"))
    parser.add_argument("--output", type=Path, default=Path("data/validated/sparkov-source-profile.json"))
    args = parser.parse_args()

    files = {name: args.raw_dir / name for name in RAW_FILES}
    missing = [name for name, path in files.items() if not path.is_file()]
    if missing:
        raise SystemExit(f"missing approved raw files: {', '.join(missing)}")
    result = {"source": "kartik2112/fraud-detection", "source_version": 1, "analytical_allowlist": list(ALLOWLIST)}
    result["files"] = {name: profile(path) for name, path in files.items()}
    train_end = result["files"]["fraudTrain.csv"]["time_range_utc"]["end"]
    test_start = result["files"]["fraudTest.csv"]["time_range_utc"]["start"]
    if train_end >= test_start:
        raise SystemExit("temporal split is not strictly ordered")
    result["temporal_split_valid"] = True
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
