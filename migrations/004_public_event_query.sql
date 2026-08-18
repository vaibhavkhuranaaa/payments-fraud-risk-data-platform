CREATE INDEX IF NOT EXISTS events_time_idx
  ON risk.events (event_ts, event_id);

CREATE INDEX IF NOT EXISTS events_source_time_idx
  ON risk.events (source_file, event_ts, event_id);

CREATE INDEX IF NOT EXISTS events_fraud_time_idx
  ON risk.events (event_ts, event_id)
  WHERE is_fraud;

CREATE OR REPLACE VIEW risk.public_events
WITH (security_barrier = true) AS
SELECT
  event_id,
  event_ts,
  merchant,
  category,
  amount,
  is_fraud,
  source_file
FROM risk.events;

REVOKE ALL ON risk.public_events FROM PUBLIC;
GRANT SELECT ON risk.public_events TO risk_api;
