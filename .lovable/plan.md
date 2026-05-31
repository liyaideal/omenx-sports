## Goal

Currently the Draw outcome (1X2 markets) is rendered inconsistently across cards:

| Card | What it shows for Draw today |
|---|---|
| `EventMarketTileCard` OutcomeRow | Circle with text `X` |
| `MatchMarketCard` | Neutral-hue dot, no symbol |
| `LiveStreamCard` segmented bar | Just the label `Draw`, no glyph |
| `TradeDrawer` outcome chooser | Just the label `Draw`, no glyph |

Ship one Draw glyph everywhere: the Lucide **`Equal`** icon (visually neutral `=`, the standard "tie/draw" mark). Provide a tiny shared helper so any future card uses the same thing.

## New shared util

**`src/components/sports/draw.tsx`** (new — ~15 LOC)

```ts
import { Equal, type LucideIcon } from "lucide-react";
import type { Outcome } from "@/data/sports-markets";

export const DrawIcon: LucideIcon = Equal;

export function isDrawOutcome(o: Outcome): boolean {
  return !o.team && (o.label === "Draw" || o.meta === "X");
}
```

## Changes

1. **`src/components/sports/dashboard/EventMarketTileCard.tsx`** — replace the `<span>X</span>` block (line 200–201) with the same 5×5 muted circle wrapper but render `<DrawIcon className="h-3 w-3" />` inside. Use `isDrawOutcome(outcome)` instead of the inline check.

2. **`src/components/sports/dashboard/MatchMarketCard.tsx`** — in the row list (around line 77–87), when `isDraw` is true, render a small muted circle holding `<DrawIcon className="h-3 w-3" />` in place of the 10px hue dot. Keep the hue dot for team outcomes so the visual rhythm stays the same; only the Draw row swaps in the icon.

3. **`src/components/sports/dashboard/LiveStreamCard.tsx`** — in the segmented outcome bar (around line 109–119), when `isDrawOutcome(o)` is true, render `<DrawIcon className="h-3 w-3 ...muted..." />` immediately before the price, replacing the bare "Draw" text. (Bar is tight, icon-only reads cleaner than text + icon.)

4. **`src/components/sports/trade/TradeDrawer.tsx`** — in the "Pick outcome" grid (line 117–140), when `isDrawOutcome(o)` is true, render `<DrawIcon className="h-3 w-3" />` next to the label inside the small uppercase row. Team outcomes keep their `team.short`; Draw shows the icon plus a short `DRAW` label so the button still has a clear caption.

That's all. `GroupWinnerCard` / `BinaryQuestionCard` / `SpotlightPropsCardHorizontal` never render Draw, so they're untouched.

## Style-guide sync

`/style-guide` already imports `EventMarketTileCard`, `MatchMarketCard`, and `LiveStreamCard`, and renders them against real 1X2 markets (USA-Paraguay, Mexico-South Africa, etc.). The new draw glyph will appear automatically in those demos — no extra edit needed there.
