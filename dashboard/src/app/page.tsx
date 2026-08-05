/*
THESIS: An audit-room dashboard makes the evidence and its boundary equally visible; it refuses the startup-hero and KPI-tile template.
OWN-WORLD: cool paper, ink rules, teal flow marks, and compact system sans; charts and lineage are the decoration.
STORY: a reviewer sees what was processed locally, what is hosted safely, how the model was evaluated, and what the demonstration refuses to do.
FIRST VIEWPORT: deployment status and boundary sit above a large evidence statement; the synthetic-stream control begins the operational reading path.
FORM: evidence dossier, with a live queue inset and an evaluation annex.
*/
import styles from "./page.module.css";
import { Simulation } from "./simulation";
import { getEvaluation, getMonitoring, type Evaluation, type Monitoring } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

const integer = new Intl.NumberFormat("en-US");
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const date = (value: string) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(value));

function Lineage() {
  return <section className={styles.lineage} aria-labelledby="lineage-title">
    <div className={styles.sectionLead}><p className={styles.kicker}>Data boundary</p><h2 id="lineage-title">One workflow, two deliberately different data zones</h2><p>The complete simulated source is processed locally. Public hosting is limited to source-level aggregates and fixed evaluation evidence.</p></div>
    <ol className={styles.flow}>
      <li><strong>1. Local source</strong><span>1,852,394 simulated events; raw fields never leave local processing.</span></li>
      <li><strong>2. Governed pipeline</strong><span>Validation, point-in-time features, and chronological evaluation run locally.</span></li>
      <li><strong>3. Approved publication</strong><span>Two aggregate monitoring rows and precomputed evaluation evidence only.</span></li>
      <li><strong>4. Public dashboard</strong><span>Aggregate evidence plus deterministic browser-generated demonstration signals.</span></li>
    </ol>
    <p className={styles.refusal}><strong>Not available here:</strong> raw source, event-level records, identifiers, personal data, scores, scoring endpoints, payment decisions, or payment-processing behavior.</p>
  </section>;
}

function CalibrationChart({ evaluation }: { evaluation: Evaluation }) {
  const bins = evaluation.models.baseline.calibration_bins.filter((bin) => bin.observed_rate !== null);
  const points = bins.map((bin) => `${30 + bin.low * 300},${190 - Math.min((bin.observed_rate ?? 0) / 0.6, 1) * 160}`).join(" ");
  return <article className={styles.chartPanel}>
    <div className={styles.chartHeading}><div><p className={styles.kicker}>Calibration</p><h3>Predicted bands vs observed fraud rate</h3></div><span>Baseline only</span></div>
    <svg viewBox="0 0 360 230" role="img" aria-label="Baseline calibration chart. Most events are in the zero to ten percent predicted-risk bin with a 0.3 percent observed fraud rate; the ten to twenty percent bin shows a 51.7 percent observed rate.">
      <line x1="30" y1="30" x2="30" y2="190" className={styles.axis} /><line x1="30" y1="190" x2="330" y2="190" className={styles.axis} />
      <line x1="30" y1="163" x2="330" y2="163" className={styles.gridline} /><line x1="30" y1="110" x2="330" y2="110" className={styles.gridline} /><line x1="30" y1="57" x2="330" y2="57" className={styles.gridline} />
      <line x1="30" y1="190" x2="330" y2="30" className={styles.expected} /><polyline points={points} className={styles.calibrationLine} />
      {bins.map((bin) => <circle key={bin.low} cx={30 + bin.low * 300} cy={190 - Math.min((bin.observed_rate ?? 0) / 0.6, 1) * 160} r="4" className={styles.calibrationPoint}><title>{`${Math.round(bin.low * 100)}–${Math.round(bin.high * 100)}% predicted; ${percent.format(bin.observed_rate ?? 0)} observed; ${integer.format(bin.count)} events`}</title></circle>)}
      <text x="30" y="214">0% predicted</text><text x="278" y="214">100% predicted</text><text x="2" y="35">60%</text><text x="2" y="194">0%</text>
    </svg>
    <p>The dashed diagonal is perfect calibration. This baseline is uneven: predicted-risk bands should not be read as well-calibrated probabilities without further work.</p>
  </article>;
}

function VolumeChart({ evaluation }: { evaluation: Evaluation }) {
  const data = Object.entries(evaluation.models.baseline.alert_volume_by_month);
  const max = Math.max(...data.map(([, value]) => value));
  return <article className={styles.chartPanel}>
    <div className={styles.chartHeading}><div><p className={styles.kicker}>Review capacity</p><h3>Monthly alerts at the fixed 1% queue</h3></div><span>{integer.format(evaluation.models.baseline.alert_volume)} total</span></div>
    <div className={styles.barChart} role="img" aria-label={`Monthly baseline alert volume ranges from ${integer.format(Math.min(...data.map(([, value]) => value)))} to ${integer.format(max)} alerts at a fixed one percent review rate.`}>
      {data.map(([month, volume]) => <div className={styles.barItem} key={month}><div className={styles.barTrack}><span style={{ height: `${(volume / max) * 100}%` }} /></div><strong>{integer.format(volume)}</strong><small>{date(`${month}-01`)}</small></div>)}
    </div>
    <p>The review-rate constraint stays fixed; volume changes with the chronological holdout distribution. This is workload evidence, not a forecast.</p>
  </article>;
}

function EvaluationSection({ evaluation }: { evaluation: Evaluation }) {
  const baseline = evaluation.models.baseline;
  const challenger = evaluation.models.challenger;
  const rows = [["PR-AUC", baseline.pr_auc, challenger.pr_auc, "Ranks rare fraud outcomes; higher is better."], ["Recall at 1% review", baseline.recall_at_review_rate, challenger.recall_at_review_rate, "Fraud cases surfaced within the fixed review queue; higher is better."], ["Brier score", baseline.brier_score, challenger.brier_score, "Probability error; lower is better."]];
  return <section className={styles.evaluation} aria-labelledby="evaluation-title">
    <div className={styles.sectionLead}><p className={styles.kicker}>Evaluation annex</p><h2 id="evaluation-title">The baseline wins the stated constraint. That does not make it production-ready.</h2><p>Models train on the earlier simulated source partition and are evaluated on the later partition. The baseline is ordinary logistic regression. The so-called challenger is the same model family with class weighting—not a substantially different approach.</p></div>
    <div className={styles.comparison}>
      <div className={styles.modelLabel}><strong>Baseline</strong><span>Logistic regression</span></div><div className={styles.modelLabel}><strong>Challenger</strong><span>Class-weighted logistic regression</span></div>
      {rows.map(([label, base, challenge, meaning]) => <div className={styles.compareRow} key={String(label)}><div><strong>{label}</strong><span>{meaning}</span></div><b>{typeof base === "number" && String(label).includes("Brier") ? base.toFixed(3) : percent.format(Number(base))}</b><b>{typeof challenge === "number" && String(label).includes("Brier") ? challenge.toFixed(3) : percent.format(Number(challenge))}</b></div>)}
    </div>
    <div className={styles.charts}><CalibrationChart evaluation={evaluation} /><VolumeChart evaluation={evaluation} /></div>
    <p className={styles.limits}><strong>Limits:</strong> simulated source; one chronological split; only amount, merchant, and category inputs; no fairness analysis; no threshold-policy validation; no live scoring; no evidence for automated or real payment decisions.</p>
  </section>;
}

function Dashboard({ monitoring, evaluation }: { monitoring: Monitoring; evaluation: Evaluation }) {
  const totals = monitoring.sources.reduce((sum, source) => ({ events: sum.events + source.event_count, fraud: sum.fraud + source.fraud_count }), { events: 0, fraud: 0 });
  const coverage = monitoring.sources.flatMap((source) => [source.first_event_at, source.last_event_at]);
  return <main className={styles.shell}>
    <header className={styles.header}><a href="#evidence" className={styles.wordmark}>Payments risk / evidence desk</a><span className={styles.status}><i /> Deployed analyst-triage demonstration</span></header>
    <section className={styles.intro}><div><p className={styles.kicker}>Aggregate monitoring · precomputed evaluation · synthetic interaction</p><h1>See the evidence.<br />See the boundary.</h1></div><p>Built from a locally processed, simulated fraud source. The public experience explains the evaluation and lets you inspect a safe generated review stream—without pretending to be a payment system.</p></section>
    <section className={styles.facts} aria-label="Evidence summary"><div><span>Local source processed</span><strong>1.85m</strong><small>simulated events, never hosted as records</small></div><div><span>Public monitoring</span><strong>{integer.format(totals.events)}</strong><small>events represented in two approved aggregates</small></div><div><span>Chronological holdout</span><strong>{percent.format(evaluation.review_rate)}</strong><small>{integer.format(evaluation.models.baseline.alert_volume)} baseline alerts held to review</small></div><div><span>Coverage</span><strong>{date(coverage[0])}</strong><small>through {date(coverage.at(-1) ?? coverage[0])}</small></div></section>
    <Simulation />
    <Lineage />
    <EvaluationSection evaluation={evaluation} />
    <section className={styles.ledger} id="evidence"><div className={styles.sectionLead}><p className={styles.kicker}>Published monitoring evidence</p><h2>Two source-level aggregates—not a full-data browser view</h2><p>The compact published ledger proves lineage and coverage while keeping the local event source outside the public boundary.</p></div><div className={styles.table} role="table" aria-label="Approved aggregate source partitions"><div className={styles.tableRow + " " + styles.tableHeader} role="row"><span>Source partition</span><span>Events</span><span>Labelled fraud rate</span><span>Period</span></div>{monitoring.sources.map((source) => <div className={styles.tableRow} role="row" key={source.source_file}><span>{source.source_file.replace(".csv", "")}</span><span>{integer.format(source.event_count)}</span><span>{percent.format(source.fraud_rate)}</span><span>{date(source.first_event_at)} — {date(source.last_event_at)}</span></div>)}</div></section>
    <footer className={styles.footer}><span>Hosted: aggregate monitoring + evaluation evidence</span><span>Local only: raw simulated source + full pipeline</span></footer>
  </main>;
}

async function getDashboardData(): Promise<{ status: "ready"; monitoring: Monitoring; evaluation: Evaluation } | { status: "unavailable" }> { try { const [monitoring, evaluation] = await Promise.all([getMonitoring(), getEvaluation()]); return { status: "ready", monitoring, evaluation }; } catch { return { status: "unavailable" }; } }

function EmptyDashboard() { return <main className={styles.fallback}><p className={styles.kicker}>No approved aggregates</p><h1>There is no published monitoring evidence to display.</h1><p>This empty state does not reveal local source records. A publication owner must verify an approved aggregate refresh before the dashboard can show coverage.</p></main>; }

export default async function Home() { const data = await getDashboardData(); if (data.status === "unavailable") return <main className={styles.fallback}><p className={styles.kicker}>Service unavailable</p><h1>Aggregate evidence is temporarily unavailable.</h1><p>The dashboard does not fall back to local or raw transactions. Try again after the protected aggregate service recovers.</p></main>; if (data.monitoring.sources.length === 0) return <EmptyDashboard />; return <Dashboard monitoring={data.monitoring} evaluation={data.evaluation} />; }
