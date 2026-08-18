# 0001 Preserve the approved data boundary

Status: superseded by [0006 Publish all allowlisted event rows](0006-publish-all-allowlisted-event-rows.md) on 2026-08-18.

## Decision

Process the full approved simulated source locally. Publish only two source-level monitoring aggregates and a fixed evaluation artifact.

## Why

The analyst decision needs lineage, workload, and comparative model evidence. It does not need raw rows, synthetic cardholder-like identifiers, personal fields, or browser-visible scores.

## Alternatives rejected

- Hosting the full event table would expand exposure without improving the portfolio decision.
- Publishing sample event rows would create an event-browser expectation the product intentionally refuses.
- Replacing the approved source with generated fixtures would weaken the full-volume pipeline evidence.

## Not done

No raw source, prohibited field, event-level API, score endpoint, or payment action is added.

## Changed

The public contract is documented as aggregate-only across PostgreSQL grants, API routes, dashboard copy, scope, and release checks.
