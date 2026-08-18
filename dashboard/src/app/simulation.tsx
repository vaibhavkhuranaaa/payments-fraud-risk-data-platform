"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type QueueFilter = "all" | "queued" | "reviewed";
type SyntheticSignal = {
  id: string;
  channel: string;
  amountBand: string;
  reason: string;
};

const presets = [
  ["Web", "$50 to $100", "illustrative category variance"],
  ["Mobile", "$100 to $250", "illustrative history pattern"],
  ["Web", "$250 to $500", "illustrative amount pattern"],
  ["In-store", "$20 to $50", "illustrative repeat pattern"],
] as const;

function makeSignal(index: number): SyntheticSignal {
  const [channel, amountBand, reason] = presets[index % presets.length];
  return {
    id: `SIM-${String(index + 1).padStart(4, "0")}`,
    channel,
    amountBand,
    reason,
  };
}

export function CapacityScenario({
  measuredRate,
  measuredVolume,
  measuredRecall,
}: {
  measuredRate: number;
  measuredVolume: number;
  measuredRecall: number;
}) {
  const [rate, setRate] = useState(measuredRate);
  const projectedVolume = Math.round(measuredVolume * (rate / measuredRate));
  const isMeasured = rate === measuredRate;

  return (
    <section className={styles.capacity} aria-labelledby="capacity-title" id="capacity">
      <div className={styles.sectionLead}>
        <p className={styles.kicker}>CONTROL 02 / CAPACITY</p>
        <h2 id="capacity-title">Queue planning scenario</h2>
        <p>
          Change the planning rate to see workload. Recall remains visible only for the measured
          1% policy because no other threshold sweep is available.
        </p>
      </div>
      <div className={styles.capacityControl}>
        <fieldset>
          <legend>Holdout review rate</legend>
          {[0.005, 0.01, 0.02].map((option) => (
            <label key={option}>
              <input
                checked={rate === option}
                name="review-rate"
                onChange={() => setRate(option)}
                type="radio"
              />
              {new Intl.NumberFormat("en-US", {
                style: "percent",
                maximumFractionDigits: 1,
              }).format(option)}
            </label>
          ))}
        </fieldset>
        <div className={styles.capacityResult} aria-live="polite">
          <span>Planned review slots</span>
          <strong>{new Intl.NumberFormat("en-US").format(projectedVolume)}</strong>
          <small>
            {isMeasured
              ? `${new Intl.NumberFormat("en-US", {
                  style: "percent",
                  maximumFractionDigits: 1,
                }).format(measuredRecall)} measured recall on the chronological holdout`
              : "Workload projection only. Recall was not measured at this rate."}
          </small>
        </div>
      </div>
    </section>
  );
}

export function Simulation() {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(3);
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [reviewed, setReviewed] = useState(() => new Set(["SIM-0001"]));
  const signals = useMemo(
    () =>
      Array.from({ length: Math.min(index + 1, 5) }, (_, offset) =>
        makeSignal(Math.max(0, index - offset)),
      ).reverse(),
    [index],
  );
  const visibleSignals = signals.filter((signal) => {
    if (filter === "all") return true;
    return filter === "reviewed" ? reviewed.has(signal.id) : !reviewed.has(signal.id);
  });

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setIndex((value) => value + 1), 1400);
    return () => window.clearInterval(timer);
  }, [running]);

  function toggleReviewed(id: string) {
    setReviewed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className={styles.simulation} aria-labelledby="simulation-title" id="queue">
      <div className={styles.sectionLead}>
        <p className={styles.kicker}>CONTROL 01 / REVIEW BLOTTER</p>
        <h2 id="simulation-title">Synthetic analyst queue</h2>
        <p>
          Generate deterministic demonstration signals and record review progress in this browser.
          Nothing is fetched, persisted, scored, approved, or declined.
        </p>
      </div>
      <div className={styles.simulator}>
        <div className={styles.simulatorTop}>
          <div>
            <span>STREAM STATE</span>
            <strong>{running ? "RUNNING" : "PAUSED"}</strong>
            <small>/ browser-generated only</small>
          </div>
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            aria-pressed={running}
          >
            {running ? "Pause stream" : "Start stream"}
          </button>
        </div>
        <div className={styles.queueTools}>
          <label htmlFor="queue-filter">Queue state</label>
          <select
            id="queue-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value as QueueFilter)}
          >
            <option value="all">All signals</option>
            <option value="queued">Awaiting review</option>
            <option value="reviewed">Review recorded</option>
          </select>
          <span>{visibleSignals.length} shown</span>
        </div>
        <div className={styles.signalHeader} aria-hidden="true">
          <span>Signal / channel</span>
          <span>Illustrative evidence</span>
          <span>Review state</span>
        </div>
        <ul className={styles.signalList} aria-live="polite" aria-label="Synthetic signals">
          {visibleSignals.map((signal) => {
            const isReviewed = reviewed.has(signal.id);
            return (
              <li className={styles.signal} key={signal.id}>
                <div data-label="Signal">
                  <strong>{signal.id}</strong>
                  <span>{signal.channel}</span>
                </div>
                <div data-label="Evidence">
                  <span>{signal.amountBand}</span>
                  <span>{signal.reason}</span>
                </div>
                <button type="button" onClick={() => toggleReviewed(signal.id)}>
                  {isReviewed ? "Reopen review" : "Record review"}
                </button>
              </li>
            );
          })}
        </ul>
        {visibleSignals.length === 0 && (
          <p className={styles.queueEmpty}>No synthetic signals match this queue state.</p>
        )}
        <p className={styles.simNote}>
          Refusal boundary: no action can approve, decline, score, retrieve, or alter a payment.
        </p>
      </div>
    </section>
  );
}
