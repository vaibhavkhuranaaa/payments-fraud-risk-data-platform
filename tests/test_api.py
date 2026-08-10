from __future__ import annotations

import os
import unittest

from fastapi.testclient import TestClient


@unittest.skipUnless(os.environ.get("DATABASE_URL"), "DATABASE_URL is required")
class ApiTests(unittest.TestCase):
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
