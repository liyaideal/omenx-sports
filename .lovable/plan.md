## Live stream card — direction A (poster scoreboard)

### Changes to `src/components/sports/dashboard/LiveStreamCard.tsx`

1. **Add a scoreboard pill inside the poster.** Position absolute, bottom-center of the poster strip, sitting above the gradient fade.
   - Layout: `MCI` short · big tabular `2` · em-dash separator `–` · big tabular `0` · `ARS` short.
   - Style: `rounded-full bg-background/70 backdrop-blur px-3 py-1.5 ring-1 ring-white/15`, scores in `font-display text-xl tabular-nums`, team shorts in `font-mono text-[11px] tracking-widest text-muted-foreground`.
   - Make the poster strip a bit taller (`aspect-[16/8]` instead of `16/7`) so the scoreboard has room to breathe.

2. **Drop the inline score** from each outcome row (remove the `scoreFor` lookup and the big score `<span>` added in the previous edit). Score now only lives in the poster overlay — no duplication.

3. **Restore the larger team crests** in outcome rows: bump logo back to `h-9 w-9` with the glowing ring (`boxShadow` using `team.hue`), the same competitive look it had before.

4. Keep everything else (LIVE pill, league short, live clock, play button, footer) unchanged.

### Result

```
┌──────────── poster (16:8) ──────────┐
│ ●LIVE  EPL                  43:12  │
│                ▶                    │
│                                     │
│         ┌──────────────────┐        │
│         │ MCI  2 – 0  ARS  │        │ ← scoreboard overlay
│         └──────────────────┘        │
├─────────────────────────────────────┤
│ 🛡 Man City              48¢ ↗+2¢  │
│ 🛡 Arsenal               28¢ ↘-2¢  │
├─────────────────────────────────────┤
│ ● Streaming now    2,104  Vol $1.82M│
└─────────────────────────────────────┘
```

No other files change.
