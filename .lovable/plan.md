# 直播条 outcome 数量修复

## 问题

足球是三向盘：`USA` / `Draw` / `Paraguay`，但：

- `GlobalStreamMiniPlayer.tsx` 只渲染 `outcomes[0]` + `outcomes[1]` → 截图里看到 `USA 48¢` / `DRAW 29¢`，Paraguay 直接没了。
- `FullscreenStreamOverlay.tsx` 同样的 `o1` / `o2` 写法，全屏下也只有两个 chip。

用户的疑问"为什么只有 2 个选项"正是这个 bug。

## 方案

把两个组件的"o1/o2"改成遍历 `market.outcomes`，渲染全部 outcome chip。

### 1) `GlobalStreamMiniPlayer.tsx`

- 删除 `const o1 = outcomes[0]; const o2 = outcomes[1] ?? outcomes[0];`。
- 改成 `market.outcomes.map(o => <OutcomeChip ... />)`。
- 容器仍然 `flex min-w-0 flex-1 gap-1`，chip 用 `flex-1` 平分，三向时三等分（USA / Draw / PAR），二向时两等分，向后兼容。
- `selectedId` 默认改成 `outcomeId ?? market.outcomes[0].id`。
- `OutcomeChip` 内文字已经是 `truncate` + `min-w-0`，三等分下 `PAR` / `DRAW` / `USA` 这类短 label 不会溢出；只是 Trade 按钮旁边稍微紧，没问题（mini 卡片宽 340px，三个 chip 仍可读）。

### 2) `FullscreenStreamOverlay.tsx`

- 同样改成 `market.outcomes.map(...)` 渲染 `ChipLg`。
- 全屏底栏本来就 `max-w-3xl`，空间充足，三向显示完全无压力。

### 3) 不动的部分

- 数据层 (`sports-markets.ts`) 不动——`outcomes` 数组已经包含三个选项。
- `TradeDrawer` / `LiveStreamProvider` / `setOutcome` 逻辑不动，已经按 id 工作，天然支持 N 个 outcome。
- 移动端 `MobileTradeBar` 这次范围之外（如果它也有同样问题可以后续再处理，但用户截图只指向直播浮窗 / 全屏层）。

## 验证

- `/event/wc26-usa-par` 上触发全屏 → 底栏应显示 `UNITED STATES 48¢` / `DRAW 29¢` / `PARAGUAY 27¢` 三个 chip + Trade 按钮。
- 浮窗（滚动到 Stage 以下出现）同样显示三个 chip。
- 二元市场（如"Both teams to score yes/no"）回归测试仍只显示两个 chip，布局不破。
