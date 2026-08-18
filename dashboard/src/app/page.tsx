/*
THESIS: A validation register, not a portfolio dashboard; the queue and decision evidence lead.
OWN-WORLD: Cool institutional paper, carbon rules, cobalt selection, amber exceptions, square controls.
STORY: Verify the release decision, test capacity, inspect the synthetic queue, then audit evidence and boundary.
FIRST VIEWPORT: A 216px register index frames a compact disposition strip and full-width operations blotter.
FORM: Queue-blotter-first, ranked second and selected for analyst scan speed; seed f162bd09.
*/
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
        <p className={styles.kicker}>CONTROL 04 / DATA BOUNDARY</p>
        <h2 id="lineage-title">Local processing and public evidence are separate zones</h2>
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
          <p className={styles.kicker}>EVIDENCE 03 / MODEL COMPARISON</p>
          <h2 id="evaluation-title">
            Baseline outperforms the challenger at the measured queue constraint
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
        <a href="#top" className={styles.wordmark}>Payments risk validation register</a>
        <span className={styles.headerRef}>REGISTER / FR-2026-08</span>
        <span className={styles.status}>
          PUBLIC SCOPE: AGGREGATE ONLY
        </span>
      </header>
      <div className={styles.appBody}>
        <aside className={styles.register} aria-label="Evidence register">
          <div className={styles.registerTitle}>
            <span>CONTROL INDEX</span>
            <strong>FR / 08</strong>
          </div>
          <nav aria-label="Register sections">
            <a href="#top"><b>00</b> Disposition</a>
            <a href="#queue"><b>01</b> Review queue</a>
            <a href="#capacity"><b>02</b> Capacity</a>
            <a href="#evaluation"><b>03</b> Model evidence</a>
            <a href="#boundary"><b>04</b> Data boundary</a>
            <a href="#evidence"><b>05</b> Publication ledger</a>
          </nav>
          <dl className={styles.registerFacts}>
            <div><dt>Source class</dt><dd>Simulated</dd></div>
            <div><dt>Evaluation</dt><dd>Chronological</dd></div>
            <div><dt>Queue policy</dt><dd>Fixed at 1%</dd></div>
            <div><dt>Action scope</dt><dd>Analyst review</dd></div>
          </dl>
          <p className={styles.registerLimit}>
            No raw records, identifiers, scores, approvals, or declines.
          </p>
        </aside>

        <div className={styles.workspace}>
          <section className={styles.workspaceTitle} id="top" aria-labelledby="page-title">
            <div>
              <p className={styles.kicker}>MODEL VALIDATION / ANALYST TRIAGE DEMONSTRATION</p>
              <h1 id="page-title">Fraud risk control review</h1>
              <p>
                Fixed holdout evidence, constrained review capacity, and aggregate-only publication.
              </p>
            </div>
            <dl>
              <div><dt>Coverage</dt><dd>{date(firstEvent)} to {date(lastEvent)}</dd></div>
              <div><dt>Holdout</dt><dd>{integer.format(holdout?.event_count ?? 0)} events</dd></div>
              <div><dt>Review date</dt><dd>17 Aug 2026</dd></div>
            </dl>
          </section>

          <section className={styles.disposition} aria-labelledby="decision-title">
            <div className={styles.dispositionLabel}>
              <span>RELEASE DISPOSITION</span>
              <strong>RETAIN BASELINE</strong>
              <p id="decision-title">Measured 1% analyst-review queue only. Not production-ready.</p>
            </div>
            <dl className={styles.dispositionMetrics}>
              <div><dt>Recall at 1%</dt><dd>{percent.format(baseline.recall_at_review_rate)}<small>+{(recallLift * 100).toFixed(1)} pp vs challenger</small></dd></div>
              <div><dt>PR-AUC</dt><dd>{baseline.pr_auc.toFixed(3)}<small>challenger {challenger.pr_auc.toFixed(3)}</small></dd></div>
              <div><dt>Brier</dt><dd>{baseline.brier_score.toFixed(3)}<small>challenger {challenger.brier_score.toFixed(3)}</small></dd></div>
              <div><dt>Review slots</dt><dd>{integer.format(baseline.alert_volume)}<small>chronological holdout</small></dd></div>
            </dl>
          </section>

          <div className={styles.operations}>
            <Simulation />
            <CapacityScenario
              measuredRate={evaluation.review_rate}
              measuredVolume={baseline.alert_volume}
              measuredRecall={baseline.recall_at_review_rate}
            />
          </div>
          <EvaluationSection evaluation={evaluation} />
          <Lineage />
          <section className={styles.ledger} id="evidence">
            <div className={styles.sectionLead}>
              <p className={styles.kicker}>EVIDENCE 05 / PUBLICATION LEDGER</p>
              <h2>Approved aggregate source partitions</h2>
              <p>
                These two rows prove coverage and lineage. They do not expose the local event source.
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
                  <span role="cell" data-label="Period">{date(source.first_event_at)} to {date(source.last_event_at)}</span>
                </div>
              ))}
              <div className={styles.tableTotal}>
                <span>LOCAL SOURCE TOTAL</span>
                <strong>{integer.format(totals.events)}</strong>
                <small>{integer.format(totals.fraud)} labelled fraud events</small>
              </div>
            </div>
          </section>
          <footer className={styles.footer}>
            <span>PUBLIC: aggregate monitoring + fixed evaluation evidence</span>
            <span>LOCAL: raw simulated source + full pipeline</span>
          </footer>
        </div>
      </div>
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
