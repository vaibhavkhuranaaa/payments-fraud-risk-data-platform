---
name: Payments Fraud Risk Data Platform
description: A supervisory validation register for fraud-risk evidence and analyst triage
colors:
  canvas: "#f1f3f5"
  paper: "#ffffff"
  ink: "#14181c"
  muted: "#59636e"
  line: "#c7cdd3"
  line-strong: "#7b858f"
  cobalt: "#1857c9"
  cobalt-wash: "#e9effb"
  amber: "#965600"
  amber-wash: "#fff0d2"
  positive: "#176646"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 3.2vw, 3.35rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  data:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.35
rounded:
  control: "2px"
  surface: "0"
spacing:
  unit: "4px"
  compact: "8px"
  standard: "16px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 11px"
---

# Design System: Payments Fraud Risk Data Platform

## Overview

**Creative North Star: "The validation register."**

This is a working control surface for a fraud-risk analyst, modeled on supervisory model-validation workbooks and operations blotters. The page prioritizes comparison, provenance, capacity, and exceptions. Its visual rhythm comes from ruled tables, compact status bands, aligned numerals, and explicit evidence references.

The system rejects the portfolio-dashboard pattern of oversized slogans, floating KPI cards, decorative charts, and generous empty space. It should feel credible on a risk analyst's wide monitor in a bright office, with every region answering a concrete review question.

## Colors

Cool institutional neutrals carry the page. Cobalt identifies selection and navigable evidence; amber marks limitations and unmeasured conditions. Neither color communicates alone.

**The Sparse Signal Rule.** Cobalt and amber together occupy less than ten percent of the viewport. Most evidence remains black on white.

## Typography

**Display and Body Font:** The native operating-system UI stack
**Data Font:** The platform monospace stack, reserved for measurements, identifiers, and timestamps

Headings are compact labels for analytical regions, never billboard copy. All metrics use tabular numerals. Uppercase is limited to short register labels and column headers.

## Layout

The desktop application uses a persistent 216px evidence index beside a fluid analytical workspace. The workspace follows a twelve-column grid, but sections are separated by full-width rules instead of cards. The first viewport contains the release disposition, key measured values, the allowlisted event register, and capacity planning. Evaluation evidence follows without a marketing interlude.

At narrow widths the index becomes a horizontal register strip and every table row gains explicit mobile labels. No horizontal scroll is required at 390px.

## Elevation & Depth

The system is flat. There are no shadows, floating panels, glass layers, or simulated paper stacks. Hierarchy comes from fill, rule weight, indentation, and selected-row state.

## Shapes

Analytical regions are rectangular with square corners. Interactive controls may use a 2px radius for focus clarity. Pills, capsules, rounded cards, and circular status ornaments are not part of the language.

## Components

Tables and registers are the primary containers. Column headers remain visually tied to their values. Status is written as a decision plus its scope, not reduced to a colored badge.

Buttons are compact, rectangular, and action-led. Selected filters use cobalt fill or underline. Inputs use a one-pixel neutral rule, a white field, and a visible cobalt focus outline.

Charts sit on the same baseline grid as surrounding tables. Axes, units, sample counts, and textual interpretations are always visible. Decorative sparklines are prohibited.

## Do's and Don'ts

- **Do** put disposition, evidence, and analyst action in the first viewport.
- **Do** align comparable values and use tabular numerals.
- **Do** expose limits beside the evidence they qualify.
- **Do** retain accessible loading, empty, error, and unmeasured states.
- **Don't** use KPI cards, large hero slogans, pills, gradients, shadows, or glass.
- **Don't** use monospace as atmosphere; reserve it for data and references.
- **Don't** imply scoring, payment decisions, or access beyond the seven allowlisted event fields.
