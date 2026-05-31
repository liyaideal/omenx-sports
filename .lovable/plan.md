## Goal
Make `/league/world-cup-2026` feel like a real tournament destination — not just another league hub. Today the page reuses the generic `LeagueHubHero` + tabs + card grid; nothing on screen signals "World Cup". We'll layer in tournament-specific atmosphere without touching unrelated leagues.

## Scope
Only the World Cup hub (`league.kind === "tournament"` + slug `world-cup-2026`). EPL/LaLiga/UCL stay untouched. Visual/presentation only — no data-shape or business-logic changes.

## Changes

### 1. Tournament hero upgrade (`LeagueHubHero`)
Add a `variant="tournament"` branch (or a new `WorldCupHubHero` wrapper) used only when `league.kind === "tournament"`:
- Full-bleed pitch-stripe background: layered green diagonal stripes at very low opacity over the existing accent radial-gradients.
- Animated confetti/sparkle layer (CSS-only, `motion-safe`) — a few floating dots in the league accent.
- Countdown pill to kickoff ("Jun 11, 2026 · MetLife") next to the existing badge row.
- Host-nation flag trio (🇺🇸 🇨🇦 🇲🇽) as small rounded chips under the tagline.
- Trophy glyph (lucide `Trophy`) behind the crest with a soft glow.
- Live stat strip beneath the title: `48 nations · 104 matches · $1.00B volume` using existing tournament data (groups count, bracket matchup count, WC26 winner market volume).

### 2. Page-level ambience (`league.$slug.tsx`, tournament branch only)
Wrap `HubContent` in a tournament-only ambient layer:
- Subtle fixed-position confetti/streamer SVG in the page background (very low opacity, behind content, `pointer-events-none`).
- A thin "Road to MetLife — Final Jul 19, 2026" marquee strip directly above `HubTabs`, with a small pulsing dot and the trophy icon.

### 3. Tab styling accent
When on the tournament hub, give the active tab a gold underline (using accent OKLCH) and add a tiny trophy icon next to the "Bracket" tab label only. Implemented inside `HubTabs` via an optional `accent` prop passed from the page; non-tournament leagues unchanged.

### 4. Games section header
For the tournament branch, prepend a small "Group Stage · Jun 11–27" section label above the live-stream block and a "Knockouts" label above the regular grid once knockout matchups exist. Keeps the cards themselves untouched.

### 5. Style-guide mirror
Add a "World Cup atmosphere" showcase block in `src/routes/style-guide.tsx` rendering the new hero variant + ambient marquee, per the project's playground-in-sync rule.

## Files touched
- `src/components/sports/league/LeagueHubHero.tsx` — add tournament variant
- `src/components/sports/league/HubTabs.tsx` — optional accent prop
- `src/routes/league.$slug.tsx` — tournament-only ambient wrapper + section labels
- `src/components/sports/league/WorldCupAmbience.tsx` (new) — confetti/marquee/background layer, isolated so it's easy to remove post-tournament
- `src/routes/style-guide.tsx` — showcase

## Out of scope
- Mobile homepage spotlight card (already World Cup themed)
- Event detail pages
- Data changes in `src/data/tournament.ts` or `src/data/leagues.ts`
- Other leagues' hubs

## Open question
Tone preference: **(A) Festive** — visible confetti, gold accents, marquee, animated sparkles. **(B) Editorial** — pitch stripes + trophy glow + countdown only, no confetti/marquee. I'll default to **A (festive)** unless you say otherwise — it's a World Cup, lean in.
