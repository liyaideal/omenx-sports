---
name: Binary event has no nested Yes/No
description: A binary (2-outcome) event's two outcomes ARE the two tradable sides — never wrap each outcome with another Buy YES / Buy NO pair. Only 3+ outcome events have per-outcome YES/NO sides.
type: feature
---
Rule (project-wide, non-negotiable):

- A **binary event** = exactly 2 outcomes. The two outcomes themselves are the two tradable sides. Each outcome row gets ONE Trade button at its own price. There is ONE order book for the whole event (left side = outcome[0], right side = outcome[1], mirrored by 100−p).
  - Examples: "Bosnia-Herzegovina to advance" (Yes / No), "Liverpool to beat Newcastle" (LIV / NEW), "Messi plays at the World Cup" (Yes / No).
  - Never render `Buy YES / Buy NO` sub-buttons inside each row.
  - Never label the order book as `${outcome} YES / ${outcome} NO` — use the two outcome labels directly.

- A **multi-outcome event** = 3+ outcomes (1X2 match, league winner, top scorer, group winner). Each outcome is its own independent binary sub-market. Per-outcome `Buy YES / Buy NO` buttons + per-outcome order book labeled `${outcome} YES / ${outcome} NO` is correct here.

Implementation anchors:
- `src/components/sports/event/EventOutcomesPanel.tsx` — branch on `market.outcomes.length === 2`.
- `src/components/sports/trade/TradeOutcomePicker.tsx` — `needsSideToggle = outcomes.length >= 3` (binary never shows the side toggle); `deriveTradeFormProps` for binary maps `outcomes[0] → "yes"` tone, `outcomes[1] → "no"` tone, label = outcome's own label.
- `src/routes/event.$id.tsx` — for binary, `tradeSide` is derived from `selectedIdx`, not a user toggle.

Whenever you see `Buy YES / Buy NO` rendered inside a binary event, that is the bug.
