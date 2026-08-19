import type { EventPage } from "@/lib/monitoring";
import Link from "next/link";
import styles from "./page.module.css";

export type EventQuery = {
  merchant?: string;
  category?: string;
  source_file?: string;
  is_fraud?: string;
  min_amount?: string;
  max_amount?: string;
  from_ts?: string;
  to_ts?: string;
  limit?: string;
  cursor?: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const timestamp = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function pageHref(query: EventQuery, cursor?: string) {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, cursor })) {
    if (value) parameters.set(key, value);
  }
  return `/?${parameters}#queue`;
}

export function EventExplorer({
  page,
  query,
}: {
  page: EventPage | null;
  query: EventQuery;
}) {
  return (
    <section className={styles.eventExplorer} aria-labelledby="event-query-title" id="queue">
      <div className={styles.sectionLead}>
        <p className={styles.kicker}>CONTROL 01 / PUBLIC EVENT QUERY</p>
        <h2 id="event-query-title">Complete simulated event register</h2>
        <p>
          Query every allowlisted event row. Results are read-only, ordered by event time, and
          limited to 100 rows per request.
        </p>
      </div>

      <form className={styles.queryForm} method="get" action="/#queue">
        <label>
          Merchant, exact
          <input name="merchant" defaultValue={query.merchant} placeholder="fraud_Kirlin and Sons" />
        </label>
        <label>
          Category, exact
          <input name="category" defaultValue={query.category} placeholder="grocery_pos" />
        </label>
        <label>
          Source partition
          <select name="source_file" defaultValue={query.source_file ?? ""}>
            <option value="">All partitions</option>
            <option value="fraudTrain.csv">fraudTrain</option>
            <option value="fraudTest.csv">fraudTest</option>
          </select>
        </label>
        <label>
          Fraud label
          <select name="is_fraud" defaultValue={query.is_fraud ?? ""}>
            <option value="">All labels</option>
            <option value="true">Labelled fraud</option>
            <option value="false">Not labelled fraud</option>
          </select>
        </label>
        <label>
          Minimum amount
          <input name="min_amount" type="number" min="0" step="0.01" defaultValue={query.min_amount} placeholder="0.00" />
        </label>
        <label>
          Maximum amount
          <input name="max_amount" type="number" min="0" step="0.01" defaultValue={query.max_amount} placeholder="No maximum" />
        </label>
        <label>
          Rows per page
          <select name="limit" defaultValue={query.limit ?? "25"}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
        <div className={styles.queryActions}>
          <button type="submit">Run query</button>
          <Link href="/#queue">Clear</Link>
        </div>
      </form>

      {page === null ? (
        <div className={styles.queryState} role="alert">
          <strong>Event query unavailable</strong>
          <span>The public event view could not be read. Aggregate evidence remains unchanged.</span>
        </div>
      ) : (
        <>
          <div className={styles.querySummary} aria-live="polite">
            <span><strong>{page.dataset_rows.toLocaleString("en-US")}</strong> public event rows</span>
            <span>{page.returned_rows} returned</span>
            <span>identity-like source columns excluded</span>
          </div>
          {page.events.length ? (
            <div className={styles.eventTableWrap}>
              <table className={styles.eventTable}>
                <thead>
                  <tr>
                    <th>Event time, UTC</th>
                    <th>Event ID</th>
                    <th>Merchant / category</th>
                    <th>Amount</th>
                    <th>Fraud label</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {page.events.map((event) => (
                    <tr key={event.event_id}>
                      <td data-label="Event time">{timestamp.format(new Date(event.event_ts))}</td>
                      <td data-label="Event ID"><code title={event.event_id}>{event.event_id.slice(0, 12)}</code></td>
                      <td data-label="Merchant / category"><strong>{event.merchant}</strong><span>{event.category}</span></td>
                      <td data-label="Amount">{currency.format(event.amount)}</td>
                      <td data-label="Fraud label"><span className={event.is_fraud ? styles.fraudYes : styles.fraudNo}>{event.is_fraud ? "YES" : "NO"}</span></td>
                      <td data-label="Source">{event.source_file.replace(".csv", "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.queryState}>
              <strong>No rows match this query</strong>
              <span>Change or clear a filter. The underlying public dataset remains available.</span>
            </div>
          )}
          <nav className={styles.pagination} aria-label="Event query pagination">
            <Link href={pageHref(query)}>First page</Link>
            {page.has_more && page.next_cursor ? (
              <Link href={pageHref(query, page.next_cursor)}>Next {query.limit ?? "25"} rows</Link>
            ) : (
              <span>End of result set</span>
            )}
          </nav>
        </>
      )}
    </section>
  );
}
