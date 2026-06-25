## Problem
The frozen alert bar in the left sidebar is set to `whitespace-nowrap` on a ~256px-wide card, so "FROZEN · MMR 0% NO NEW BETS" overflows and gets clipped on the right ("NO NEW B…").

## Fix (single file: `src/features/pinpoint/Sidebar.tsx`)
Restructure the frozen indicator into a compact 2-row stack that always fits:

- Row 1 (centered, bold red): `🔒 FROZEN · MMR 0%`
- Row 2 (centered, muted, smaller): `NO NEW BETS ACCEPTED`

Changes:
- Drop `whitespace-nowrap` and the `justify-between` row layout.
- Use `flex-col items-center text-center gap-1`.
- Keep red border + black bg, same Lock icon, same copy semantics.
- Slightly increase vertical padding (`py-2.5`) so the two-line block reads as one alert chip rather than cramped text.

No logic change, no other files touched.