## Problem

Two related inconsistencies on the home dashboard:

1. **"FUTURES" is internal jargon.** Eyebrows like `EPL · FUTURES` appear on `LeagueWinnerMarketCard` and `TopScorerMarketCard`. "Futures" is a trading-desk term for long-horizon outcome markets (season winner, top scorer). A casual user doesn't know what it means.

2. **League identity has three different renderings** with no rule:
   - `MatchMarketCard` → pill chip: `[L] EPL` (gradient circle + text, on white/5 background)
   - `EventMarketTileCard`, `LeagueWinnerMarketCard`, `TopScorerMarketCard`, `UpcomingEventCard` → plain mono text: `EPL` or `EPL · FUTURES`
   - `MarketCard`, `HeroMarketCard`, `SentimentCard`, `TopMoverCard`, `EventHeader` → `<LeagueBadge>` component: gradient circle + label, no background pill
   - `MiniEventCard`, `MatchCard`, `PositionsTable` → `<LeagueBadge showLabel={false}>` (crest-only)

Same league, four visual treatments across one page. This is exactly what DESIGN.md should pin.

## Plan

### 1. Define the market-type taxonomy (user-facing copy)

Replace the trading jargon with plain labels. New mapping, applied at the eyebrow:

| Internal `market.kind` | Eyebrow label |
|---|---|
| `match` (1X2 / binary on a fixture) | `MATCH` |
| `leagueWinner` | `SEASON WINNER` |
| `topScorer` | `TOP SCORER` |
| `eventTile` (generic event market) | `EVENT` |

Eyebrow format becomes: `{LeagueChip} · {MARKET TYPE}`. No more "FUTURES".

### 2. Lock a single league chip pattern

Promote the `MatchMarketCard` pill chip to the canonical "league chip" and use it everywhere a league is named in a card header. Spec:

```
inline-flex items-center gap-1.5
rounded-full bg-white/[0.05] px-2.5 py-1
font-mono text-[10px] uppercase tracking-widest text-muted-foreground
+ leading crest (h-3.5 w-3.5 gradient circle with mono initials, from LeagueBadge presets)
```

Refactor `LeagueBadge` to add a `variant="chip" | "inline" | "crest"`:
- `chip` — the new canonical card-header pill (replaces today's `MatchMarketCard` inline JSX and all plain `{market.league.short}` text usages)
- `inline` — current default (crest + label, no background), used in list rows / sentiment cards
- `crest` — `showLabel={false}` (today's behavior), used inside dense tables and mini cards

Then update every header to one shape:

```
<LeagueChip league="epl" /> · <span>MATCH</span>
```

Files touched (read-only list, will edit in build mode):
- `src/components/sports/LeagueBadge.tsx` — add `variant`, keep crest colors
- `src/components/sports/dashboard/MatchMarketCard.tsx` — use `<LeagueChip>` + `MATCH`
- `src/components/sports/dashboard/EventMarketTileCard.tsx` — use `<LeagueChip>` + `EVENT`
- `src/components/sports/dashboard/LeagueWinnerMarketCard.tsx` — `<LeagueChip>` + `SEASON WINNER`
- `src/components/sports/dashboard/TopScorerMarketCard.tsx` — `<LeagueChip>` + `TOP SCORER`
- `src/components/sports/dashboard/UpcomingEventCard.tsx` — `<LeagueChip>` + match time
- `src/routes/style-guide.tsx` — add a "League chip" row showing all 3 variants + the eyebrow pattern, and a "Market type labels" table

### 3. Write the rules into DESIGN.md (so it doesn't drift back)

Add to §4 Component Stylings:

> **League chip (card header).** One canonical pill: `bg-white/[0.05]` rounded-full, `h-3.5w-3.5` gradient crest + `font-mono text-[10px] uppercase tracking-widest`. Use `<LeagueBadge variant="chip">` everywhere a league is named at the top of a card. Never render `{market.league.short}` as bare text.
>
> **Market-type eyebrow.** Format is `{LeagueChip} · {TYPE}`. TYPE comes from the fixed vocabulary: `MATCH`, `SEASON WINNER`, `TOP SCORER`, `EVENT`. No internal jargon ("FUTURES", "1X2", "outright") on user-facing surfaces.

Add to §7 Do's and Don'ts:

> - **Don't** render a league as plain text in a card header — always the chip.
> - **Don't** use trading desk jargon ("FUTURES", "Outrights", "Moneyline") in card eyebrows. Use the plain English vocabulary in §4.
> - **Don't** ship a new card type without picking a `variant` from the league chip system; if none fits, extend §4 first.

### 4. Memory

Save `mem://design/league-chip` with the chip spec + market-type vocabulary so it survives future sessions, and add a one-line Core entry in `mem://index.md`:

> League name in any card header → `<LeagueBadge variant="chip">`; market type eyebrow uses the fixed vocab (MATCH / SEASON WINNER / TOP SCORER / EVENT). Never "FUTURES".

## Out of scope

- No layout changes, no color changes, no copy changes outside the eyebrow.
- Crest-only usages inside dense rows (`PositionsTable`, `MiniEventCard`, `MatchCard`) stay as-is — they are the `crest` variant and already consistent.
