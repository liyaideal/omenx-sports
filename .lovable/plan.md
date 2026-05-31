## Goal

On the league hub `games` view, the live-stream cards currently stack full-width (one per row), so two live matches dominate the screen. Render them in a 2-column grid (1 column on mobile) so when there are 2 live streams they sit side by side, matching the 3-up trade card grid below.

## Changes

**`src/routes/league.$slug.tsx`** (the live-stream block around line 246–258)

- Wrap the `liveStream.map(...)` output in a grid container instead of the current `space-y-3` stack:
  - `grid gap-3 md:grid-cols-2`
- Keep the "Featured kickoff" divider above the grid.
- No changes to `LiveStreamCard` itself — its internal `aspect-[16/9]` already scales down cleanly at half width.

That's the only edit. Mobile (`MobileEventsSection`) is untouched.
