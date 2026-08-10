from __future__ import annotations

import os
import unittest

import psycopg


class PostgresIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        url = os.environ.get("DATABASE_URL")
        if not url:
            raise unittest.SkipTest("DATABASE_URL is required for PostgreSQL integration tests")
        cls.connection = psycopg.connect(url)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.connection.close()

    def test_schema_excludes_prohibited_source_fields(self) -> None:
        columns = {row[0] for row in self.connection.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'risk' AND table_name = 'events'").fetchall()}
        prohibited = {"cc_num", "first", "last", "gender", "street", "city", "state", "zip", "lat", "long", "dob", "trans_num", "unix_time"}
        self.assertFalse(columns & prohibited)
        self.assertTrue({"event_id", "event_ts", "merchant", "category", "amount", "is_fraud"} <= columns)

    def test_loaded_events_are_idempotent_and_public_view_is_aggregate_only(self) -> None:
        total, distinct_total = self.connection.execute("SELECT count(*), count(DISTINCT event_id) FROM risk.events").fetchone()
        self.assertEqual(total, distinct_total)
        self.assertEqual(total, 1_852_394)
        public_columns = {row[0] for row in self.connection.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'risk' AND table_name = 'public_monitoring_summary'").fetchall()}
        self.assertNotIn("event_id", public_columns)
        self.assertNotIn("merchant", public_columns)
        self.assertEqual(self.connection.execute("SELECT count(*) FROM risk.public_monitoring_summary").fetchone()[0], 2)

    def test_api_reader_role_is_limited_to_aggregate_monitoring(self) -> None:
        can_read_publication, can_read_events = self.connection.execute(
            "SELECT has_table_privilege('risk_api', 'risk.public_demo_monitoring', 'SELECT'), "
            "has_table_privilege('risk_api', 'risk.events', 'SELECT')"
        ).fetchone()
        self.assertTrue(can_read_publication)
        self.assertFalse(can_read_events)

    def test_hosted_publication_is_aggregate_only(self) -> None:
        columns = {
            row[0]
            for row in self.connection.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'risk' AND table_name = 'public_demo_monitoring'"
            ).fetchall()
        }
        self.assertEqual(
            columns,
            {
                "source_file",
                "event_count",
                "fraud_count",
                "fraud_rate",
                "first_event_at",
                "last_event_at",
                "published_at",
            },
        )
        self.assertEqual(
            self.connection.execute("SELECT count(*) FROM risk.public_demo_monitoring").fetchone()[0],
            2,
        )


if __name__ == "__main__":
    unittest.main()
