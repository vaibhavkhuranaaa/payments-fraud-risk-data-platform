import styles from "./page.module.css";
import { getEvaluation, getMonitoring, type Evaluation, type Monitoring } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

const integer = new Intl.NumberFormat("en-US");
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 });

function date(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(value));
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className={styles.metric}><p>{label}</p><strong>{value}</strong><span>{note}</span></article>;
}

function Dashboard({ monitoring, evaluation }: { monitoring: Monitoring; evaluation: Evaluation }) {
  const totals = monitoring.sources.reduce((sum, source) => ({
    events: sum.events + source.event_count,
    fraud: sum.fraud + source.fraud_count,
  }), { events: 0, fraud: 0 });
  const baseline = evaluation.models.baseline;
  const challenger = evaluation.models.challenger;
  const coverage = monitoring.sources.flatMap((source) => [source.first_event_at, source.last_event_at]);

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div className={styles.wordmark}><span className={styles.mark} />Northstar Risk</div>
      <div className={styles.status}><span /> Analyst triage demonstration</div>
    </header>
    <section className={styles.hero}>
      <div><p className={styles.eyebrow}>Payments fraud-risk platform</p><h1>Evidence for review.<br />Not a payment decision.</h1></div>
      <p className={styles.heroNote}>A production-shaped, analyst-only example: governed PostgreSQL, a read-only FastAPI contract, and a minimal public dashboard.</p>
    </section>
    <section className={styles.metrics} aria-label="Monitoring summary">
      <Metric label="Observed transactions" value={integer.format(totals.events)} note="Approved simulated source only" />
      <Metric label="Observed fraud rate" value={percent.format(totals.fraud / totals.events)} note={`${integer.format(totals.fraud)} labelled events`} />
      <Metric label="Coverage" value={`${date(coverage[0])} — ${date(coverage.at(-1) ?? coverage[0])}`} note="Chronological source partitions" />
      <Metric label="Review capacity" value={percent.format(evaluation.review_rate)} note={`${integer.format(baseline.alert_volume)} alerts held to review`} />
    </section>
    <section className={styles.grid}>
      <article className={styles.panel}>
        <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Model evaluation</p><h2>Baseline selected</h2></div><span className={styles.pill}>Chronological holdout</span></div>
        <div className={styles.modelRows}>
          <div className={styles.modelRow}><span>PR-AUC</span><strong>{baseline.pr_auc.toFixed(3)}</strong><em>vs {challenger.pr_auc.toFixed(3)}</em></div>
          <div className={styles.modelRow}><span>Recall at review capacity</span><strong>{percent.format(baseline.recall_at_review_rate)}</strong><em>vs {percent.format(challenger.recall_at_review_rate)}</em></div>
          <div className={styles.modelRow}><span>Calibration (Brier)</span><strong>{baseline.brier_score.toFixed(3)}</strong><em>vs {challenger.brier_score.toFixed(3)}</em></div>
        </div>
        <p className={styles.caption}>The baseline wins the stated analyst-review constraint. This evidence supports prioritisation only; it does not automate outcomes.</p>
      </article>
      <article className={styles.panel}>
        <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Data governance</p><h2>Exposure is intentionally narrow</h2></div></div>
        <ul className={styles.guardrails}>
          <li><span>01</span><p>Raw source files and direct identifiers remain local.</p></li>
          <li><span>02</span><p>The dashboard receives aggregate monitoring and precomputed evaluation evidence only.</p></li>
          <li><span>03</span><p>No transaction drill-down, scoring endpoint, or payment decision workflow exists.</p></li>
        </ul>
      </article>
    </section>
    <section className={styles.sources}>
      <div><p className={styles.eyebrow}>Source ledger</p><h2>Traceable partitions</h2></div>
      <div className={styles.table} role="table" aria-label="Aggregate source partitions">
        <div className={`${styles.tableRow} ${styles.tableHeader}`} role="row"><span>Partition</span><span>Events</span><span>Fraud rate</span><span>Period</span></div>
        {monitoring.sources.map((source) => <div className={styles.tableRow} role="row" key={source.source_file}><span>{source.source_file.replace(".csv", "")}</span><span>{integer.format(source.event_count)}</span><span>{percent.format(source.fraud_rate)}</span><span>{date(source.first_event_at)} — {date(source.last_event_at)}</span></div>)}
      </div>
    </section>
    <footer className={styles.footer}><span>Local-first analytical demonstration</span><span>PostgreSQL · FastAPI · Next.js</span></footer>
  </main>;
}

async function getDashboardData(): Promise<
  | { status: "ready"; monitoring: Monitoring; evaluation: Evaluation }
  | { status: "unavailable" }
> {
  try {
    const [monitoring, evaluation] = await Promise.all([getMonitoring(), getEvaluation()]);
    return { status: "ready", monitoring, evaluation };
  } catch {
    return { status: "unavailable" };
  }
}

export default async function Home() {
  const data = await getDashboardData();
  if (data.status === "unavailable") {
    return <main className={styles.fallback}><p className={styles.eyebrow}>Risk platform</p><h1>Monitoring service is not connected.</h1><p>Start the local FastAPI service with its approved PostgreSQL connection to render aggregate evidence. The dashboard never falls back to raw transaction data.</p></main>;
  }
  return <Dashboard monitoring={data.monitoring} evaluation={data.evaluation} />;
}
