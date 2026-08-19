CREATE OR REPLACE VIEW risk.public_events AS
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
