CREATE TABLE IF NOT EXISTS risk.public_merchants (
  merchant_id SMALLINT PRIMARY KEY,
  merchant TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS risk.public_categories (
  category_id SMALLINT PRIMARY KEY,
  category TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS risk.public_event_store (
  event_id INTEGER PRIMARY KEY,
  event_ts TIMESTAMPTZ NOT NULL,
  merchant_id SMALLINT NOT NULL REFERENCES risk.public_merchants (merchant_id),
  category_id SMALLINT NOT NULL REFERENCES risk.public_categories (category_id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  is_fraud BOOLEAN NOT NULL,
  source_partition BOOLEAN NOT NULL
);

DO $$
BEGIN
  IF to_regclass('risk.events') IS NOT NULL THEN
    EXECUTE $sql$
      INSERT INTO risk.public_merchants (merchant_id, merchant)
      SELECT ROW_NUMBER() OVER (ORDER BY merchant)::SMALLINT, merchant
      FROM (SELECT DISTINCT merchant FROM risk.events) AS merchants
      ON CONFLICT DO NOTHING
    $sql$;

    EXECUTE $sql$
      INSERT INTO risk.public_categories (category_id, category)
      SELECT ROW_NUMBER() OVER (ORDER BY category)::SMALLINT, category
      FROM (SELECT DISTINCT category FROM risk.events) AS categories
      ON CONFLICT DO NOTHING
    $sql$;

    EXECUTE $sql$
      INSERT INTO risk.public_event_store (
        event_id,
        event_ts,
        merchant_id,
        category_id,
        amount_cents,
        is_fraud,
        source_partition
      )
      SELECT
        ROW_NUMBER() OVER (ORDER BY events.event_ts, events.event_id)::INTEGER,
        events.event_ts,
        merchants.merchant_id,
        categories.category_id,
        ROUND(events.amount * 100)::INTEGER,
        events.is_fraud,
        events.source_file = 'fraudTest.csv'
      FROM risk.events AS events
      JOIN risk.public_merchants AS merchants USING (merchant)
      JOIN risk.public_categories AS categories USING (category)
      ON CONFLICT DO NOTHING
    $sql$;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS public_event_store_merchant_idx
  ON risk.public_event_store (merchant_id, event_id);
CREATE INDEX IF NOT EXISTS public_event_store_category_idx
  ON risk.public_event_store (category_id, event_id);
CREATE INDEX IF NOT EXISTS public_event_store_source_idx
  ON risk.public_event_store (source_partition, event_id);
CREATE INDEX IF NOT EXISTS public_event_store_fraud_idx
  ON risk.public_event_store (event_id) WHERE is_fraud;

ALTER TABLE risk.public_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk.public_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk.public_event_store ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON risk.public_merchants FROM PUBLIC;
REVOKE ALL ON risk.public_categories FROM PUBLIC;
REVOKE ALL ON risk.public_event_store FROM PUBLIC;

GRANT SELECT ON risk.public_merchants TO risk_api;
GRANT SELECT ON risk.public_categories TO risk_api;
GRANT SELECT ON risk.public_event_store TO risk_api;

DROP POLICY IF EXISTS api_reader_can_read_merchants ON risk.public_merchants;
CREATE POLICY api_reader_can_read_merchants ON risk.public_merchants
  FOR SELECT TO risk_api USING (true);
DROP POLICY IF EXISTS api_reader_can_read_categories ON risk.public_categories;
CREATE POLICY api_reader_can_read_categories ON risk.public_categories
  FOR SELECT TO risk_api USING (true);
DROP POLICY IF EXISTS api_reader_can_read_events ON risk.public_event_store;
CREATE POLICY api_reader_can_read_events ON risk.public_event_store
  FOR SELECT TO risk_api USING (true);

DROP VIEW IF EXISTS risk.public_events;
CREATE VIEW risk.public_events
WITH (security_invoker = true) AS
SELECT
  events.event_id,
  events.event_ts,
  merchants.merchant,
  categories.category,
  (events.amount_cents::NUMERIC / 100)::NUMERIC(14, 2) AS amount,
  events.is_fraud,
  CASE WHEN events.source_partition THEN 'fraudTest.csv' ELSE 'fraudTrain.csv' END AS source_file
FROM risk.public_event_store AS events
JOIN risk.public_merchants AS merchants USING (merchant_id)
JOIN risk.public_categories AS categories USING (category_id);

REVOKE ALL ON risk.public_events FROM PUBLIC;
GRANT SELECT ON risk.public_events TO risk_api;
