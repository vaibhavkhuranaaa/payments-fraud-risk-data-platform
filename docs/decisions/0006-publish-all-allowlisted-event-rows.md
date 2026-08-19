# Publish all allowlisted event rows

## Decision

Expose all 1,852,394 simulated event rows through a bounded, read-only public query API. Public fields are event ID, timestamp, merchant, category, amount, fraud label, and source partition. Identity-like raw source columns remain excluded at ingestion.

## Why

The owner explicitly replaced the aggregate-only publication boundary with a row-level public-data requirement. Cursor pagination and fixed query limits make the complete analytical dataset inspectable without copying dataset files into the repository or loading unbounded result sets.

## Alternatives rejected

- Keep the aggregate-only publication because it no longer satisfies the owner-approved scope.
- Publish the raw CSV files because repository datasets, unbounded downloads, and identity-like simulated columns are outside the revised product need.
- Add a search service because PostgreSQL indexes and parameterized filters cover the required query surface.

## Not done

- Identity-like source fields are not ingested or published.
- No write, scoring, approval, decline, or payment-processing endpoint is added.
- No external database, deployment, or paid infrastructure is provisioned by this decision.

## Changed

The public boundary now covers every allowlisted event row, not only source-level aggregates. API, dashboard, tests, documentation, and release evidence must state this boundary directly.
