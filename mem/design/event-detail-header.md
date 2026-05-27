---
name: Event detail header contract
description: /event/$id header is a single two-column card — fixture left, outcome rows right, stats strip below. No separate outcome picker block underneath.
type: design
---
On `/event/$id`, the header is ONE card:

- Top row: `LeagueChip` + market-type pill (Match / Season winner / Top scorer / Prop) left, `CountdownPill` right.
- Body grid `lg:grid-cols-[1.2fr_1fr]` with `lg:divide-x lg:divide-border`:
  - Left: fixture crests (`72×72`) + `vs` + `whenLabel · kickoff`, or `<h1>{market.title}</h1>` + league name when no fixture.
  - Right: `Outcomes` eyebrow + stack of `HeaderOutcomeRow`s.
- Bottom: 4-up stats strip (Volume / 24h Vol / Traders / Ends) inside the same card, `border-t border-border`.

`HeaderOutcomeRow`: 56px tall, `rounded-xl`, layout = `[glyph] label … sparkline · ±N¢ · NN¢`. Selected = `bg-primary/10 ring-1 ring-primary/40`, idle = `bg-white/[0.02] ring-1 ring-white/[0.04]` + hover wash. Click sets `selectedIdx`; chart tone + TradeForm side follow.

Do NOT render `OutcomePicker` / `OutcomeSelector` / `OutcomePill` as a separate block below this header on the event page. Odds belong in the header right column.
