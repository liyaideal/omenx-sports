# Project Memory

## Core
- Section h2 baseline: `min-h-9 leading-9`. Never `leading-none` on a section h2.
- Cards in a grid row: `h-full flex flex-col` + `mt-auto` footer. Never fixed pixel heights.
- Events grid default = 1 row; expand via dashed ghost `ShowMoreEventsButton`.
- League in a card header = `<LeagueChip>` only. Never bare `{market.league.short}` text.
- Market-type eyebrow vocab: MATCH / SEASON WINNER / TOP SCORER / EVENT. Never "FUTURES" or other trading jargon.
- Price delta always signed with ¢ unit (`+3¢` / `−1¢` / `0¢`), title="24h change". Never bare numbers.
- No page-level footer on product/dashboard pages. Footers only on SEO/content pages (SeoPageLayout convention).
- Visible copy: each card = an **event**; each priced row under it = a **market**. The word "Outcome" is banned from UI labels — use "Market" / "Markets".

## Memories
- [League chip + market-type eyebrow](mem://design/league-chip) — canonical chip spec and user-facing TYPE vocabulary
- [Price pill delta format](mem://design/price-delta) — signed +N¢/−N¢/0¢ with 24h tooltip
- [No footer on product pages](mem://design/no-product-footer) — footers reserved for SEO/content pages, matches OmenX convention
- [Event detail header](mem://design/event-detail-header) — single two-column card (fixture left, outcomes right, stats below); no separate outcome picker block
- [Section side-rail height](mem://design/section-side-rail) — side panels use h-fit + lg:self-start (never h-full); long main columns wrap to xl:grid-cols-2
- [Event vs Market copy](mem://copy/event-vs-market) — event = real-world thing; market = priced row; "Outcome" banned from visible copy
