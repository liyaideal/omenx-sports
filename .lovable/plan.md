## Fix 1 — Sidebar can't scroll

`src/features/pinpoint/Sidebar.tsx` root is `flex w-[288px] shrink-0 flex-col gap-3 p-4`. Its parent in `src/routes/pinpoint.tsx` is a fixed-height flex row (`h-[calc(100vh-56px)]`), but the sidebar itself has no `overflow-y` and no `min-h-0`, so anything past the viewport (LEVERAGE card, the new disclosure footer) is simply clipped and unreachable.

- Change the root to `flex w-[288px] shrink-0 flex-col gap-3 p-4 overflow-y-auto min-h-0 pp-sidebar-scroll`.
- Add a tiny scoped scrollbar style in `pp-theme.css` (`.pp-sidebar-scroll::-webkit-scrollbar { width: 6px }` + LCD-green thumb) so the scrollbar matches the cartridge look instead of the default OS bar.

## Fix 2 — Balance card overflows and SESSION P/L is orphaned

Today in `AccountBlock.tsx`:
- `$11,843` renders at `text-3xl` (Press Start 2P) inside a ~256px-wide card → it eats the whole row and pushes `+$1…` off the right edge.
- The `+$xxx` chip sits on the balance row while the label `SESSION P/L` lives on a separate row below it, so the two halves of the same datum are visually divorced.

Rebuild the balance zone so it always fits 256px and keeps each datum unified:

```text
BALANCE                                 1 OPEN
$11,843
SESSION P/L                          +$19
─────────────────────────── (margin bar below)
```

Concrete changes in `AccountBlock.tsx`:
1. Drop the balance display from `text-3xl` to `text-2xl` and add `tabular-nums leading-none` so 5–6 digit balances never wrap or overflow. For 7+ digits, fall back to compact format (`$1.2M`).
2. Move the `+$xx` session-P/L value onto the same row as the `SESSION P/L` label (label left, value right, `justify-between`). Remove the standalone P/L chip from the balance row.
3. Keep `BALANCE` + `N OPEN` as the top row, then balance number on its own row, then `SESSION P/L … ±$xx` row, then the MARGIN/HEALTHY bar exactly as today.
4. Use `min-w-0` on the flex children so long numbers truncate rather than push siblings off-screen.

## Out of scope

No economic / spec changes. No restyle of LV / XP / trophies / MARGIN bar — only the balance row layout and the sidebar scroll behavior.

## Files touched

- `src/features/pinpoint/Sidebar.tsx` — add `overflow-y-auto min-h-0` + scrollbar class on root.
- `src/features/pinpoint/AccountBlock.tsx` — rebuild balance zone (font size, row layout, P/L pairing, compact formatter).
- `src/features/pinpoint/pp-theme.css` — add `.pp-sidebar-scroll` webkit scrollbar styling.
- `src/routes/style-guide.tsx` — mirror the new balance-row layout in the Player HUD demo so playground stays in sync (Core memory rule).
