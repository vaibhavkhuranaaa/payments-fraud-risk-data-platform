# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Payments-risk analysts and hiring managers assessing a governed analyst-triage workflow. They need to understand what evidence exists, how a constrained review queue behaves, and where the product intentionally stops.

## Product Purpose

This portfolio demonstration shows an end-to-end, reproducible fraud-risk data workflow over a locally processed simulated source. Success is an informed review of aggregate monitoring and model evidence, never an automated payment outcome.

## Positioning

The public experience makes the data boundary visible: live interaction is generated deterministic synthetic activity while the deployed system serves only aggregate monitoring and precomputed evaluation evidence.

## Operating Context

An analyst assesses a fixed-capacity review queue, model calibration, and monthly alert distribution. The full 1,852,394-event simulated source is local-only; the hosted publication has two aggregate source partitions.

## Capabilities and Constraints

The dashboard may show aggregate evidence and generated synthetic examples. It must not expose raw transactions, event-level records, direct identifiers, personal data, model scores, scoring endpoints, payment decisions, or payment-processing behavior. The challenger is a class-weighted logistic-regression configuration, not a materially different model. The cost cap is $0/month.

## Brand Commitments

Use direct, evidence-led language. Do not invent a product brand, customers, or operational claims. The deployed system is an analyst-triage demonstration.

## Evidence on Hand

`data/validated/evaluation.json` contains chronological split metrics, calibration bins, and monthly alert volumes. `scripts/evaluate_models.py` documents the reproducible method. Aggregate monitoring is served through the protected API.

## Product Principles

- Make the data boundary as legible as the model evidence.
- Explain evidence in the context of the analyst decision it supports.
- Label generated demonstration data honestly.
- Prefer constrained, reviewable interaction over simulated decisioning.

## Accessibility & Inclusion

Keyboard-accessible controls, clear status text, visible focus, semantic charts with textual summaries, and no essential meaning conveyed by color alone.
