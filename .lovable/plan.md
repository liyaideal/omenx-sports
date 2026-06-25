## Fix
Move `0 OPEN` to sit on the right side of the big balance number row, so the header row stays clean and the SESSION P/L row keeps room for its label + value.

### Target layout
```
PINPOINT BAL                [+ FUND]
$4                            0 OPEN
SESSION P/L                   -$9997
MARGIN                       HEALTHY
[============ bar ===========]
```

### Change scope
Single file: `src/features/pinpoint/AccountBlock.tsx`

1. Remove `{openCount} OPEN` from the balance header row (the row with "PINPOINT BAL" + FUND button). That row goes back to 2 items.
2. Wrap the big balance number (`formatBalance(balance)`) in a flex row: balance on the left (baseline-aligned, keeps its current size/color), `{openCount} OPEN` on the right in the existing muted stencil style (`text-[9px]`, `var(--pp-mute)`), baseline-aligned to the balance so it sits along the bottom edge of the big `$4`.

No prop, logic, or other layout changes.