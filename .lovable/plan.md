## Problem

Two surfaces collapse leg context to just `leg.teamLabel`, so Draw / Spread / Total picks become unreadable.

### A. "MY TICKETS" list (and Confirm-modal stepper)

`src/components/sports/promo/ComboChallengeSection.tsx` — `TicketRow` (~L1348) and the confirm-modal list (~L1040) render only `leg.teamLabel`:

| Market    | Today's chip text   | Issue                       |
|-----------|---------------------|-----------------------------|
| Moneyline | `Brazil Win`        | OK                          |
| Draw      | `Draw`              | No match — `DRAW · DRAW · DRAW` |
| Spread    | `BRA -1.5`          | No matchup context          |
| Total     | `Over 2.5`          | No team / match at all      |

### B. Share poster (`ShareCardPreview`, same file ~L1518)

`getLegPosterContent` hardcodes `suffix: "Win"` for **every** market type and, for Draw, replaces the pick with the home team's name:

| Market    | Poster today                | Issue                                 |
|-----------|-----------------------------|---------------------------------------|
| Moneyline | `BRAZIL WIN` + match sub    | OK                                    |
| Draw      | `BRAZIL WIN` (home team!)   | Wrong pick — user actually bet Draw   |
| Spread    | `BRAZIL -1.5 WIN`           | Redundant "WIN" tail                  |
| Total     | `OVER 2.5 WIN` + match sub  | Nonsense suffix                       |

Flags also default to a generic ⚽ on Total because no team is parsed.

## Fix (UI only — no data / pricing changes)

All edits inside `src/components/sports/promo/ComboChallengeSection.tsx`.

### 1. Shared helper

Add `formatLegDisplay(leg: SelectedLeg)` that returns `{ match, pick }`:

| Market    | `match`         | `pick`              |
|-----------|-----------------|---------------------|
| Moneyline | `BRA vs JPN`    | `Brazil Win`        |
| Draw      | `BRA vs JPN`    | `Draw`              |
| Spread    | `BRA vs JPN`    | `BRA -1.5`          |
| Total     | `BRA vs JPN`    | `Over 2.5`          |

Both fields are derived from data already on `SelectedLeg` (`matchLabel`, `marketType`, `teamLabel`).

### 2. Ticket list (`TicketRow`)

Replace the single-line chip with a two-line chip per leg:
- Line 1 (muted, smaller): match (`BRA vs JPN`)
- Line 2 (bold, white): pick

Keep amber/zinc palette and `font-pitch`. Allow chips to wrap so 3 legs always render in full instead of being truncated.

### 3. Confirm modal leg list

Append the match name as a muted suffix on the same row: `01 — Draw · BRA vs JPN`. Keeps the existing single-row stepper layout intact.

### 4. Share poster (`getLegPosterContent` + render block)

Rewrite the helper so each market type produces a correct, readable label and the right flag:

- **Moneyline** → primary `{TEAM NAME}`, suffix `WIN`, secondary `{MATCH}`, flag from picked team.
- **Draw** → primary `DRAW`, suffix dropped (no "WIN"), secondary `{MATCH}`, flag from home team.
- **Spread** → primary `{TEAM} {±LINE}` (already concise), suffix dropped, secondary `{MATCH}`, flag parsed from team name (existing logic).
- **Total** → primary `OVER {LINE}` / `UNDER {LINE}`, suffix dropped, secondary `{MATCH}`, flag stays neutral ⚽.

Update the leg render block so `suffix` is rendered only when present (skip the spacing + colored span when empty), keeping the existing PosterTicketFrame layout untouched.

## Out of scope

- `SelectedLeg` shape, mock API, pricing, seeded ticket data.
- `LegSlot` (already shows `matchLabel`).
- Poster geometry / colors / background.

## Verification

- `/promo/world-cup?tab=combo` seeded tickets: each leg row shows match + pick; no row reads bare `DRAW`.
- Build a fresh combo mixing Moneyline + Draw + Total → confirm-modal shows match per leg, accepted ticket row shows match per leg.
- Open share dialog on each of the three seeded tickets (won / lost / pending): Draw leg shows `DRAW` (not "BRAZIL WIN"), Total leg shows `OVER 2.5` without trailing `WIN`, Spread leg shows `BRA -1.5` without trailing `WIN`. Moneyline still reads `BRAZIL WIN`.
