-- A provider operator creates the LOGIN credential outside this repository and grants this role.
-- The API can read only aggregate views; operational ingestion continues under a separate role.
DO $$
BEGIN
  CREATE ROLE risk_api NOLOGIN;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

GRANT USAGE ON SCHEMA risk TO risk_api;
GRANT SELECT ON risk.public_monitoring_summary TO risk_api;
