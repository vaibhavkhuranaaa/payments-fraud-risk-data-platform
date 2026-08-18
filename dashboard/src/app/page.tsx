import styles from "./page.module.css";
import { CapacityScenario, Simulation } from "./simulation";
import {
  getEvaluation,
  getMonitoring,
  type Evaluation,
  type Monitoring,
} from "@/lib/monitoring";

export const dynamic = "force-dynamic";

const integer = new Intl.NumberFormat("en-US");
const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const date = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
const month = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    new Date(value),
  );

function Lineage() {
  return (
    <section className={styles.lineage} aria-labelledby="lineage-title" id="boundary">
      <div className={styles.sectionLead}>
        <p className={styles.kicker}>Data boundary</p>
        <h2 id="lineage-title">One workflow, two deliberately different data zones</h2>
        <p>
          The complete simulated source is processed locally. Public hosting is limited to
          source-level aggregates and fixed evaluation evidence.
        </p>
      </div>
      <ol className={styles.flow}>
        <li>
          <strong>1. Local source</strong>
          <span>1,852,394 simulated events. Raw fields never leave local processing.</span>
        </li>
        <li>
          <strong>2. Governed pipeline</strong>
          <span>Validation, point-in-time features, and chronological evaluation run locally.</span>
        </li>
        <li>
          <strong>3. Approved publication</strong>
          <span>Two aggregate monitoring rows and precomputed evaluation evidence only.</span>
        </li>
        <li>
          <strong>4. Public dashboard</strong>
          <span>Aggregate evidence plus deterministic browser-generated signals.</span>
        </li>
      </ol>
      <p className={styles.refusal}>
        <strong>Not available here:</strong> raw source, event-level records, identifiers, personal
        data, scores, scoring endpoints, payment decisions, or payment-processing behavior.
      </p>
    </section>
  );
}

function CalibrationChart({ evaluation }: { evaluation: Evaluation }) {
  const bins = evaluation.models.baseline.calibration_bins.filter(
    (bin) => bin.observed_rate !== null,
  );
  const points = bins
    .map((bin) => `${30 + bin.low * 300},${190 - (bin.observed_rate ?? 0) * 160}`)
    .join(" ");

  return (
    <article className={styles.chartPanel}>
      <div className={styles.chartHeading}>
        <div>
          <p className={styles.kicker}>Calibration</p>
          <h3>Predicted bands vs observed fraud rate</h3>
        </div>
        <span>Baseline only</span>
      </div>
      <svg
        viewBox="0 0 360 230"
        role="img"
        aria-label="Baseline reliability chart comparing predicted-risk bands with observed fraud rates. The curve departs materially from perfect calibration."
      >
        <line x1="30" y1="30" x2="30" y2="190" className={styles.axis} />
        <line x1="30" y1="190" x2="330" y2="190" className={styles.axis} />
        <line x1="30" y1="150" x2="330" y2="150" className={styles.gridline} />
        <line x1="30" y1="110" x2="330" y2="110" className={styles.gridline} />
        <line x1="30" y1="70" x2="330" y2="70" className={styles.gridline} />
        <line x1="30" y1="190" x2="330" y2="30" className={styles.expected} />
        <polyline points={points} className={styles.calibrationLine} />
        {bins.map((bin) => (
          <circle
            key={bin.low}
            cx={30 + bin.low * 300}
            cy={190 - (bin.observed_rate ?? 0) * 160}
            r="4"
            className={styles.calibrationPoint}
          >
            <title>{`${Math.round(bin.low * 100)} to ${Math.round(bin.high * 100)}% predicted; ${percent.format(bin.observed_rate ?? 0)} observed; ${integer.format(bin.count)} events`}</title>
          </circle>
        ))}
        <text x="30" y="214">0% predicted</text>
        <text x="278" y="214">100% predicted</text>
        <text x="2" y="35">100%</text>
        <text x="2" y="194">0%</text>
      </svg>
      <p>
        The dashed diagonal is perfect calibration. The observed curve is uneven, so scores should
        not be interpreted as reliable probabilities without further calibration work.
      </p>
    </article>
  );
}

function VolumeChart({ evaluation }: { evaluation: Evaluation }) {
  const data = Object.entries(evaluation.models.baseline.alert_volume_by_month);
  const max = Math.max(...data.map(([, value]) => value));

  return (
    <article className={styles.chartPanel}>
      <div className={styles.chartHeading}>
        <div>
          <p className={styles.kicker}>Review capacity</p>
          <h3>Monthly alerts at the fixed 1% queue</h3>
        </div>
        <span>{integer.format(evaluation.models.baseline.alert_volume)} total</span>
      </div>
      <div
        className={styles.barChart}
        role="img"
        aria-label={`Monthly baseline alert volume ranges from ${integer.format(Math.min(...data.map(([, value]) => value)))} to ${integer.format(max)} alerts at a fixed one percent review rate.`}
      >
        {data.map(([period, volume]) => (
          <div className={styles.barItem} key={period}>
            <div className={styles.barTrack}>
              <span style={{ height: `${(volume / max) * 100}%` }} />
            </div>
            <strong>{integer.format(volume)}</strong>
            <small title={date(`${period}-01`)}>{month(`${period}-01`)}</small>
          </div>
        ))}
      </div>
      <p>
        Review capacity stays fixed. Monthly volume changes with the holdout distribution. This is
        retrospective workload evidence, not a forecast.
      </p>
    </article>
  );
}

function EvaluationSection({ evaluation }: { evaluation: Evaluation }) {
  const baseline = evaluation.models.baseline;
  const challenger = evaluation.models.challenger;
  const rows = [
    ["PR-AUC", baseline.pr_auc, challenger.pr_auc, "Rare-outcome ranking; higher is better."],
    [
      "Recall at 1% review",
      baseline.recall_at_review_rate,
      challenger.recall_at_review_rate,
      "Fraud labels surfaced within fixed capacity; higher is better.",
    ],
    ["Brier score", baseline.brier_score, challenger.brier_score, "Probability error; lower is better."],
  ] as const;

  return (
    <section className={styles.evaluation} aria-labelledby="evaluation-title" id="evaluation">
      <div className={styles.sectionLead}>
        <div>
          <p className={styles.kicker}>Evaluation annex</p>
          <h2 id="evaluation-title">
            The baseline wins the stated constraint. It is not production-ready.
          </h2>
        </div>
        <p>
          Both policies train on the earlier simulated partition and evaluate on the later one.
          The challenger only adds class weighting to the same logistic model family. It loses on
          every reported measure and is not promoted.
        </p>
      </div>
      <div className={styles.comparison} role="table" aria-label="Model comparison">
        <div className={styles.compareHeader} role="row">
          <div className={styles.modelLabelSpacer} role="columnheader">Measure</div>
          <div className={styles.modelLabel} role="columnheader">
            <strong>Baseline</strong>
            <span>Logistic regression</span>
          </div>
          <div className={styles.modelLabel} role="columnheader">
            <strong>Challenger</strong>
            <span>Class-weighted logistic regression</span>
          </div>
        </div>
        {rows.map(([label, base, challenge, meaning]) => (
          <div className={styles.compareRow} role="row" key={label}>
            <div role="rowheader">
              <strong>{label}</strong>
              <span>{meaning}</span>
            </div>
            <b role="cell">
              {label === "Brier score" ? base.toFixed(3) : percent.format(base)}
            </b>
            <b role="cell">
              {label === "Brier score" ? challenge.toFixed(3) : percent.format(challenge)}
            </b>
          </div>
        ))}
      </div>
      <div className={styles.charts}>
        <CalibrationChart evaluation={evaluation} />
        <VolumeChart evaluation={evaluation} />
      </div>
      <p className={styles.limits}>
        <strong>Limits:</strong> simulated source; one chronological split; allowlisted amount,
        merchant, category, and prior-history inputs; no confidence intervals, fairness analysis,
        threshold sweep, live scoring, or evidence for automated payment decisions.
      </p>
    </section>
  );
}

function Dashboard({ monitoring, evaluation }: { monitoring: Monitoring; evaluation: Evaluation }) {
  const totals = monitoring.sources.reduce(
    (sum, source) => ({
      events: sum.events + source.event_count,
      fraud: sum.fraud + source.fraud_count,
    }),
    { events: 0, fraud: 0 },
  );
  const holdout = monitoring.sources.find((source) => source.source_file === "fraudTest.csv");
  const firstEvent = monitoring.sources.reduce(
    (earliest, source) =>
      new Date(source.first_event_at) < new Date(earliest) ? source.first_event_at : earliest,
    monitoring.sources[0].first_event_at,
  );
  const lastEvent = monitoring.sources.reduce(
    (latest, source) =>
      new Date(source.last_event_at) > new Date(latest) ? source.last_event_at : latest,
    monitoring.sources[0].last_event_at,
  );
  const baseline = evaluation.models.baseline;
  const challenger = evaluation.models.challenger;
  const recallLift = baseline.recall_at_review_rate - challenger.recall_at_review_rate;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <a href="#top" className={styles.wordmark}>Payments risk / evidence desk</a>
        <nav aria-label="Dashboard sections">
          <a href="#queue">Queue</a>
          <a href="#evaluation">Evaluation</a>
          <a href="#boundary">Boundary</a>
        </nav>
        <span className={styles.status}>
          <i aria-hidden="true" /> Aggregate-only analyst triage
        </span>
      </header>
      <section className={styles.intro} id="top">
        <div>
          <p className={styles.kicker}>Aggregate monitoring · fixed evaluation · safe interaction</p>
          <h1>
            See the evidence.
            <br />
            See the boundary.
          </h1>
        </div>
        <p>
          A locally processed, simulated fraud source becomes a capacity-aware review decision.
          Public interaction stays synthetic and the hosted data stays aggregate.
        </p>
      </section>
      <section className={styles.facts} aria-label="Evidence summary">
        <div>
          <span>Local source processed</span>
          <strong>{integer.format(totals.events)}</strong>
          <small>simulated events, never hosted as records</small>
        </div>
        <div>
          <span>Chronological holdout</span>
          <strong>{integer.format(holdout?.event_count ?? 0)}</strong>
          <small>{date(firstEvent)} through {date(lastEvent)}</small>
        </div>
        <div>
          <span>Measured review capacity</span>
          <strong>{percent.format(evaluation.review_rate)}</strong>
          <small>{integer.format(baseline.alert_volume)} baseline review slots</small>
        </div>
        <div>
          <span>Public monitoring</span>
          <strong>{monitoring.sources.length}</strong>
          <small>approved source-level aggregate rows</small>
        </div>
      </section>
      <section className={styles.decision} aria-labelledby="decision-title">
        <div>
          <p className={styles.kicker}>Release decision</p>
          <h2 id="decision-title">Retain the baseline for the measured 1% review queue.</h2>
        </div>
        <dl>
          <div>
            <dt>Recall advantage</dt>
            <dd>+{(recallLift * 100).toFixed(1)} percentage points</dd>
          </div>
          <div>
            <dt>PR-AUC</dt>
            <dd>{baseline.pr_auc.toFixed(3)} vs {challenger.pr_auc.toFixed(3)}</dd>
          </div>
          <div>
            <dt>Guardrail</dt>
            <dd>Analyst review only</dd>
          </div>
        </dl>
      </section>
      <CapacityScenario
        measuredRate={evaluation.review_rate}
        measuredVolume={baseline.alert_volume}
        measuredRecall={baseline.recall_at_review_rate}
      />
      <Simulation />
      <EvaluationSection evaluation={evaluation} />
      <Lineage />
      <section className={styles.ledger} id="evidence">
        <div className={styles.sectionLead}>
          <p className={styles.kicker}>Published monitoring evidence</p>
          <h2>Two source-level aggregates, not a full-data browser view</h2>
          <p>
            The published ledger proves lineage and coverage while keeping the local event source
            outside the public boundary.
          </p>
        </div>
        <div className={styles.table} role="table" aria-label="Approved aggregate source partitions">
          <div className={`${styles.tableRow} ${styles.tableHeader}`} role="row">
            <span role="columnheader">Source partition</span>
            <span role="columnheader">Events</span>
            <span role="columnheader">Labelled fraud rate</span>
            <span role="columnheader">Period</span>
          </div>
          {monitoring.sources.map((source) => (
            <div className={styles.tableRow} role="row" key={source.source_file}>
              <span role="cell" data-label="Source">{source.source_file.replace(".csv", "")}</span>
              <span role="cell" data-label="Events">{integer.format(source.event_count)}</span>
              <span role="cell" data-label="Fraud rate">{percent.format(source.fraud_rate)}</span>
              <span role="cell" data-label="Period">
                {date(source.first_event_at)} to {date(source.last_event_at)}
              </span>
            </div>
          ))}
        </div>
      </section>
      <footer className={styles.footer}>
        <span>Hosted: aggregate monitoring and evaluation evidence</span>
        <span>Local only: raw simulated source and full pipeline</span>
      </footer>
    </main>
  );
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

function EmptyDashboard() {
  return (
    <main className={styles.fallback}>
      <p className={styles.kicker}>No approved aggregates</p>
      <h1>There is no published monitoring evidence to display.</h1>
      <p>
        This empty state does not reveal local source records. A publication owner must verify an
        approved aggregate refresh before the dashboard can show coverage.
      </p>
    </main>
  );
}

export default async function Home() {
  const data = await getDashboardData();
  if (data.status === "unavailable") {
    return (
      <main className={styles.fallback} role="alert">
        <p className={styles.kicker}>Service unavailable</p>
        <h1>Aggregate evidence is temporarily unavailable.</h1>
        <p>
          The dashboard does not fall back to local or raw transactions. Try again after the
          protected aggregate service recovers.
        </p>
      </main>
    );
  }
  if (data.monitoring.sources.length === 0) return <EmptyDashboard />;
  return <Dashboard monitoring={data.monitoring} evaluation={data.evaluation} />;
}
