## 1. Sticky picker header inside the scrollable trade column

Current setup in `src/routes/event.$id.tsx`:

```tsx
<div className="space-y-3 lg:sticky lg:top-4 lg:self-start
                lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto …">
  <div className="rounded-2xl border …"> <TradeOutcomePicker … /> </div>
  <TradeForm … />
</div>
```

The column is sticky, but its contents scroll **inside** the column. The picker is the first child, so as soon as the user scrolls within the column to reach `TradeForm`, the picker leaves the top of the viewport — that's what the screenshot shows.

Fix: pin the picker to the top of the scroll container so it always stays visible while `TradeForm` scrolls beneath it.

```tsx
<div
  ref={tradeFormRef}
  className="space-y-3 lg:sticky lg:top-4 lg:self-start
             lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto
             lg:pr-1 lg:[scrollbar-gutter:stable]"
>
  <div
    className="rounded-2xl border border-border bg-surface p-3 shadow-card
               lg:sticky lg:top-0 lg:z-10"
  >
    <TradeOutcomePicker … />
  </div>
  <TradeForm … />
</div>
```

`lg:sticky lg:top-0` inside the scroll container makes the picker behave like a sticky header — always pinned at the top of the trade column, regardless of inner scroll position. `bg-surface` is already opaque so the form scrolling underneath won't bleed through.

## 2. Drop "Buy" prefix from inline row buttons

In `src/components/sports/event/EventOutcomesPanel.tsx`, `BuyButton`:

```tsx
- <span className="opacity-80">Buy {isYes ? "YES" : "NO"}</span>
+ <span className="opacity-80">{isYes ? "YES" : "NO"}</span>
```

Shorter pill, matches "53¢ / 47¢" sizing in the screenshot more cleanly. `min-w-[88px]` can be reduced to `min-w-[68px]` so the row breathes.

### Files

- `src/routes/event.$id.tsx` — add `lg:sticky lg:top-0 lg:z-10` to picker wrapper.
- `src/components/sports/event/EventOutcomesPanel.tsx` — strip "Buy", tighten `min-w` on the row pills.

No other components or business logic change.
