from __future__ import annotations

import os
import unittest

import psycopg


@unittest.skipUnless(os.environ.get("DATABASE_URL"), "DATABASE_URL is required")
class PostgresContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        url = os.environ.get("DATABASE_URL")
        if not url:
            raise unittest.SkipTest(
                "DATABASE_URL is required for PostgreSQL integration tests"
            )
        cls.connection = psycopg.connect(url)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.connection.close()

    def test_schema_excludes_prohibited_source_fields(self) -> None:
        columns = {
            row[0]
            for row in self.connection.execute(
                "SELECT column_name FROM information_schema.columns WHERE table_schema = 'risk' AND table_name = 'events'"
            ).fetchall()
        }
        prohibited = {
            "cc_num",
            "first",
            "last",
            "gender",
            "street",
            "city",
            "state",
            "zip",
            "lat",
            "long",
            "dob",
            "trans_num",
            "unix_time",
        }
        self.assertFalse(columns & prohibited)
        self.assertTrue(
            {"event_id", "event_ts", "merchant", "category", "amount", "is_fraud"}
            <= columns
        )

    def test_public_event_view_exposes_only_allowlisted_analytical_fields(self) -> None:
        public_columns = {
            row[0]
            for row in self.connection.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'risk' AND table_name = 'public_events'"
            ).fetchall()
        }
        self.assertEqual(
            public_columns,
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

    def test_api_reader_role_reads_public_view_not_governed_table(self) -> None:
        can_read_publication, can_read_public_events, can_read_store, can_read_events = (
            self.connection.execute(
                "SELECT has_table_privilege('risk_api', 'risk.public_demo_monitoring', 'SELECT'), "
                "has_table_privilege('risk_api', 'risk.public_events', 'SELECT'), "
                "has_table_privilege('risk_api', 'risk.public_event_store', 'SELECT'), "
                "has_table_privilege('risk_api', 'risk.events', 'SELECT')"
            ).fetchone()
        )
        self.assertTrue(can_read_publication)
        self.assertTrue(can_read_public_events)
        self.assertTrue(can_read_store)
        self.assertFalse(can_read_events)

    def test_public_event_view_is_read_only(self) -> None:
        can_insert, can_update, can_delete = self.connection.execute(
            "SELECT has_table_privilege('risk_api', 'risk.public_events', 'INSERT'), "
            "has_table_privilege('risk_api', 'risk.public_events', 'UPDATE'), "
            "has_table_privilege('risk_api', 'risk.public_events', 'DELETE')"
        ).fetchone()
        self.assertFalse(can_insert or can_update or can_delete)


@unittest.skipUnless(
    os.environ.get("DATABASE_URL") and os.environ.get("FULL_DATA_VALIDATION") == "1",
    "full approved source validation requires DATABASE_URL and FULL_DATA_VALIDATION=1",
)
class FullDataIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.connection = psycopg.connect(os.environ["DATABASE_URL"])

    @classmethod
    def tearDownClass(cls) -> None:
        cls.connection.close()

    def test_loaded_events_are_idempotent_and_point_in_time_features_are_complete(
        self,
    ) -> None:
        total, distinct_total = self.connection.execute(
            "SELECT count(*), count(DISTINCT event_id) FROM risk.events"
        ).fetchone()
        self.assertEqual(total, distinct_total)
        self.assertEqual(total, 1_852_394)
        self.assertEqual(
            self.connection.execute(
                "SELECT count(*) FROM risk.event_features"
            ).fetchone()[0],
            total,
        )

    def test_full_public_event_view_contains_every_allowlisted_row(self) -> None:
        self.assertEqual(
            self.connection.execute(
                "SELECT count(*) FROM risk.public_events"
            ).fetchone()[0],
            1_852_394,
        )

    def test_aggregate_monitoring_remains_available(self) -> None:
        self.assertEqual(
            self.connection.execute(
                "SELECT count(*) FROM risk.public_monitoring_summary"
            ).fetchone()[0],
            2,
        )
        self.assertEqual(
            self.connection.execute(
                "SELECT count(*) FROM risk.public_demo_monitoring"
            ).fetchone()[0],
            2,
        )


if __name__ == "__main__":
    unittest.main()
