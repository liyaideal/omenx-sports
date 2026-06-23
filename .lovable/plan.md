## Goal

The `/style-guide` LegendBayPlayground only shows two revealed states (hit, miss-with-wrong-pick). Add a third revealed state for "user didn't pick at all by reveal day" so QA can review all three reveal outcomes side-by-side. This matches the existing `LegendRevealSequenceDemo` which already exposes a NO-PICK button.

## Scope

Frontend / presentation only. No data model changes — `revealed-miss` continues to cover both "picked wrong" and "didn't pick"; the difference is purely whether `userPickId` is set.

## Changes

### 1. `src/routes/style-guide.tsx` — `LegendBayPlayground`
Add a third entry to the `states` array:
- label: `revealed-miss` (status reused)
- description: `Reveal day — user didn't pick`
- key: `revealed-no-pick` (to keep React keys unique)

In the `.map`, when this variant is rendered, set `userPickId: undefined` and `pickId: undefined` so the candidate board shows the correct answer highlighted but no user pick row. The chip label above the card should read `revealed-miss · Reveal day — user didn't pick`.

### 2. `src/components/sports/promo/GuessTheLegendTab.tsx` — `RevealBanner`
Differentiate the no-pick copy. Add an optional `hasPick` prop (default true). When `status === "revealed-miss"` and `hasPick === false`, show banner copy `NO PICK · MISSED REVEAL` (same red X, same MISS color); otherwise keep `BETTER LUCK NEXT ROUND` for wrong-pick.

Pass `hasPick={!!round.userPickId}` from the single call site in `ActiveRoundBay` (line 543–547).

### 3. No changes to
- `useLegendRevealQueue`, `LegendRevealOverlay`, data layer, RoundBay thumbnails (already grayscale for any miss).
