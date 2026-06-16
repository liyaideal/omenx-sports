---
name: Share poster — OMENX stadium
description: Vertical share poster style for combo tickets (ShareCardPreview): black stadium night + neon yellow-green ticket bracket + gold OMENX wordmark
type: design
---
Component: `ShareCardPreview` in `src/components/sports/promo/ComboChallengeSection.tsx`.

- Canvas: 1080×1700, container-query units (`cqw`) for scale.
- Palette: bg `#050505`, neon green `#C6FF3D` (ticket strokes, WIN), gold `#F2D024` (OMENX accents, REWARD, ABCD2026, arrow), white headlines.
- Background: two top stadium light cones (top-left + top-right radial gradients in neon green) + dot grid overlay (`.poster-dot-grid`).
- Typography: `font-poster` (Audiowide) for all display text; loaded via `__root.tsx` Google Fonts link.
- Structure (top → bottom): OMENX wordmark · trophy-in-viewfinder + "WORLD CUP 4-LEG COMBO" · stake→reward hero · "4 PICKS. HIT ALL 4." · main ticket frame (chevron number + flag circle + TEAM WIN rows + STAKE/ODDS/REWARD stats row) · bottom SHARE & INVITE ticket (referral code + QR).
- Ticket frame: 2px neon outline + 4 mid-edge die-cut notches (`PosterTicketFrame` helper).
- Carnival LED palette (amber/orbitron) is for page heroes, NOT this poster. Do not mix.