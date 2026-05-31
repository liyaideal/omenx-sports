## Goal

`GroupWinnerCard` shows a `TypeChip` (e.g. "Group winner", amber). `BinaryQuestionCard` doesn't — it just stacks an icon + title. Add a matching `TypeChip` so the binary cards in the Props grid feel consistent with the rest of the section.

## Category mapping

Pick the chip label from `market.kind` plus a small heuristic on the id/league so the right label shows for the three flavors we ship today:

- `kind === "league-winner"` and id starts with `wc26-grpa-`/`wc26-grpb-`/… → `Group winner` (icon: `Users`, tone: `amber`)
- `kind === "league-winner"` otherwise → `Tournament winner` (icon: `Trophy`, tone: `amber`)
- `kind === "top-scorer"` → `Top scorer` (icon: `Target`, tone: `amber`)
- `kind === "player-prop"` → `Player prop` (icon: `Target`, tone: `violet`)
- `kind === "match"` (rare here — match-binary like "Liverpool to beat Newcastle") → `Match prop` (icon: `Swords` or skip the chip)

A tiny helper `getBinaryChip(market)` inside `BinaryQuestionCard.tsx` returns `{ label, icon, tone }`. No new shared util needed.

## Changes

**`src/components/sports/league/BinaryQuestionCard.tsx`**

- Import `CardHeader`, `TypeChip` from `@/components/sports/CardChip`; drop the local `HelpCircle`/`Trophy`/`Target` avatar block.
- Replace the current `<header>` (avatar square + title) with `CardHeader` so we get the same chip-above-title rhythm as `GroupWinnerCard`:
  - `chip={<TypeChip icon={chipIcon} label={chipLabel} tone={chipTone} />}`
  - `title={market.title}` with `titleSize="sm"` and allow 2-line wrap (override the default `truncate` by passing the title as a node when needed — simplest: pass a `<span className="line-clamp-2 ...">` node).
- Keep the existing gauge + YES/NO rows + footer untouched.

No data changes; no other components touched. `GroupWinnerCard`'s own "Group winner" chip is unchanged.

## Style guide sync

`/style-guide` already renders `BinaryQuestionCard` via the PropsGrid demo (uses `getBinaryQuestionsByLeagueSlug("world-cup-2026")`), so the chip shows up automatically — no extra edit needed.
