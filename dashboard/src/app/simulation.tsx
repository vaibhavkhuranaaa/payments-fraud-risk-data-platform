"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type SyntheticSignal = { id: string; channel: string; amountBand: string; reason: string; status: "queued" | "reviewed" };

const presets = [
  ["Web", "$50–$100", "unusual merchant category"],
  ["Mobile", "$100–$250", "new-device pattern"],
  ["Web", "$250–$500", "higher-than-usual amount band"],
  ["In-store", "$20–$50", "rapid repeat activity"],
] as const;

function makeSignal(index: number): SyntheticSignal {
  const [channel, amountBand, reason] = presets[index % presets.length];
  return { id: `SIM-${String(index + 1).padStart(4, "0")}`, channel, amountBand, reason, status: index % 3 === 0 ? "reviewed" : "queued" };
}

export function Simulation() {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const signals = useMemo(() => Array.from({ length: Math.min(index + 1, 5) }, (_, offset) => makeSignal(Math.max(0, index - offset))).reverse(), [index]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setIndex((value) => value + 1), 900);
    return () => window.clearInterval(timer);
  }, [running]);

  return <section className={styles.simulation} aria-labelledby="simulation-title">
    <div className={styles.sectionLead}>
      <p className={styles.kicker}>Safe interaction</p>
      <h2 id="simulation-title">Synthetic review stream</h2>
      <p>Generate deterministic demonstration signals in this browser. They are not sourced from the API, are not transaction records, and do not trigger a score or decision.</p>
    </div>
    <div className={styles.simulator}>
      <div className={styles.simulatorTop}>
        <div><span className={styles.liveDot} aria-hidden="true" /> <strong>{running ? "Streaming" : "Paused"}</strong><small>browser-generated only</small></div>
        <button type="button" onClick={() => setRunning((value) => !value)} aria-pressed={running}>{running ? "Pause stream" : "Start stream"}</button>
      </div>
      <div className={styles.signalList} aria-live="polite" aria-label="Synthetic signals">
        {signals.map((signal) => <div className={styles.signal} key={signal.id}>
          <strong>{signal.id}</strong><span>{signal.channel}</span><span>{signal.amountBand}</span><span>{signal.reason}</span><span>{signal.status === "reviewed" ? "Previously reviewed" : "Available for analyst review"}</span>
        </div>)}
      </div>
      <p className={styles.simNote}>Refusal boundary: this demonstration intentionally has no action to approve, decline, score, or retrieve a payment.</p>
    </div>
  </section>;
}
