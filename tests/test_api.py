from __future__ import annotations

import os
import unittest

import psycopg
from fastapi.testclient import TestClient


@unittest.skipUnless(os.environ.get("DATABASE_URL"), "DATABASE_URL is required")
class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with (
            psycopg.connect(os.environ["DATABASE_URL"]) as connection,
            connection.cursor() as cursor,
        ):
            if not connection.execute("SELECT count(*) FROM risk.events").fetchone()[0]:
                cursor.executemany(
                    """
                    INSERT INTO risk.events
                      (event_id, event_ts, merchant, category, amount, is_fraud,
                       source_file, source_sha256)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [
                        (
                            "test-event-1",
                            "2020-01-01T12:00:00Z",
                            "fraud_Test One",
                            "test",
                            10,
                            False,
                            "fraudTrain.csv",
                            "test-sha",
                        ),
                        (
                            "test-event-2",
                            "2020-01-02T12:00:00Z",
                            "fraud_Test Two",
                            "test",
                            20,
                            True,
                            "fraudTrain.csv",
                            "test-sha",
                        ),
                        (
                            "test-event-3",
                            "2020-01-03T12:00:00Z",
                            "fraud_Test Three",
                            "other",
                            30,
                            False,
                            "fraudTest.csv",
                            "test-sha",
                        ),
                    ],
                )
            if not connection.execute(
                "SELECT count(*) FROM risk.public_event_store"
            ).fetchone()[0]:
                cursor.executemany(
                    "INSERT INTO risk.public_merchants (merchant_id, merchant) VALUES (%s, %s)",
                    [(1, "fraud_Test One"), (2, "fraud_Test Two"), (3, "fraud_Test Three")],
                )
                cursor.executemany(
                    "INSERT INTO risk.public_categories (category_id, category) VALUES (%s, %s)",
                    [(1, "other"), (2, "test")],
                )
                cursor.executemany(
                    """
                    INSERT INTO risk.public_event_store
                      (event_id, event_ts, merchant_id, category_id, amount_cents,
                       is_fraud, source_partition)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    [
                        (1, "2020-01-01T12:00:00Z", 1, 2, 1000, False, False),
                        (2, "2020-01-02T12:00:00Z", 2, 2, 2000, True, False),
                        (3, "2020-01-03T12:00:00Z", 3, 1, 3000, False, True),
                    ],
                )
            if not connection.execute(
                "SELECT count(*) FROM risk.public_demo_monitoring"
            ).fetchone()[0]:
                cursor.executemany(
                    """
                    INSERT INTO risk.public_demo_monitoring
                      (source_file, event_count, fraud_count, fraud_rate,
                       first_event_at, last_event_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    [
                        ("fraudTrain.csv", 2, 1, 0.5, "2020-01-01", "2020-01-02"),
                        ("fraudTest.csv", 1, 0, 0, "2020-01-03", "2020-01-03"),
                    ],
                )

    def test_public_health_monitoring_and_evaluation(self) -> None:
        from src.api import app

        with TestClient(app) as client:
            self.assertEqual(client.get("/health").json(), {"status": "ok"})
            monitoring = client.get("/v1/monitoring")
            evaluation = client.get("/v1/evaluation")
        self.assertEqual(monitoring.status_code, 200)
        self.assertIn("row-level simulated events", monitoring.json()["scope"])
        self.assertEqual(len(monitoring.json()["sources"]), 2)
        self.assertEqual(evaluation.status_code, 200)
        self.assertEqual(set(evaluation.json()["models"]), {"baseline", "challenger"})

    def test_event_query_pagination_filters_and_detail(self) -> None:
        from src.api import app

        with TestClient(app) as client:
            first = client.get("/v1/events", params={"limit": 2})
            self.assertEqual(first.status_code, 200)
            page = first.json()
            self.assertEqual(page["returned_rows"], 2)
            self.assertEqual(len(page["events"]), 2)
            self.assertGreaterEqual(page["dataset_rows"], 3)
            self.assertTrue(page["has_more"])
            self.assertTrue(page["next_cursor"])

            second = client.get(
                "/v1/events", params={"limit": 2, "cursor": page["next_cursor"]}
            )
            self.assertEqual(second.status_code, 200)
            self.assertNotEqual(
                page["events"][0]["event_id"], second.json()["events"][0]["event_id"]
            )

            fraud = client.get("/v1/events", params={"limit": 5, "is_fraud": True})
            self.assertEqual(fraud.status_code, 200)
            self.assertTrue(all(event["is_fraud"] for event in fraud.json()["events"]))

            event_id = page["events"][0]["event_id"]
            detail = client.get(f"/v1/events/{event_id}")
            self.assertEqual(detail.status_code, 200)
            self.assertEqual(detail.json()["event_id"], event_id)
            self.assertEqual(
                set(detail.json()),
                {
                    "event_id",
                    "event_ts",
                    "merchant",
                    "category",
                    "amount",
                    "is_fraud",
                    "source_file",
                },
            )

    def test_event_query_fails_closed_on_invalid_bounds(self) -> None:
        from src.api import app

        with TestClient(app) as client:
            self.assertEqual(
                client.get("/v1/events", params={"cursor": "not-a-cursor"}).status_code,
                400,
            )
            self.assertEqual(
                client.get(
                    "/v1/events", params={"min_amount": 100, "max_amount": 10}
                ).status_code,
                400,
            )
            self.assertEqual(
                client.get("/v1/events", params={"limit": 101}).status_code, 422
            )
            self.assertEqual(
                client.get(
                    "/v1/events", params={"source_file": "unapproved.csv"}
                ).status_code,
                422,
            )


if __name__ == "__main__":
    unittest.main()
