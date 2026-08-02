# Project delivery rules

## Read first

Read `PROJECT.md`, `.project/architecture.md`, `.project/milestones.yml`, `.project/state.md`, and `.project/handoff.md` before editing. Complete only the first unblocked milestone.

## Rules

- Preserve unrelated work and never overwrite existing files without instruction.
- Use public, synthetic, anonymized, or licensed data only: Public, license-verified fraud data only after approval. Candidate sources require a documented license and retention review; synthetic fixtures are permitted for deterministic tests.
- Use the smallest credible design; remove stale code and unjustified abstractions.
- Apply `DESIGN.md` to all user-facing work.
- Keep secrets outside source; commit variable names only in `.env.example`.
- Use conventional commits and configured human Git identity. Never add AI/model author or co-author trailers.
- Do not put AI/model names in Git branch names.
- Do not create paid resources, change public visibility, deploy, roll back, or publish without explicit human approval recorded in `.project/approvals.yml`.
- Update architecture, evidence, state, and handoff when verified facts change.
- Run `project-kit check` before claiming a milestone is complete.
