"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="route-state" role="alert">
      <p className="route-state__kicker">Aggregate service unavailable</p>
      <h1>Unable to load the validation register.</h1>
      <p>
        Raw and event-level records remain unavailable by design. Retry after the protected
        aggregate service recovers.
      </p>
      <button type="button" onClick={reset}>Retry aggregate service</button>
    </main>
  );
}
