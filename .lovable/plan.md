# Airdrop position variant in PositionsTable

Mirror OmenX main site's airdrop position row inside the sports zone's `PositionsTable`. An airdrop position behaves like a normal position **except**:

- An `AIRDROP` pill (purple, with `Gift` icon) is shown to identify it.
- TP / SL is disabled — the cell renders a small lock icon instead of the `+TP/SL` button or `TP/SL` pencil chip.
- Hovering the disabled lock shows tooltip: "Voucher positions don't support TP/SL. Close manually within the hold window."
- Leverage is conceptually capped at 5× (we just render whatever the row holds — the cap is enforced upstream when an airdrop is issued; for the demo row we use `5×`).

Everything else (Size / Entry / Mark / Margin / Liq / PnL / ROE / Close) stays identical to a normal row so airdrop positions blend into the same table.

## Scope

1. **Data shape** — extend `PositionRowData` in `src/components/sports/PositionsTable.tsx`:
   ```ts
   /** When true, render the AIRDROP badge and lock TP/SL. */
   isAirdrop?: boolean;
   ```

2. **Event cell** — when `isAirdrop`, render the badge inline to the left of the market title (single row, same line) using a small purple pill:
   ```
   [LeagueBadge] [AIRDROP] United States vs Paraguay
   ```
   The badge: `inline-flex items-center gap-1 rounded-md bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest` + `<Gift className="h-3 w-3" />` + `AIRDROP`. Purple is hard-coded (not a token) to match OmenX exactly — sports' `--primary` is blue and would visually clash with the YES/NO color system.

3. **TP / SL cell** — `TpSlCell` gets a new prop `locked?: boolean`. When `locked` (always true for `isAirdrop` rows), it renders a non-interactive lock chip:
   ```
   ┌──────┐
   │  🔒  │   (Lock icon from lucide-react, muted-foreground, no border, no hover)
   └──────┘
   ```
   No dialog opens, no edit, no `onUpdateTpsl` invocation.
   
   Wrapped in `Tooltip` with the exact copy the user provided:
   > "Voucher positions don't support TP/SL. Close manually within the hold window."

4. **Demo data** — append one airdrop row to `DEFAULT_POS`:
   ```ts
   { market: "United States vs Paraguay", league: "ucl", outcome: "yes",
     outcomeLabel: "USA", eventShape: "multi", size: 200, entry: 25, mark: 25,
     leverage: 5, mode: "isolated", margin: 10, liq: 5, pnl: 0,
     tp: null, sl: null, isAirdrop: true }
   ```

5. **Style guide mirror** — in `src/routes/style-guide.tsx`, the existing PositionsTable showcase already pulls from `DEFAULT_POS`, so the new row appears automatically. Add one short caption line under that section noting the AIRDROP variant: "Airdrop positions show a purple badge, cannot set TP/SL, and are capped at 5× leverage."

## Out of scope

- No backend / data model wiring — sports zone has no positions API yet; `PositionsTable` is fixture-driven.
- No change to `OrderTable` / `HistoryTable` — only the Positions tab gets the airdrop variant for now (matches the user's screenshot scope).
- No change to leverage enforcement logic; the 5× cap is a data-level invariant, not a UI clamp.

## Files touched

- `src/components/sports/PositionsTable.tsx` — type, badge, locked TP/SL, tooltip, demo row.
- `src/routes/style-guide.tsx` — one caption line near the PositionsTable demo.
