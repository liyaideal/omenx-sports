## Goal
Attach the "GUESS WHO'S NEXT →" entry to the **Signed Jersey** prize row so it visually belongs to that prize, while keeping all percentages right-aligned in a single column like the other rows.

## Change (scoped to `src/components/sports/promo/LuckyBoxSection.tsx`)

In the prize list (lines 427–442), the Signed Jersey row becomes:

```
🏆 Signed Jersey  [ GUESS WHO'S NEXT → ]            2.0%
```

- Left cluster: trophy icon + "Signed Jersey" label + a small inline amber dashed chip "GUESS WHO'S NEXT →" rendered as `<Link to="/promo/world-cup" search={{ tab: "legend" }}>`. The chip sits immediately after the label so the association is unambiguous.
- Right side: the `2.0%` chance stays in the same right-aligned percentage column shared by all other prize rows — no change to that element's position, font, or styling.
- Non-hero prize rows render unchanged.
- The chip reuses the existing amber/dashed treatment, shrunk to fit inline (smaller padding, no full-width stretch, no chevron icon — the `→` in the label is enough).

Then **remove** the standalone full-width CTA block at lines 444–453 so the card loses the extra row and the hierarchy reads cleanly.

## Why this works
- Percentages remain visually aligned in one right-hand column, preserving scan-ability of odds.
- The CTA is anchored to the Signed Jersey label, eliminating the "is this the next tier?" ambiguity.
- No logic, data, or copy changes — pure layout.
