## Goal

In the "Live & upcoming Events" section (`src/routes/index.tsx`, middle column), prepend a row of **Live Stream Cards** — one card per match the platform is currently streaming. Each card consolidates everything from the reference screenshot (live badge, video preview, score header, match clock, and key markets) into a **single, visually prominent card** that clearly outranks the regular upcoming event tiles below.

## Scope

- Frontend / presentation only. No backend, no real video player.
- Mock data: flag 1–2 markets in `MATCH_MARKETS` as `isLiveStream: true` with a poster image, score, and clock.
- Reuses existing design tokens (`bg-surface`, `text-accent`, `font-mono`, etc.) — no new global tokens.

## Card anatomy (single card, all-in-one)

```text
┌────────────────────────────────────────────────────┐
│ [● LIVE] UEFA Champions League         [CC] [⤢]   │  ← top bar: lime LIVE pill + league + utility icons
├────────────────────────────────────────────────────┤
│                                                    │
│            ▶  video poster / stream                │  ← 16:9 poster image with play overlay
│                                                    │
├────────────────────────────────────────────────────┤
│ 🛡 Man Utd  2   —   0  Bayern 🛡   ⏱ 00:43:43      │  ← score strip + live clock
│ ──────●──────────────────────────                  │  ← match-progress bar
├────────────────────────────────────────────────────┤
│  -3.5  120¢    o 2.5  -30¢          [ Trade ]      │  ← 2 key markets + primary CTA
└────────────────────────────────────────────────────┘
```

Visual emphasis vs. neighboring `EventMarketTileCard`:
- Larger (full-width of the events column on `md+`, spans all grid columns).
- Lime LIVE pill + thin pulsing ring/border using `--accent`.
- Video poster gives it real visual weight.
- Stack vertically if there are multiple live streams (one card per stream).

## Files

**New**
- `src/components/sports/dashboard/LiveStreamCard.tsx` — the card component. Props: `{ market, posterUrl, score: { home, away }, clock, leagueLabel, onTrade? }`. Includes:
  - Top bar with `LIVE` pill (lime, dot-pulse) + league name + CC/cast icon buttons (visual only).
  - 16:9 `<img>` poster with centered play/pause glyph overlay and gradient scrim.
  - Score row: home crest + name + score · `vs` · away score + name + crest · live clock (`font-mono tabular-nums`).
  - Progress bar (derived from clock vs. 90:00).
  - 2 market chips reused from the market data (e.g. spread + total) + a `Trade` button linking to the event detail route.

**Modified**
- `src/data/sports-markets.ts` — extend `SportsMarket` type with optional `isLiveStream?: boolean`, `livePoster?: string`, `liveScore?: { home: number; away: number }`, `liveClock?: string`. Flag 1–2 existing `dayOffset: 0` matches as live with poster URLs (Unsplash stadium/football imagery already used elsewhere) and mock scores/clocks.
- `src/routes/index.tsx` — in the "Live & upcoming" section, before the existing grid, render:
  ```tsx
  {liveStreamMarkets.length > 0 && (
    <div className="flex flex-col gap-3">
      {liveStreamMarkets.map((m) => <LiveStreamCard key={m.id} market={m} ... />)}
    </div>
  )}
  ```
  Derive `liveStreamMarkets = MATCH_MARKETS.filter(m => m.isLiveStream)` and exclude them from `visibleMarkets` so they don't double-render below.
- `src/routes/style-guide.tsx` — add a small showcase entry under section 17 ("Live & Upcoming") so the new card is documented in the style guide.

## Interactions

- `Trade` button → existing event detail route (`/event/$id`).
- CC / cast icons are visual placeholders (no handlers).
- No real video — poster image only, with a static play glyph. This keeps it within frontend scope per the user's request.

## Out of scope

- Real video streaming, picture-in-picture, captions.
- Mobile-specific full-bleed layout — current responsive grid already adapts; we just make the card span the full middle column on every breakpoint.
