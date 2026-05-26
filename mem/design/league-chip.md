---
name: League chip + market-type eyebrow
description: Single league identity in card headers and the fixed user-facing vocabulary for market types (no FUTURES jargon).
type: design
---
Card-header eyebrow is always `<LeagueChip> · TYPE`.

- `<LeagueChip>` from `src/components/sports/LeagueBadge.tsx` is the ONLY way to name a league in a card header. Never render `{market.league.short}` as bare text.
- Accepts `league` (preset key: epl|laliga|ucl|seriea|nba) or `short` (free-form, resolves to preset or neutral fallback).
- Spec: `rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground` + leading `h-3.5 w-3.5` gradient crest.

Variants of the same identity system:
- `LeagueChip` — card-header pill (canonical)
- `LeagueBadge` — inline crest + label, no background (list rows, sentiment)
- `LeagueBadge showLabel={false}` — crest only (dense tables, mini cards)

Market-type TYPE vocabulary (user-facing, no jargon):
- 1X2 / binary on a fixture → `MATCH`
- league winner → `SEASON WINNER`
- top scorer → `TOP SCORER`
- generic event tile → `EVENT`

Banned in eyebrows: `FUTURES`, `Outrights`, `Moneyline`, `1X2`.
