CREATE SCHEMA IF NOT EXISTS risk;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA risk FROM PUBLIC;

CREATE TABLE IF NOT EXISTS risk.schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk.ingestion_runs (
  run_id UUID PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_version INTEGER NOT NULL,
  source_sha256 TEXT NOT NULL,
  source_file TEXT NOT NULL,
  input_rows INTEGER NOT NULL CHECK (input_rows > 0),
  inserted_rows INTEGER NOT NULL CHECK (inserted_rows >= 0),
  status TEXT NOT NULL CHECK (status IN ('completed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_sha256, source_file)
);

CREATE TABLE IF NOT EXISTS risk.events (
  event_id TEXT PRIMARY KEY,
  event_ts TIMESTAMPTZ NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  is_fraud BOOLEAN NOT NULL,
  source_file TEXT NOT NULL,
  source_sha256 TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_sha256, event_id)
);

CREATE INDEX IF NOT EXISTS events_merchant_time_idx ON risk.events (merchant, event_ts, event_id);
CREATE INDEX IF NOT EXISTS events_category_time_idx ON risk.events (category, event_ts, event_id);

CREATE OR REPLACE VIEW risk.event_features AS
SELECT
  event_id,
  event_ts,
  merchant,
  category,
  amount,
  is_fraud,
  source_file,
  source_sha256,
  COUNT(*) OVER merchant_prior AS merchant_prior_transaction_count,
  COALESCE(AVG(amount) OVER merchant_prior, 0) AS merchant_prior_amount_mean,
  COUNT(*) OVER category_prior AS category_prior_transaction_count
FROM risk.events
WINDOW
  merchant_prior AS (PARTITION BY merchant ORDER BY event_ts, event_id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),
  category_prior AS (PARTITION BY category ORDER BY event_ts, event_id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING);

CREATE OR REPLACE VIEW risk.public_monitoring_summary AS
SELECT
  source_file,
  COUNT(*) AS event_count,
  SUM(is_fraud::INTEGER) AS fraud_count,
  ROUND(AVG(is_fraud::INTEGER)::NUMERIC, 6) AS fraud_rate,
  MIN(event_ts) AS first_event_at,
  MAX(event_ts) AS last_event_at
FROM risk.events
GROUP BY source_file;

ALTER TABLE risk.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk.ingestion_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA risk FROM PUBLIC;
