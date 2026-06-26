## Goal

Rebuild ONLY the mobile Fans tab UI (`/fans` on mobile) to match Figma frame `1:10216` 1:1. Desktop and all data/interaction logic stay exactly as today.

## Scope (mobile only)

Replace the contents of `src/components/sports/mobile/MobileFansSection.tsx` with a Figma-faithful layout composed of three blocks, top to bottom:

1. **Section header**
   - Green 3px vertical bar + "FANS ZONE" (Bebas Neue, uppercase, white)
   - Right side: "Add Teams" outline pill (opens existing `TeamPickerSheet` — same dialog desktop uses)
   - Caption below: "Editor's pick · follow your team to personalize"

2. **Editor's pick match card** (full-bleed dark card, 1px border, 16px radius)
   - Top-left: yellow `🏆 WORLD CUP` chip
   - CAN flag block | "CAN" big | "vs" | "BIH" big | BIH flag block (flag fills behind team code, dimmed)
   - Tri-segment bar (green / grey / red) sized by 53/26/22 probs
   - 3 outcome rows (dot · name · cents bold · trend pill)
     - Canada — 53¢ · `+2¢` green pill
     - Draw — 26¢ · `0¢` neutral
     - Bosnia and Herzegovina — 22¢ · `-2¢` red pill
   - Footer row: clock · "Tomorrow 3:00pm" — right: 👥 1,840 · "Vol $208K"

3. **Follow your team card**
   - "FOLLOW YOUR TEAM" (Bebas) + small description
   - 5 circular crests in a row (flag/logo over dark disc, hue glow ring) with overlay `+` or `✓` badge
   - Bottom row: left "Tap a crest to follow" caption · right `Save` green pill
   - Reuses existing follow-state logic from `FollowTeamsPanel` (toggle + save → toast)

4. **Live Activity card**
   - Green bar + "LIVE ACTIVITY" (Bebas) + "9 IN 5M" outline pill on right
   - Sub-line: "Following · United States, Mexico"
   - Rows: avatar | `@handle` + `Bought`/`Sold` (green/red) + colored outcome pill (Yes 97¢ / Draw 25¢ / Mexico 26¢ etc.) on row 2; right column shows relative time (3M / 2S / 21S). Bottom hairline divider between rows.
   - Reuses existing `LIVE_TRADES` data; mapping rendered inline (no reuse of desktop `LiveActivityCard` styling).

All three cards: `bg-[#0d1216]/0` over page bg, border `rgba(255,255,255,0.06)`, radius 16, padding 16. Numbers use Archivo mono-feeling weights.

## Files

- **Rewrite** `src/components/sports/mobile/MobileFansSection.tsx` — new layout. Internal subcomponents kept in same file unless > ~250 lines, then split into `src/components/sports/mobile/fans/` (FansHeader, EditorPickCard, FollowTeamGrid, LiveTradeFeed).
- **No changes** to: `src/routes/fans.tsx`, desktop `FansZoneEmpty`, `FollowTeamsPanel`, `LiveActivityCard`, `FanZoneHeader`, data files, or any backend logic.
- **Style guide**: add a mobile Fans demo block under the existing mobile section in `src/routes/style-guide.tsx` (per Core memory rule) wrapped in a 390px frame.

## Data

Uses existing mocks already imported (`FEATURED_MATCH`, `FOLLOWED_TEAMS`, `SUGGESTED_TEAMS`, `LIVE_TRADES`, `TEAMS`). For the 3-outcome match card I'll derive `home/draw/away` from `FEATURED_MATCH.markets` (already structured this way for desktop). If the data only has 2 outcomes, fall back to a 2-segment bar.

## Interactions (identical to desktop)

- "Add Teams" pill → opens `TeamPickerSheet` (same bottom-sheet desktop also uses on mobile)
- Crest tap → toggle local follow state
- `Save` → `toast.success("Following N teams")`, same as `FanZoneHeader`
- Live activity rows: presentational only (matches desktop)

## Out of scope

- The other 2 Figma frames in section `1:10215` (different empty/manage states) — will tackle after this lands if you want them
- Any change to desktop `/` or `/fans` desktop pane
- Bottom nav (already exists, untouched)
