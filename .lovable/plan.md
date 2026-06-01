## Three issues to fix on `/event/$id`

### 1. 页面里出现的中文 ("买 是/否")

Source: `src/components/sports/event/EventOutcomesPanel.tsx`, `BuyButton`:

```tsx
<span className="opacity-80">买 {isYes ? "是" : "否"}</span>
```

Change to English to match the rest of the product copy:

```tsx
<span className="opacity-80">Buy {isYes ? "YES" : "NO"}</span>
```

While in this file, also fix the React DOM nesting warning (`<button>` inside `<button>`) that appears in the console: convert the outer `<button>` of `OutcomeRow` into a `<div role="button" tabIndex={0}>` with `onClick` + `onKeyDown(Enter/Space)`, so the inner `BuyButton`s remain valid.

### 2. 下滑时看不到右侧交易面板的头部

Cause: the right column uses `lg:sticky lg:top-4`, but `TradeForm` (≈900 px tall with TP/SL expanded) is taller than the 777 px viewport. When a sticky element is taller than the viewport, its top scrolls off-screen and there is no way to scroll back to it without scrolling the whole page up.

Fix in `src/routes/event.$id.tsx`, the right column wrapper:

```tsx
<div
  ref={tradeFormRef}
  className="space-y-3 lg:sticky lg:top-4 lg:self-start
             lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto
             lg:pr-1 lg:[scrollbar-gutter:stable]"
>
```

This pins the column, caps its height to the viewport, and lets the form itself scroll internally so the header (market + side toggle, see #3) is always reachable.

### 3. TradeForm 头部少了 market 名称和 YES/NO 选项

In the previous refactor `TradeOutcomePicker` was removed from the right column entirely. The user wants market context + YES/NO at the top of the trade ticket itself — even when the row-level Buy buttons aren't used.

Add a compact header **inside** the right column, above `TradeForm`, reusing the existing `TradeOutcomePicker` so logic stays single-sourced:

```tsx
<TradeOutcomePicker
  market={active}
  outcomeId={selected?.id}
  onOutcomeChange={(id) => {
    const idx = active.outcomes.findIndex((o) => o.id === id);
    if (idx >= 0) setSelectedIdx(idx);
  }}
  side={tradeSide}
  onSideChange={setTradeSide}
/>
<TradeForm … />
```

The picker already renders:
- Market title chip + outcome pill grid (horizontal scroll for many outcomes)
- YES/NO side toggle when the market has ≥3 outcomes

For binary 2-outcome markets the side toggle stays hidden (as today), but the outcome pills still act as the visible "market header" inside the ticket, satisfying the user's ask.

Selection stays in sync both ways:
- Row Buy button → `handleBuyFromRow` already updates `selectedIdx` + `tradeSide` → picker reflects it.
- Picker change → updates `selectedIdx` / `tradeSide` → `EventOutcomesPanel` follows via its `useEffect([selectedIdx])` and re-highlights the chart line + expands the matching order book.

### Files touched

- `src/components/sports/event/EventOutcomesPanel.tsx` — English copy, fix nested-button DOM warning.
- `src/routes/event.$id.tsx` — re-add `TradeOutcomePicker` above `TradeForm` in the right column; make the sticky column scrollable.
- `src/routes/style-guide.tsx` — update the `EventOutcomesPanelDemo` snippets to match the English labels (no structural change).

### Out of scope

- No changes to `TradeForm` internals, `deriveTradeFormProps`, mobile `MobileTradeBar`, or `TradeDrawer`.
- No data-model changes.
