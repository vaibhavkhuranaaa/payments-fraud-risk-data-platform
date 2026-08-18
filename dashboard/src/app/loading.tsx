export default function Loading() {
  return (
    <main className="route-state" role="status" aria-live="polite">
      <p className="route-state__kicker">Loading aggregate evidence</p>
      <h1>The validation register is checking its protected source.</h1>
      <p>Raw and event-level records are never used as a fallback.</p>
      <div className="route-state__progress" aria-hidden="true"><span /></div>
    </main>
  );
}
