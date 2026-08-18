from __future__ import annotations

import os
import unittest

import psycopg
from fastapi.testclient import TestClient


@unittest.skipUnless(os.environ.get("DATABASE_URL"), "DATABASE_URL is required")
class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with psycopg.connect(os.environ["DATABASE_URL"]) as connection:
            existing = connection.execute(
                "SELECT count(*) FROM risk.public_demo_monitoring"
            ).fetchone()[0]
            if existing:
                return
            connection.executemany(
                """
                INSERT INTO risk.public_demo_monitoring
                  (source_file, event_count, fraud_count, fraud_rate, first_event_at, last_event_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (source_file) DO UPDATE SET
                  event_count = EXCLUDED.event_count,
                  fraud_count = EXCLUDED.fraud_count,
                  fraud_rate = EXCLUDED.fraud_rate,
                  first_event_at = EXCLUDED.first_event_at,
                  last_event_at = EXCLUDED.last_event_at
                """,
                [
                    ("fraudTrain.csv", 100, 1, 0.01, "2020-01-01", "2020-01-31"),
                    ("fraudTest.csv", 50, 1, 0.02, "2020-02-01", "2020-02-29"),
                ],
            )

    def test_health_and_aggregate_contracts(self) -> None:
        os.environ["API_KEY"] = "test-api-key"
        from src.api import app

        with TestClient(app) as client:
            self.assertEqual(client.get("/health").json(), {"status": "ok"})
            self.assertEqual(client.get("/v1/monitoring").status_code, 401)
            response = client.get("/v1/monitoring", headers={"X-API-Key": "test-api-key"})
            evaluation = client.get("/v1/evaluation", headers={"X-API-Key": "test-api-key"})
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("aggregate analyst triage only", payload["scope"])
        self.assertEqual(len(payload["sources"]), 2)
        self.assertNotIn("event_id", str(payload))
        self.assertEqual(evaluation.status_code, 200)
        self.assertEqual(set(evaluation.json()["models"]), {"baseline", "challenger"})
        self.assertNotIn("event_id", str(evaluation.json()))
