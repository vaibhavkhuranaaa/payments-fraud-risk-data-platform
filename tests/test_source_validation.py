from __future__ import annotations

import csv
import tempfile
import unittest
from pathlib import Path

from scripts.validate_sparkov_source import EXPECTED_COLUMNS, profile


class SourceValidationTests(unittest.TestCase):
    def test_schema_drift_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "drifted.csv"
            with path.open("w", newline="", encoding="utf-8") as target:
                writer = csv.DictWriter(target, fieldnames=["amt", "is_fraud"])
                writer.writeheader()
                writer.writerow({"amt": "10.00", "is_fraud": "0"})

            with self.assertRaisesRegex(ValueError, "source schema drifted"):
                profile(path)

    def test_null_allowlisted_field_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "null.csv"
            with path.open("w", newline="", encoding="utf-8") as target:
                writer = csv.DictWriter(target, fieldnames=EXPECTED_COLUMNS)
                writer.writeheader()
                row = {column: "value" for column in EXPECTED_COLUMNS}
                row.update(
                    {
                        "": "0",
                        "trans_date_trans_time": "2020-01-01 00:00:00",
                        "merchant": "",
                        "category": "grocery",
                        "amt": "10.00",
                        "is_fraud": "0",
                    }
                )
                writer.writerow(row)

            with self.assertRaisesRegex(ValueError, "null values"):
                profile(path)


if __name__ == "__main__":
    unittest.main()
