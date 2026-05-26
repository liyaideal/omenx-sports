## Problem

`PricePill` renders e.g. `42¢ ↗ 3` — the bare `3` has no unit and no timeframe. Three things are ambiguous:

1. **Unit** — is `3` cents, points, percent, or count of trades? (It's cents: the price moved from 0.39 → 0.42, so `delta = 0.03`, displayed as `3`.)
2. **Direction sign** — the arrow shows direction but the number doesn't carry a `+` / `−`, so it reads like a magnitude only.
3. **Timeframe** — there is no `24h` / `1h` label anywhere on the pill, even though the underlying field is `delta24h`.

Same pattern appears in `EventMarketTileCard`'s `OutcomeBlock` (`↗ 3 24h` — the `24h` is there but the value still has no unit).

## Plan

### 1. Make the delta self-describing on `PricePill`

Render: `+3¢` / `−1¢` / `0¢` (signed, with the ¢ unit) instead of bare `3`. Keep the colored arrow as a redundant visual cue. The pill becomes:

```
[ 42¢  ↗ +3¢ ]
```

Add a native `title` tooltip on the delta span: `"24h change"`. Add `aria-label` on the whole pill: `"42 cents, up 3 cents in 24 hours"` (built from the same numbers).

Optional `showTimeframe` prop (default `false`) for surfaces where there's room to print `24h` inline (e.g. `OutcomeBlock` already does this). When `true`, render `+3¢ · 24h`.

### 2. Align `OutcomeBlock` delta in `EventMarketTileCard`

Replace `↗ 3 24h` with the same signed-with-unit form: `↗ +3¢ · 24h`. This keeps the larger outcome blocks consistent with the small pills.

### 3. Add a one-time legend on the page

Tiny inline helper under the section header on the home dashboard (`Today's matches` row) — a muted `Prices in ¢ · arrows = 24h move` micro-caption. One sentence, `font-mono text-[10px] uppercase tracking-widest text-muted-foreground`, sits next to the section meta. Educates new users without bloating every pill.

### 4. Lock the rule in DESIGN.md (§4 Pills & chips, §7 Don'ts)

Append to §4 "Pills & chips":

> **Price pill delta.** Always signed and unit-bearing: `+3¢`, `−1¢`, `0¢`. The colored arrow is a redundant cue; the number alone must still be readable. The underlying delta is `delta24h` (price change over the last 24 hours); always include `title="24h change"` on the delta span. Surfaces with room print `· 24h` inline.

Append to §7 Don'ts:

> - Don't render a price delta as a bare number (e.g. `↗ 3`). It MUST carry a sign and a `¢` unit, e.g. `+3¢`. The number alone has to read correctly without the arrow.

### 5. Mirror to `/style-guide`

In the existing `PricePill` demo row, show all three states with the new format: `42¢ +3¢`, `21¢ −1¢`, `37¢ 0¢`, plus a labeled example with `showTimeframe`. Add a short caption below explaining the unit.

### 6. Memory

Save `mem://design/price-delta` with the signed `+N¢` / `−N¢` / `0¢` rule and add a one-line Core entry so it sticks across sessions.

## Files to touch (in build mode)

- `src/components/sports/dashboard/PricePill.tsx` — signed unit, tooltip, aria-label, optional `showTimeframe`
- `src/components/sports/dashboard/EventMarketTileCard.tsx` — apply same format to `OutcomeBlock` delta line
- `src/routes/index.tsx` — add the one-line legend caption on the events section header
- `src/routes/style-guide.tsx` — update PricePill demo
- `DESIGN.md` — §4 + §7 entries
- `mem/design/price-delta.md` + `mem/index.md` Core

## Out of scope

- No color or arrow icon changes (existing semantic colors stay).
- No change to the underlying data model — `delta24h` stays a 0–1 number.
- No tooltips beyond the native `title` attribute (no Radix tooltip dependency).
