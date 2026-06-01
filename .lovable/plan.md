## Goal

The "Related events" strip on the event detail page currently fabricates fake same-fixture alt-markets (Both teams to score / Over 2.5 / Anytime scorer / Over 4.5 cards) and swaps the chart in-place. We are not shipping those handicap/alt-line products. Rework the module so each chip is a real other event related to the current one and **navigates** to that event's detail page. If no related events exist, the whole module is hidden.

## Behavior

- Each chip = a real entry from `ALL_MARKETS`, linking to `/event/$id` for that market.
- The current event is **not** in the strip (no "active" chip, no in-page swap).
- Module hides entirely when the related list is empty.
- Label on each chip is the related event's `title` (e.g. "Group A — Winner", "Canada — Group A Winner", "World Cup 2026 — Champion").

## Relatedness rule (data-driven, no manual mapping)

For a given market `M`, related = other markets in `ALL_MARKETS` that match any of:
1. **Same fixture** — same home+away team shorts (either direction).
2. **Shared team** — any team that appears in `M` (via `fixture.home/away`, `outcomes[].team`, or `subject`) also appears in the candidate.
3. **Same league + same tournament context** — e.g. both reference the same WC group standings or both belong to the same `league.code`.

De-dup by `id`, exclude `M` itself, cap at ~6 chips.

For pure non-fixture markets with no team signal (rare), result is `[]` and the bar hides — matching the user's "if no related events, don't show" requirement.

## Mock data top-up

Add a small number of new realistic events to `src/data/sports-markets.ts` so the current preview route (`/event/wc26-can-bih`) actually has chips:
- "Canada to advance from Group A" (Y/N)
- "BiH to advance from Group A" (Y/N)
- (Group A — Winner and WC26 Champion already exist and will surface automatically.)

All additions are plain Y/N or multi-outcome question events — no handicap, no over/under, no alt-line products.

## Files

- `src/components/sports/event/related-markets.ts` — replace `getRelatedMarkets` to return real related `SportsMarket[]` from `ALL_MARKETS` using the rule above. Drop `getRelatedChipLabel` (chip label is just the event title now).
- `src/components/sports/event/RelatedMarketsBar.tsx` — change API to `{ markets: SportsMarket[] }`. Render each chip as a `Link to="/event/$id"`. Return `null` when `markets.length === 0`. No active state, no `onSelect`.
- `src/routes/event.$id.tsx` — remove `activeRelatedIdx`, `active`, the related-driven `useEffect`s, and the chip-swap logic. Page always renders the loaded `market`. Pass `getRelatedMarkets(market)` to the bar.
- `src/data/sports-markets.ts` — add the two Canada/BiH advance events (and any other small additions needed so common fixtures show ≥1 chip).
- `src/routes/style-guide.tsx` — update the `RelatedMarketsBar` demo to the new nav API and refresh the description text (no longer an in-page tab strip).

## Out of scope

No design changes to the chip visuals beyond removing the active/selected pill state. No changes to chart/order book/trade form wiring beyond deleting the now-dead `active` indirection.
