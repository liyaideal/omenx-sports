## Problem

When the session is liquidated → `frozen`, `liquidateAll` closes all open positions, so `lockedStake` drops to 0. The margin-health formula in `AccountBlock.tsx` short-circuits to `health = 1` whenever `lockedStake <= 0`, which paints the bar full green and labels it **HEALTHY** — directly contradicting the "SESSION FROZEN · MMR 0%" banner on the grid.

## Fix

Make `AccountBlock` aware of the frozen state and render an unambiguous wiped-out margin row instead of the healthy default.

### Changes

1. **`src/routes/pinpoint.tsx`** — pass two new props into `<AccountBlock />`:
   - `frozen={state.sessionStatus === "frozen"}`
   - `mmrAtFreeze={showLiquidated?.mmrAtFreeze}` (already computed)

2. **`src/features/pinpoint/AccountBlock.tsx`**
   - Accept `frozen?: boolean` and `mmrAtFreeze?: number`.
   - When `frozen` is true, override the health block:
     - Label: **LIQUIDATED** (red, `var(--pp-red)`).
     - Sub-label on the right: `MMR {mmrAtFreeze%}` instead of the percentage placeholder.
     - Bar: full width, solid red, with the existing `animate-pulse`, plus a subtle diagonal-stripe overlay to read as "wiped" rather than "full".
     - Add a one-line CTA hint underneath: `TAP + FUND TO RESUME` (small, yellow), reusing the existing `onDeposit` handler — clickable.
   - Keep the healthy/warn/danger path unchanged for the non-frozen case.
   - Update the card `title` tooltip to include `· FROZEN` when applicable.

### Out of scope

- Liquidation trigger logic, MMR formula, deposit flow — all already correct; this is purely a display-state bug in the margin widget.
- No changes to Sidebar's frozen alert bar (already correct).
