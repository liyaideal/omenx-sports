# Project Memory

## Core
- Section h2 baseline: `min-h-9 leading-9`. Never `leading-none` on a section h2.
- Cards in a grid row: `h-full flex flex-col` + `mt-auto` footer. Never fixed pixel heights.
- Events grid default = 1 row; expand via dashed ghost `ShowMoreEventsButton`.
- League in a card header = `<LeagueChip>` only. Never bare `{market.league.short}` text.
- Market-type eyebrow vocab: MATCH / SEASON WINNER / TOP SCORER / EVENT. Never "FUTURES" or other trading jargon.

## Memories
- [League chip + market-type eyebrow](mem://design/league-chip) — canonical chip spec and user-facing TYPE vocabulary
