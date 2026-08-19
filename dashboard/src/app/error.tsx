"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="route-state" role="alert">
      <p className="route-state__kicker">Public event service unavailable</p>
      <h1>Unable to load the validation register.</h1>
      <p>
        The register will not fall back to source files. Retry after the read-only event service
        recovers.
      </p>
      <button type="button" onClick={reset}>Retry event service</button>
    </main>
  );
}
