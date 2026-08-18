# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Payments-risk analysts and hiring managers assessing a governed analyst-triage workflow. They need to query the complete simulated analytical event set, understand how a constrained review queue behaves, and see where the product intentionally stops.

## Product Purpose

This portfolio demonstration shows an end-to-end, reproducible fraud-risk data workflow over a simulated source. Success is an informed review of row-level analytical events, monitoring, and model evidence, never an automated payment outcome.

## Positioning

The public experience makes the data boundary visible: all 1,852,394 simulated event rows are queryable through allowlisted analytical fields, while identity-like source columns remain excluded.

## Operating Context

An analyst queries the 1,852,394-event simulated analytical source, assesses a fixed-capacity review queue, and reviews model calibration and monthly alert distribution. The public release exposes row-level analytical fields plus fixed evaluation evidence.

## Capabilities and Constraints

The dashboard may query every simulated event through event ID, timestamp, merchant, category, amount, fraud label, and source partition. It must not expose identity-like raw fields, direct personal identifiers, model scores, scoring endpoints, payment decisions, or payment-processing behavior. Queries are read-only, cursor-paginated, and capped per request. The challenger is a class-weighted logistic-regression configuration, not a materially different model. The cost cap is $0/month.

## Brand Commitments

Use direct, evidence-led language. Do not invent a product brand, customers, or operational claims. The deployed system is an analyst-triage demonstration.

## Evidence on Hand

`data/validated/evaluation.json` contains chronological split metrics, calibration bins, and monthly alert volumes. `scripts/evaluate_models.py` documents the reproducible method. PostgreSQL contains all allowlisted event rows and serves them through a bounded read-only public API.

## Product Principles

- Make the row-level data boundary as legible as the model evidence.
- Explain evidence in the context of the analyst decision it supports.
- Label generated demonstration data honestly.
- Prefer constrained, reviewable interaction over simulated decisioning.

## Accessibility & Inclusion

Keyboard-accessible controls, clear status text, visible focus, semantic charts with textual summaries, and no essential meaning conveyed by color alone.
