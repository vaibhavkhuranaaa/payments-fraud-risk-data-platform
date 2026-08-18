from __future__ import annotations

import unittest

import numpy as np

from scripts.evaluate_models import FEATURE_COLUMNS, recall_at_rate


class EvaluationTests(unittest.TestCase):
    def test_recall_at_rate_uses_the_highest_scores(self) -> None:
        labels = np.array([1, 0, 1, 0])
        scores = np.array([0.9, 0.8, 0.7, 0.1])

        self.assertEqual(recall_at_rate(labels, scores, rate=0.5), 0.5)

    def test_evaluation_contract_includes_point_in_time_features(self) -> None:
        self.assertIn("merchant_prior_transaction_count", FEATURE_COLUMNS)
        self.assertIn("merchant_prior_amount_mean", FEATURE_COLUMNS)
        self.assertIn("category_prior_transaction_count", FEATURE_COLUMNS)


if __name__ == "__main__":
    unittest.main()
