---
name: design-md
description: Maintain and consult the project's DESIGN.md (single-source visual system) before any UI, typography, color, spacing, or layout change. Read whenever the user asks for visual refinement, points out inconsistency between modules, or complains that a previously-locked rule regressed.
---

# DESIGN.md workflow

The project keeps a single `DESIGN.md` in the repo root as the canonical, plain-text visual system — the format popularized by Google Stitch / awesome-design-md. Agents read it before touching any visual code; meaningful decisions are written back into it so they survive across sessions and never silently regress.

The on-screen `/style-guide` route is the rendered demo. `DESIGN.md` is the rules document. They MUST agree.

## When to trigger

- User asks for a visual change (color, type, spacing, radius, shadow, motion, layout).
- User points out two surfaces look inconsistent ("怎么不一样高", "对不齐", "字号不一样") → this is the highest-signal trigger; the rule almost certainly belongs in DESIGN.md.
- User complains a previously-fixed visual issue came back → write the rule into DESIGN.md so it cannot regress again.
- Before creating a new card / header / section component.

## Workflow (every visual task)

1. **Read first.** `code--view DESIGN.md` before writing any visual code. If it does not exist yet, create it from the template in `references/template.md`.
2. **Apply the locked rules verbatim.** Do not re-derive tokens, sizes, or alignment values when DESIGN.md already specifies them. Copy them through.
3. **Make the change.**
4. **Write back any new rule** (alignment baseline, equal-height contract, breakpoint behavior, empty-state shape, etc.) into the matching DESIGN.md section. Keep entries short — one sentence per rule, table where possible.
5. **Mirror to the rendered guide.** Add or update the corresponding section in `src/routes/style-guide.tsx` so the rule has a visual demo. The two documents must stay in lockstep.
6. **Save a memory** at `mem://design/<topic>` for cross-session recall when the rule is critical (e.g. "section header baselines", "card equal-height contract"). Update `mem://index.md` Core if it applies to every action.

## Format

Follow the 9-section structure from `references/template.md`:

1. Visual Theme & Atmosphere
2. Color Palette & Roles (semantic name + token + hex + role)
3. Typography Rules (full hierarchy table)
4. Component Stylings (buttons, cards, headers, chips — with states)
5. Layout Principles (spacing scale, grid, alignment contracts)
6. Depth & Elevation (shadow tokens, surface ladder)
7. Do's and Don'ts (anti-patterns — this is where regressions get pinned)
8. Responsive Behavior (breakpoints, collapse strategy, touch targets)
9. Agent Prompt Guide (quick reference for future prompts)

## Hard rules

- DESIGN.md is the single source of truth. If `src/styles.css` and DESIGN.md disagree, fix DESIGN.md if a token is missing, fix the code if the token drifted.
- Never invent values that contradict DESIGN.md. If the user requests something that breaks a locked rule, surface the conflict and ask before overriding.
- Section 7 (Do's and Don'ts) grows over time — every regression the user catches gets added as a Don't. Do not delete entries.
- Keep DESIGN.md under ~600 lines. Push fine-grained component recipes into `/style-guide` route, keep DESIGN.md as the rules layer.

## File locations

- `DESIGN.md` — repo root, the rules
- `src/routes/style-guide.tsx` — the rendered demo
- `src/styles.css` — the tokens (must match DESIGN.md §2 and §6)
- `mem://design/*` — cross-session reinforcement of the most critical rules