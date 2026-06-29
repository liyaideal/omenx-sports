## Goal
Surface a regulation-time resolution disclaimer on (a) the event trade page and (b) every game card in the league Games tab, so users know extra time / penalties don't count toward settlement.

Copy (exact):
> This market resolves based solely on the result at the end of regulation time (90 minutes plus stoppage time). Extra time and penalty shootouts are not counted.

## Scope
Applies only to soccer match-result markets — i.e. `market.kind === "match"`. League-winner / top-scorer / player-prop markets keep their own rules and are not touched. (All current `kind:"match"` data is soccer; if non-soccer matches are added later we can gate further on league.sport.)

## Changes

### 1. New shared component
**File:** `src/components/sports/RegulationTimeNotice.tsx`
- Small presentational component with `variant`:
  - `inline` — full-width subtle banner: `Info` icon + the full sentence, muted text, 1px border, rounded, same visual language as the existing amber live-delay notice but neutral (muted/border, not amber, since it isn't a warning).
  - `tooltip` — just an ⓘ icon (12–14px, muted) wrapped in shadcn `Tooltip`; content is the full sentence. For dense card surfaces.
- Helper export `marketUsesRegulationTimeResolution(market)` returning `market.kind === "match"` so callers don't repeat the gate.

### 2. Event trade page
**File:** `src/routes/event.$id.tsx`
- Render `<RegulationTimeNotice variant="inline" />` just below the event header block (around line 745 area, after the header `</header>` and before the chart/outcomes section), gated by `marketUsesRegulationTimeResolution(market)`.
- Mobile + desktop both show it; sits naturally above the price chart on both layouts.

### 3. Games-tab cards (league hub)
Two card types render in `view === "games"`:
- **`EventMarketTileCard`** (`src/components/sports/dashboard/EventMarketTileCard.tsx`) — the standard grid card.
- **`LiveStreamCard`** (`src/components/sports/dashboard/LiveStreamCard.tsx`) — the featured-kickoff card.

For each, add a `<RegulationTimeNotice variant="tooltip" />` ⓘ icon next to the existing meta line (kickoff time / "LIVE" pill area), only when `marketUsesRegulationTimeResolution(market)`. Tooltip-based so the dense card layout isn't disrupted.

### 4. Style guide
Per the project's Core memory rule, add a small demo of both `inline` and `tooltip` variants to `src/routes/style-guide.tsx` under an appropriate section (e.g. existing notices / disclosures section, or a new "Market disclosures" block).

## Out of scope
- Desktop dashboard match cards on `/` (not the Games tab).
- TradeDrawer (separate surface, can follow up if needed).
- Wording localization / per-league overrides.

## Verification
1. `/league/world-cup-2026?view=games` — every game card shows an ⓘ next to kickoff/LIVE; hover reveals the full sentence.
2. `/event/<a soccer match id>` — neutral banner visible below the header on desktop and mobile.
3. `/event/<league-winner id>` and `/event/<top-scorer id>` — no banner shown.
4. `/style-guide` — both variants render.
