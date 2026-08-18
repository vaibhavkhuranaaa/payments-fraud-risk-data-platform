"use client";

import { useState } from "react";
import styles from "./page.module.css";

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
