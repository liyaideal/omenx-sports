# DESIGN.md — Template

Copy this skeleton to `DESIGN.md` at the repo root. Fill from `src/styles.css` and the rendered `/style-guide` route. Keep entries terse — one line per rule, tables wherever feasible.

```md
# {Project Name} — DESIGN.md

> Single source of truth for the visual system. Agents read this before any UI change. New locked rules MUST be written back here.

## 1. Visual Theme & Atmosphere

Mood, density, signature moves. 3–6 lines.

## 2. Color Palette & Roles

| Token | Hex / oklch | Role |
|---|---|---|
| `--background` | … | Page canvas |
| `--surface` | … | Card / panel |
| `--primary` | … | Primary CTA, brand |
| `--neon` | … | Signature accent — sparingly |
| `--foreground` | … | Body text |
| `--muted-foreground` | … | Secondary text |
| `--border` | … | Hairlines, dividers |
| `--win` / `--loss` | … | Semantic up/down |

## 3. Typography Rules

| Role | Font | Size / line-height | Weight | Notes |
|---|---|---|---|---|
| Display H1 | … | … | … | … |
| Section H2 | … | text-2xl / leading-9 | 600 | Shared baseline across columns |
| Body | … | … | … | … |
| Mono / meta | … | … | … | uppercase tracking-widest |

## 4. Component Stylings

### Section header (cross-column contract)
- Container: `flex min-h-9 items-center` (or `flex-wrap` with `min-h-9`)
- Title: `font-display text-2xl font-semibold leading-9`
- No `leading-none` on section h2s — breaks cross-column baseline.

### Card (event / market tile)
- Wrapper: `rounded-3xl border border-border bg-surface p-5 shadow-card`
- Content: `flex h-full flex-col gap-4`
- Footer: `mt-auto` so cards in the same grid row stay equal height.
- Any wrapper between grid and card MUST pass `h-full` through.

### Button / Pill / Chip
- Pill: `rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider`
- …

## 5. Layout Principles

- Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40
- Radius scale: 8 (chips), 16 (inputs), 24 (cards), 32 (heroes)
- Grid: 12-col with `gap-5` on dashboards
- Equal-height contract: any grid of cards in the same row stretches to the tallest sibling. Never set fixed pixel heights.

## 6. Depth & Elevation

| Token | Use |
|---|---|
| `shadow-card` | Default card |
| `shadow-glow` | Primary CTA |
| `bg-gradient-neon` | Brand accent surfaces |

## 7. Do's and Don'ts

**Do**
- Pull all colors from `src/styles.css` tokens.
- Keep section header baselines aligned via `min-h-9 leading-9`.
- Stretch cards in a grid row to equal height via `h-full` + `mt-auto` footer.

**Don't**
- Don't write `text-white`, `bg-black`, hex literals in components.
- Don't set `leading-none` on a section h2.
- Don't add fixed pixel heights to cards.
- Don't introduce a second neon accent — magenta is the only signature color.
- (Append every caught regression here, never delete.)

## 8. Responsive Behavior

| Breakpoint | Width | Behavior |
|---|---|---|
| base | <768px | 1-col stack |
| md | ≥768px | 2-col grids |
| lg | ≥1024px | 3-col dashboard shell |
| xl | ≥1280px | 3-col card grids |

- Default-collapsed shelves show 1 row at each breakpoint, expanded via dashed "Show all N" button.
- Tap targets ≥ 44×44 on touch.

## 9. Agent Prompt Guide

Quick reference to paste into design prompts:

> Dark stadium aesthetic, magenta neon accent (`--neon`), `font-display` for titles, mono for meta. Cards `rounded-3xl border border-border bg-surface p-5 shadow-card`, equal-height in rows. Section headers `text-2xl leading-9 min-h-9`. No second accent color.
```