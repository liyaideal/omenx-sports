## Goal
When an event is live, surface the score in the event header (the top "MEXICO vs SOUTH AFRICA" module), not just inside the stream window — so users see authoritative data immediately on landing, ahead of the 30–60s stream delay.

## Where
`src/routes/event.$id.tsx` — the fixture header block (~lines 704–723), the center column that today renders the serif "vs" + kickoff chip (e.g. `3:00PM · TODAY`).

`isLive` already exists at line 450:
`const isLive = Boolean(market.isLiveStream && market.fixture && market.liveScore);`

`market.liveScore` is `{ home: number; away: number }` (from `src/data/sports-markets.ts`).

## Change
Swap the center column's contents based on `isLive`:

- **Not live (unchanged):** serif "vs" + `kickoff · whenLabel` pill.
- **Live:** broadcast-style score, matching the in-stream scoreboard's visual language but sized for the header:
  - A small pulsing `● LIVE` pill on top (pink, same token as existing LIVE chips).
  - Center: `{home}  –  {away}` in large display numerals (`font-display`, tabular-nums, e.g. `text-5xl`), with a thin divider dash.
  - Below the score: a single muted line `Live · official scoring` with the existing `LiveDelayInfo` ⓘ trigger (variant="score") on the right, so the 30–60s delay disclosure is one tap/hover away (per the live-delay-disclosure memory rule — ⓘ on every live chip).
- Keep both crests + team names exactly as they render now on either side.

Reuse `LiveDelayInfo` from `src/components/sports/live/LiveDelayInfo` (already used in `EventLiveStage`, `FullscreenStreamOverlay`, `GlobalStreamMiniPlayer`).

## Style-guide mirror
Add a "Live event header" variant alongside the existing event header demo in `src/routes/style-guide.tsx` so the live-vs-scheduled split is documented (per the Core rule: playground must mirror product).

## Out of scope
- No minute/period clock (data model doesn't carry it; can be added later if `liveScore` grows a `minute` field).
- No changes to the stream scoreboard, mini player, mobile live hero, or fullscreen overlay.
- No layout changes to the right-side stats panel (Total Volume / Live Players).
