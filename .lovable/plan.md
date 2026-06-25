## Goal
Left column split into two stacked blocks by dimension; right column unchanged (grid). Top-row Event tabs removed, freeing vertical room. Everything fits 1024×780 with no scroll.

## Layout

```
┌─ Header (slim) ───────────────────────────────────────────────────┐
│ ← BACK   PINPOINT  BETA                            🔊  ⓘ  RULES   │
├─ Left 260px ─────────────────────────┬─ Right (grid, unchanged) ──┤
│ ▣ ACCOUNT BLOCK (higher dimension)   │                            │
│   ┌ Player ID strip ───────────────┐ │                            │
│   │ [P1] LV 01  ▓▓░░ 240/500 XP   │ │                            │
│   │ W 12 · L 8 · BEST 5×           │ │                            │
│   │ 🏆🏆🏆⬚⬚⬚                       │ │                            │
│   ├ Balance / Session / Margin ───┤ │                            │
│   │ BAL $29           0 OPEN       │ │                            │
│   │ SESSION   −$9971               │ │                            │
│   │ MARGIN ▓▓▓░░░     HEALTHY      │ │                            │
│   └───────────────────────────────┘ │                            │
│                                      │                            │
│ ▣ PER-BET STACK (this bet)           │                            │
│   1. EVENT     USA vs PAR ⌄          │                            │
│   2. MARKET    USA · DRAW · PAR      │                            │
│   3. BET SIZE  $10…$5K               │                            │
│   4. LEVERAGE  1× / 2× / 3×          │                            │
│   5. STOP                            │                            │
└──────────────────────────────────────┴────────────────────────────┘
```

### ACCOUNT block (top)
One framed card with two zones, separated by a hairline divider so the dimension reads as one unit:

- **Identity zone** (from PlayerCard, compacted to a horizontal strip):
  - Pixel avatar (40px) + `P1 · LV 01` + thin XP bar with `240/500` caption
  - Sub-row: `W 12 · L 8 · BEST 5×`
  - Trophy row: 6 slots, 16px each (filled/empty)
  - No big "metal nameplate" frame — flattened to fit the LCD card language
- **Balance zone**:
  - Row 1: `BALANCE $29` left · `0 OPEN` right
  - Row 2: `SESSION` left · `−$9971` right (color: green/red)
  - Row 3: `MARGIN` label · `HEALTHY/WARN/DANGER` right · full-width bar underneath
  - Margin bar is the most important signal — keep at full card width with color state

Hairline divider between identity and balance zones (`border-t border-[var(--pp-line)]/40`).

### PER-BET stack (bottom)
Order matches fill-in flow: Event → Market → Size → Leverage → Stop.

- **EVENT** card: active matchup + live clock as closed state; click opens a popover listing all live events with score + time. Switching event resets `activeOutcomeId` to that event's first market.
- **MARKET** card: 3 outcome chips (USA / DRAW / PAR) with cent prices.
- **BET SIZE** card: 6-chip grid, current selection highlighted.
- **LEVERAGE** card — rebuilt as 4 clean rows (currently labels overlap):
  ```
  ⚡ LEVERAGE                          3×
  [ 1× ]   [ 2× ]   [ 3× ]
  MARGIN $10  ·  NOTIONAL $30
  HIGH RISK · CROSS · PAYOUT · Q/E         (muted caption)
  ```
- **STOP** button: full-width red emergency close.

## Files to edit

- `src/features/pinpoint/AccountBlock.tsx` *(new)* — combined identity + balance card.
- `src/features/pinpoint/EventSelector.tsx` *(new)* — active event header + popover list.
- `src/features/pinpoint/Sidebar.tsx`
  - Replace contents with `<AccountBlock />` + per-bet stack (`EventSelector`, MarketTabs, BetSize, Leverage rewrite, Stop).
  - Width kept at 260px.
  - Drop sound/rules buttons (move to header).
- `src/features/pinpoint/PlayerCard.tsx` — delete (replaced by identity zone in AccountBlock).
- `src/features/pinpoint/EventTabs.tsx` — delete (folded into EventSelector).
- `src/routes/pinpoint.tsx`
  - Remove the top EventTabs row.
  - Header right cluster: just utility buttons (sound, info/rules). No AccountStrip, no PlayerCard.
  - Pass `groups`, `activeEventId`, `onSelectEvent` + existing account/stats props into the new `Sidebar`.
  - Switching event resets `activeOutcomeId` to that event's first market.
- `src/routes/style-guide.tsx` — showcase `AccountBlock` and `EventSelector`; refresh Leverage recipe.
- `DESIGN.md`
  - §5 Layout: "Left column = two dimensions stacked. Top: account/identity (cross-session). Bottom: per-bet stack (this bet)."
  - §7 Don'ts: "Don't mix per-bet inputs with account-level data in the same card."
  - §4 Components: AccountBlock two-zone recipe + EventSelector + Leverage 4-row structure.

## Vertical budget check (780px viewport)
- Header 48px · gap 12 · AccountBlock ~190 (id 110 + balance 80) · gap 8 · Event 56 · Market 84 · BetSize 130 · Leverage 168 · Stop 44 → ~840 → trim to ~770 by tightening paddings & XP/trophy row to 14px icons.

## Out of scope
Right-side grid/canvas, sound system, bet logic.
