-- This is the only monitoring relation intended for the free-tier hosted demo.
-- It contains source-level aggregates only; no event-level rows are copied here.
CREATE TABLE IF NOT EXISTS risk.public_demo_monitoring (
  source_file TEXT PRIMARY KEY,
  event_count BIGINT NOT NULL CHECK (event_count >= 0),
  fraud_count BIGINT NOT NULL CHECK (fraud_count >= 0 AND fraud_count <= event_count),
  fraud_rate NUMERIC(8, 6) NOT NULL CHECK (fraud_rate >= 0 AND fraud_rate <= 1),
  first_event_at TIMESTAMPTZ NOT NULL,
  last_event_at TIMESTAMPTZ NOT NULL CHECK (last_event_at >= first_event_at),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE risk.public_demo_monitoring ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON risk.public_demo_monitoring FROM PUBLIC;
GRANT SELECT ON risk.public_demo_monitoring TO risk_api;
