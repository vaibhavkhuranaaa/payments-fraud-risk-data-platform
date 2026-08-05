"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main style={{ minHeight: "100vh", padding: "10vh 8vw", background: "#edf1ed", color: "#152126", fontFamily: "Arial, sans-serif" }}><p style={{ color: "#005e5d", fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>Aggregate service unavailable</p><h1>Unable to load the evidence desk.</h1><p>Raw and event-level records remain unavailable by design. Try again when the protected aggregate service recovers.</p><button type="button" onClick={reset}>Try again</button></main>;
}
