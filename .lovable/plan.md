## Event header redesign — Cinematic data panel

Rework `EventDetailHeader` in `src/routes/event.$id.tsx` to match the selected "Cinematic data panel v4" direction. Drop the chips row entirely (no World Cup / Game labels). No data, route, or business-logic changes.

### Layout
```text
┌─────────────────────────────────────────────┬──────────────────┐
│                                             │  TOTAL VOLUME    │
│   [USA crest]   vs (faint serif)   [PAR]    │  $612K           │
│                 9:00 PM TODAY               │                  │
│                                             │  ● LIVE PLAYERS  │
│  [ Share match snapshot →↗ ]                │  4,720           │
└─────────────────────────────────────────────┴──────────────────┘
```

- Outer: `rounded-3xl border border-border bg-surface bg-ambient shadow-card relative overflow-hidden`, soft violet/indigo blur orbs in two corners (decorative).
- Two-column flex (`md:flex-row`):
  - **Left (flex-1)**: fixture (crests + faint serif `vs` with thin vertical hairline behind it + pill `9:00 PM TODAY`), then a full-width "Share match snapshot" CTA at the bottom.
  - **Vertical hairline divider** (`hidden md:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent`).
  - **Right (w-72)**: two stats — `TOTAL VOLUME` and `LIVE PLAYERS` (pulsing emerald dot). Drop the 24h row to keep the panel calm.
- Bottom 2px violet gradient trim.

### Removed
- World Cup `LeagueChip` and `Game/Season winner/...` kind chip — both deleted from the header. (League/kind info is still discoverable via the breadcrumb / page context.)
- `Users` icon import if unused after removal.

### Crest treatment
- Replace circular glow halos with rounded-xl rectangular crests (`w-24 h-16`, `ring-1 ring-white/15`, soft shadow). Hover adds subtle violet glow + 1.05 scale.
- Team name: `font-black uppercase tracking-[0.22em] text-[12px]` under the crest.

### Typography
- `vs`: faint italic serif `text-5xl text-foreground/5` with thin vertical divider overlay.
- Kickoff pill: `text-[10px] font-bold tracking-[0.15em] text-primary uppercase` — combines time + "today" on one line.
- Stat labels: `text-[9px] font-black tracking-[0.35em] text-muted-foreground/60 uppercase`.
- Stat values: mono `text-2xl` foreground, tabular-nums.

### Share button
- Move `<ShareButton />` to a full-width CTA at the bottom of the left column. Add a `variant?: "icon" | "wide"` prop to `ShareButton`; default `icon`, new `wide` renders the cinematic full-width style. Keeps logic in one place.

### Tokens / theming
- Use semantic tokens (`border-border`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `text-primary`). No raw hex.

### Files to change
- `src/routes/event.$id.tsx` — rewrite `EventDetailHeader` + `CrestBlock`, drop chips row + `StatRow` helper, prune unused imports.
- `src/components/sports/event/ShareButton.tsx` — add `variant` prop.
- `src/routes/style-guide.tsx` — mirror the new header in the playground.

### Out of scope
- `RelatedMarketsBar`, `LiveTape`, `PositionsTable`, `TradeForm`, data, routes.
