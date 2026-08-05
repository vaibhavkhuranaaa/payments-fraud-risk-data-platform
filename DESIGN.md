---
name: Payments Fraud Risk Data Platform
description: Evidence-led analyst-triage demonstration
colors:
  ink: "#152126"
  paper: "#edf1ed"
  panel: "#ffffff"
  line: "#c6d1cb"
  signal: "#005e5d"
  alert: "#b94c31"
  muted: "#52646a"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 5.6rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.055em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  panel: "14px"
  control: "8px"
spacing:
  compact: "8px"
  standard: "16px"
  section: "64px"
---

# Design System: Payments Fraud Risk Data Platform

## Overview

**Creative North Star: "The audit room."** This is an operating surface for reading evidence under practical constraints: crisp, calm, and materially unlike a startup landing page. Data graphics, queue controls, and lineage are the visual language; no invented product identity, oversized slogan, or generic KPI-card scaffold.

## Colors

Cool paper and dark ink create a document-like reading field. Teal marks verified flow and orange marks capacity or caution; neither color carries meaning alone.

## Typography

Use the platform system sans for rapid, legible scan patterns. Display type is compact and assertive; body copy stays within 70ch and explains the implication of every metric.

## Layout

Use a wide editorial shell with ruled sections, uneven but purposeful grids, and responsive one-column fallbacks. Visuals include a text alternative or nearby explanatory copy.

## Elevation & Depth

Surfaces are separated primarily by rules and tonal paper shifts. Reserve soft offset shadows for interactive simulation controls only.

## Shapes

Panels use 14px corners; controls use 8px corners. Avoid decorative pills and nested cards.

## Components

Buttons name actions, show focus, and preserve a visible disabled state. Charts are semantic SVGs with labelled axes and accessible summaries. States name the condition and safe recovery path.

## Do's and Don'ts

- Explain workflow, lineage, capacity, calibration, and limitations visually.
- Label browser-generated simulation data as synthetic.
- Never call the challenger a materially different model or imply a payment decision.
- Never expose raw, event-level, personal, identifier, or score data.
