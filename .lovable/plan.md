## Bug
The portaled event dropdown is visually transparent — sidebar cards (MARKET, outcome chips) show through it.

Cause: the `pp-card` background uses a near-transparent dark green; on top of the page it normally looks solid, but the floating popover sits over other dark cards, so the bleed-through is visible. The popover also lacks an opaque inner layer.

## Fix
In `src/features/pinpoint/EventSelector.tsx`, on the portaled panel:
- Set an explicit opaque background (`background: #0e1a13` — solid LCD green, matches `--pp-card-bg` but fully opaque).
- Add a subtle backdrop scrim behind the panel via a 1px black inset/outline so it reads as a separate floating layer.
- Keep existing border + hard shadow.

Single-file change, no logic touched.