export default function Loading() {
  return (
    <main className="route-state" role="status" aria-live="polite">
      <p className="route-state__kicker">Loading public event evidence</p>
      <h1>The validation register is opening the read-only event view.</h1>
      <p>Source files are never used as a runtime fallback.</p>
      <div className="route-state__progress" aria-hidden="true"><span /></div>
    </main>
  );
}
