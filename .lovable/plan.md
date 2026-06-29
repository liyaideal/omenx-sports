## Problem

In `EventMarketTileCard`, the ⓘ tooltip from `RegulationTimeNotice` sits inside the card's `<Link>`. The trigger button calls `e.preventDefault()` + `e.stopPropagation()` on click. Radix `Popover` opens via the same click event and skips when `defaultPrevented` is true — so the popover never opens. (Pure CSS-hover would also fail because it's a click Popover, not a HoverCard.)

The `LiveStreamCard` tooltip has the same wiring and the same bug.

## Fix

Edit `src/components/sports/RegulationTimeNotice.tsx` only:

1. In the tooltip trigger's `onClick`, drop `e.preventDefault()` and keep only `e.stopPropagation()`. `stopPropagation` is sufficient to prevent the parent `<Link>` from navigating (the click never bubbles to the anchor); removing `preventDefault` lets Radix open the popover.
2. Also stop `onPointerDown` propagation on the trigger, so the anchor doesn't receive the pointerdown either (defensive — some link handlers react to pointerdown).
3. Leave the inline variant and all other surfaces untouched.

No changes to `EventMarketTileCard`, `LiveStreamCard`, or any data.

## Verification

- On `/league/world-cup-2026?view=games`: click the ⓘ next to the kickoff time on a card → popover opens, no navigation to event page.
- Clicking the card body elsewhere still navigates as before.
- Same check on a Live Stream card footer (Streaming now · ⓘ).