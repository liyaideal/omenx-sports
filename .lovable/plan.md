## Goal
在 World Cup 4-Leg Combo 的移动端，让用户**再次点击已选中的 outcome 卡片**即可取消选择（toggle 行为）。当前再次点击没有反应，只能从底部 LegSlot 的 × 移除。

## Changes
**File:** `src/components/sports/promo/ComboChallengeSection.tsx`

在两处 `OutcomeButton` 的 `onClick` 中改为 toggle：
- Moneyline 渲染（~line 455）
- Spread / Total 渲染（~line 506）

逻辑：
```ts
onClick={() =>
  selected?.outcomeId === o.outcomeId
    ? ctrl.removeLeg(market.marketId)
    : ctrl.selectOutcome(match, market, o)
}
```

`ctrl.removeLeg` 已存在（`useComboState.ts`），无需新增 state 逻辑。

## Scope
- 只改前端交互；odds、quote 失效、auto-preview 等机制都已在 hook 里自动响应 legs 变化。
- 桌面端同步生效（toggle 行为对两端都更直观；如只想 mobile-only 请告知）。
- 不动样式与 LegSlot 的 × 按钮。

## Verification
点击 ARG 选中 → 再次点击 ARG → 卡片回到未选中态，底部 LegSlot 对应槽清空，`1/4 → 0/4`。