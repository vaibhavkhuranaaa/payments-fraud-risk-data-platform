"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main style={{ padding: "10vh 8vw", fontFamily: "Arial, sans-serif" }}><p>Risk platform</p><h1>Unable to load the aggregate dashboard.</h1><button onClick={reset}>Try again</button></main>;
}
