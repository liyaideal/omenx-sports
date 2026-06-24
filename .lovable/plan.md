## Goal

Make the Strikezone feel like a real prediction arcade: the **price line is fixed at NOW**, blank grid cells just slide left and quietly vanish at the boundary, but **cells you've bet on keep going past NOW**, then either explode with a clear win animation + floating profit, or fade red on loss. Match the reference video's energy.

## Current problem

- All cells (bet or not) live inside a single `overflow-hidden` scroller, so bet markers get clipped exactly at the NOW line the same way empty cells do.
- "Hit" effect is just a tiny class + small green text — no flash, no scale, no ripple. Reads as "nothing happened".
- Loss path has no visual at all.

## Plan

### 1. Split the marker layer out of the clipped scroller

In `src/features/strikezone/Grid.tsx`:
- Keep the right-side `overflow-hidden` scroller for empty grid cells only.
- Render `positions` markers in a sibling layer that overlays both the history panel and the future grid (so a marker can travel from its future column, across the NOW line, into the history area for ~0.6s before resolving).
- Marker X uses the same per-frame `progress` as the scroller (lift the rAF value to React state or a ref shared with markers) so a bet cell tracks its column exactly until `targetAt`, then continues sliding left at the same speed for a short "settle" window (e.g. 600ms) before being removed.

### 2. Settlement visuals

When `targetAt` is reached for a position:
- **Win** (`recentHits` contains it):
  - Marker snaps to NOW-line X, scales 1 → 1.35 → 1, white-hot flash (filter brightness 2 + box-shadow burst), 2 expanding orange ring SVGs (`@keyframes sz-ring` 0→2.2 scale, opacity 0.8→0).
  - Big `+$payout` floats up ~60px and fades over 1.2s in green with cyan glow, using `sz-display` at text-3xl.
  - Subtle screen-shake on the grid container (translate 2px for 120ms) — optional, keep small.
- **Loss** (no hit by `targetAt + grace`):
  - Marker turns red gradient, scale 1 → 0.85, opacity → 0 over 500ms. No popup.
- Empty (unbet) cells: no change — they continue to silently exit at the NOW boundary as today.

### 3. Win/loss detection inside Grid

Today `recentHits` only contains wins. Add a derived `settledLosses` set in Grid: for each position whose `targetAt < now - 300ms` and id not in `hitIds`, treat as loss. Drive the loss animation locally; no business-logic change, no new state in the hook.

### 4. Float popup upgrade

Replace the current small green float with:
- `sz-display` text-3xl, color `var(--sz-green)`, text-shadow cyan+green double glow.
- Starts at marker Y on the NOW line, animates `translateY(-60px)` + opacity 1→0 over 1200ms via a dedicated `@keyframes sz-profit-pop` (add to `src/styles.css` or local style block).
- Pre-pended `▲` arrow for extra punch.

### 5. Hydration fix (side cleanup)

The current `nextTickInSec` is computed from `Date.now()` at first render, which mismatches SSR and triggers the hydration error shown in runtime logs. Initialize the clock badge value to a stable placeholder (`--`) and only fill it in after mount via `useEffect`. Same pattern for `tickSec`.

### Technical notes

- Files touched: `src/features/strikezone/Grid.tsx` only (plus a few keyframes appended to `src/styles.css` if not already present). No hook/business changes.
- Animation primitives use CSS keyframes — no new deps.
- Performance: marker layer is a handful of nodes; rAF already drives the scroller and can publish `progress` via a ref consumed by markers each frame (direct DOM transform, no React rerender per frame).
- Style guide: update the Strikezone demo in `/style-guide` to mirror the new marker/float visuals so playground stays in sync.

### Out of scope

- No changes to multipliers, leverage, bet sizing, event/outcome switching, sidebar, or hooks.
