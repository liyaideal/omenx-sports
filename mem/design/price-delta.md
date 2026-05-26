---
name: Price pill delta format
description: Price deltas must be signed and unit-bearing (+N¢ / −N¢ / 0¢), with 24h tooltip.
type: design
---
`PricePill` (`src/components/sports/dashboard/PricePill.tsx`) delta format is locked:

- Always signed with ¢ unit: `+3¢`, `−1¢`, `0¢`. Never bare `3`.
- Source field is `delta24h` (number in 0–1, multiplied ×100 for cents).
- `title="24h change"` on the delta span, `aria-label` on the whole pill.
- `showTimeframe` prop appends ` · 24h` inline on roomy surfaces (outcome blocks, hero).
- Arrow + color are redundant cues; the number alone has to read correctly.
- Once per page, a legend `Prices in ¢ (0–100) · arrows show 24h change` sits next to the first price-bearing section header so new users learn the unit.

Apply the same format anywhere a delta number appears (e.g. `EventMarketTileCard`'s `OutcomeBlock`).
