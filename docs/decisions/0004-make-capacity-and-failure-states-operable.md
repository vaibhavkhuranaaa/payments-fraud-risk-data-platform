# 0004 Make capacity and failure states operable

Status: synthetic queue and protected-access portions superseded by [0006 Publish all allowlisted event rows](0006-publish-all-allowlisted-event-rows.md) on 2026-08-18. Capacity and failure-state decisions remain active.

## Decision

Keep the dashboard server-rendered for protected aggregate access. Add browser-only capacity planning and synthetic queue review controls, plus explicit loading, empty, unavailable, and refusal states.

## Why

An analyst interface must change a review decision without exposing raw data or pretending to rescore events. Workload can be projected safely; recall remains measured only at the evaluated 1% policy.

## Alternatives rejected

- Client-side API access would expose the server key or require a broader public API.
- A raw event drill-down would violate the publication boundary.
- Scaling recall linearly at unmeasured review rates would manufacture model evidence.
- A chart-only report would not demonstrate queue use or recovery behavior.

## Not done

No signal is persisted, scored, approved, declined, or associated with a payment. No interaction calls the API.

## Changed

The interface now supports review-rate workload planning, queue-state filtering, reversible synthetic review progress, mobile layouts, and safe recovery copy.
