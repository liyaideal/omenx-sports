## 目标
让事件详情页右侧下单区与下单抽屉保持一致——同时显示「选择 outcome」+（多于 2 个 outcome 时）「YES/NO side」选择器。

## 改动

### 1. 新增 `src/components/sports/trade/TradeOutcomePicker.tsx`
抽取目前内联在 `TradeDrawer` 里的两个块：
- `Pick outcome` 按钮组（按 outcome 数量切 2/3 列）
- `Pick side` YES/NO 切换块（仅当 `market.outcomes.length >= 3`）

Props（受控）：
```
market: SportsMarket
outcomeId?: string
onOutcomeChange: (id: string) => void
side: "yes" | "no"
onSideChange: (s: "yes" | "no") => void
```

### 2. 重构 `src/components/sports/trade/TradeDrawer.tsx`
把现有 "Pick outcome" 和 "Pick side" 两个 `<div>` 块替换为 `<TradeOutcomePicker ... />`。逻辑（`isYesNoMarket`/`needsSideToggle`/`formOutcome`/`formLabel`/`formPrice`/`side` state）保持不变。

### 3. 在 `src/routes/event.$id.tsx` 右侧下单区加同一个选择器
- 在 `<TradeForm>` 上方插入 `<TradeOutcomePicker>`，包在与 TradeForm 同一张卡片或紧贴上方的容器里
- outcome 受控来自现有 `selectedIdx`（通过 `outcomeId = active.outcomes[selectedIdx].id` 双向同步：`onOutcomeChange` 调 `setSelectedIdx(outcomes.findIndex(...))`）——保证 header 选择 ↔ 下单区选择 ↔ chart 都联动
- 新增本地 `side` state，当 `active.outcomes.length >= 3` 时启用
- 用与 TradeDrawer 相同的派生逻辑生成 `formOutcome` / `formLabel` / `formPrice`，传给 `<TradeForm>`（替换当前直接用 `binaryTone` / `getOutcomeLabel(selected)` / `selected.price` 的写法）

这样两个入口共用同一个选择器组件，外观和行为一致；未来再调一处即可。
