## Goal

Restore the documented unlock cadence for the LIVE round to its original rule: clues unlock progressively via community vote, with the 3rd clue gated by ≥60% vote. Fix the misleading "randomised per round" copy I added previously.

## Scope (style-guide copy only)

Edit only `src/routes/style-guide.tsx` → `LegendClueScript` intro paragraph (lines 2959–2967). No data, no product UI, no component logic changes.

Underlying data already reflects the rule correctly: in `LEGEND_ROUNDS` round-03 (ESP / Iniesta, status `voting`), clue ① POSITION is `revealed`, ② PEAK CLUB is `revealed`, ③ MAJOR TROPHY is `locked` with `unlockHint: "Unlocks after 60% community vote"`. The table already renders this faithfully — only the prose above it needs to match.

## New intro copy

Replace the current paragraph with:

> Three clues per round, fixed labels: **POSITION · PEAK CLUB · MAJOR TROPHY**.
> Within a LIVE round the clues unlock progressively via community vote — clue ① is open at launch, ② unlocks after ~30% vote, ③ unlocks after ≥60% vote (the final reveal before lock-in). Past rounds (HIT / MISS) show all three for archive review. Upcoming rounds (TBA) list the full clue set here for QA only; in product they stay hidden until the round goes live.

## What stays unchanged

- `LEGEND_ROUNDS` data and clue `state` values
- Table columns, status colors, lock icon + `unlockHint` rendering
- `GuessTheLegendTab`, `LegendBayPlayground`, and all product components
- Source-of-truth footnote at the bottom of the section