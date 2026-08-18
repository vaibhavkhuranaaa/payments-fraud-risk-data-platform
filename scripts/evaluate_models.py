#!/usr/bin/env python3
"""Evaluate two logistic policies on a chronological holdout."""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

import numpy as np
import psycopg
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

FEATURE_COLUMNS = (
    "amount",
    "merchant",
    "category",
    "merchant_prior_transaction_count",
    "merchant_prior_amount_mean",
    "category_prior_transaction_count",
)


def recall_at_rate(labels: np.ndarray, scores: np.ndarray, rate: float = 0.01) -> float:
    count = max(1, round(len(scores) * rate))
    selected = np.argpartition(scores, -count)[-count:]
    return float(labels[selected].sum() / max(1, labels.sum()))


def evaluate(database_url: str) -> dict[str, object]:
    started = time.perf_counter()
    with psycopg.connect(database_url) as connection:
        rows = connection.execute(
            """
            SELECT
              source_file,
              event_ts::date,
              amount::float,
              merchant,
              category,
              merchant_prior_transaction_count::float,
              merchant_prior_amount_mean::float,
              category_prior_transaction_count::float,
              is_fraud::int
            FROM risk.event_features
            ORDER BY event_ts, event_id
            """
        ).fetchall()

    train = np.array([row[0] == "fraudTrain.csv" for row in rows])
    labels = np.array([row[8] for row in rows])
    features = np.array([row[2:8] for row in rows], dtype=object)
    months = np.array([str(row[1])[:7] for row, is_train in zip(rows, train) if not is_train])

    preprocessor = ColumnTransformer(
        [
            ("numeric", StandardScaler(), [0, 3, 4, 5]),
            ("categories", OneHotEncoder(handle_unknown="ignore"), [1, 2]),
        ]
    )
    policies = {
        "baseline": LogisticRegression(max_iter=500, n_jobs=-1),
        "challenger": LogisticRegression(
            C=3,
            max_iter=500,
            n_jobs=-1,
            class_weight="balanced",
        ),
    }
    review_rate = 0.01
    result: dict[str, object] = {
        "split": "chronological source train/test",
        "review_rate": review_rate,
        "holdout_rows": int((~train).sum()),
        "features": list(FEATURE_COLUMNS),
        "models": {},
    }
    truth = labels[~train]

    for name, policy in policies.items():
        model = make_pipeline(preprocessor, policy)
        model.fit(features[train], labels[train])
        scores = model.predict_proba(features[~train])[:, 1]
        count = max(1, round(len(scores) * review_rate))
        selected = np.argpartition(scores, -count)[-count:]
        selected_months = months[selected]
        bins = []
        for low, high in zip(np.linspace(0, 0.9, 10), np.linspace(0.1, 1, 10)):
            mask = (scores >= low) & (scores < high if high < 1 else scores <= high)
            bins.append(
                {
                    "low": round(float(low), 1),
                    "high": round(float(high), 1),
                    "count": int(mask.sum()),
                    "observed_rate": float(truth[mask].mean()) if mask.any() else None,
                }
            )
        result["models"][name] = {
            "pr_auc": average_precision_score(truth, scores),
            "recall_at_review_rate": recall_at_rate(truth, scores, review_rate),
            "brier_score": brier_score_loss(truth, scores),
            "alert_volume": count,
            "calibration_bins": bins,
            "alert_volume_by_month": {
                month: int((selected_months == month).sum())
                for month in sorted(set(selected_months))
            },
        }

    result["elapsed_seconds"] = round(time.perf_counter() - started, 3)
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-url", default=os.getenv("DATABASE_URL"))
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/validated/evaluation.json"),
    )
    args = parser.parse_args()
    if not args.database_url:
        raise SystemExit("DATABASE_URL is required")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(evaluate(args.database_url), indent=2) + "\n")


if __name__ == "__main__":
    main()
