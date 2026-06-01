## 目标

把 event 详情页中间区从「单 outcome 的 Chart / OrderBook 切换 tab」+ 头部右侧的 outcome 列表，统一改成 Polymarket 那种「上 combined chart + 下 outcome 列表，点击行展开 OrderBook」的布局。逻辑不变：选中哪个 outcome、买 是/否 哪一边，都是预选右侧 sticky TradeForm（保留现状）。

## 范围

- 所有 event（binary / 1X2 / league-winner / top-scorer / props 全都用这一种布局）
- 文件：
  - 新增 `src/components/sports/event/EventOutcomesPanel.tsx`（主新组件）
  - 新增 `src/components/sports/event/CombinedPriceChart.tsx`（多线版 PriceChart）
  - 改：`src/routes/event.$id.tsx`（替换中间 StageTabs 的 chart/book，移除头部 outcomes 列表，移除右侧 TradeOutcomePicker）
  - 改：`src/routes/style-guide.tsx`（playground 同步）
- **不动**：TradeForm、TradeDrawer（抽屉里已有的 TradeOutcomePicker 不变）、PositionsTable、Live Stream、Related markets bar、PreMatch strip、LiveTape、MobileTradeBar、所有数据模型

## 新布局结构

```text
┌─ EventDetailHeader（保留：联赛/类型 chip + fixture 双队 crest；移除右侧 outcomes 列表）
├─ RelatedMarketsBar
├─ (PreMatchStrip / Live Stream — 不变)
├─ StageTabs
│   ├─ Stream（live only，不变）
│   └─ Markets（新 tab，唯一 tab；取代原 Chart + Order book 两个 tab）
│       └─ EventOutcomesPanel
│           ├─ CombinedPriceChart（所有 outcomes 多线 overlay）
│           ├─ 元信息行：总成交量 · 截止时间 · 1H/6H/1D/1W/ALL 时间范围（同步 chart）
│           └─ outcomes 列表
│               每行：[icon] [name + vol]   [%大字 + Δ24h]   [Buy 是 价格] [Buy 否 价格]
│               点击行本身 → 展开 inline OrderBook（同一时刻只展开一行；再次点击收起）
├─ LiveTape
└─ 右列：TradeForm（保留 sticky，但去掉上面的 TradeOutcomePicker 卡片）
```

## 交互

- 行 row 整体点击 → 展开/收起该行下面的 OrderBook（accordion 行为，单选）
- 行右侧「买 是」按钮 → `setSelectedIdx(i); setTradeSide("yes")`；桌面端右侧 sticky TradeForm 立刻更新并加一次柔和高亮脉冲（≈600ms ring 动画）；移动端 `scrollToTradeForm()`
- 「买 否」按钮 → 同上但 `setTradeSide("no")`
- 默认选中第一项；与 URL `?outcome=` 深链同步逻辑保留
- Combined chart 上方的时间范围切换（1H/6H/1D/1W/ALL）控制图与单行展开 OrderBook 共享的"period"（OrderBook 现状不依赖时间范围，先只控 chart；保留 API 以后扩展）

## CombinedPriceChart 组件设计

- Props: `{ market: SportsMarket; highlightedOutcomeId?: string }`
- 内部为每个 outcome 用同样的 `genSeries(seed)` 思路生成序列，合成宽表 `{ t, [outcomeId]: number }`
- recharts `<LineChart>` 一条 outcome 一条 Line：
  - 颜色：复用 outcome 现有色调推断（YES/NO → win/loss，DRAW → draw，team → team.hue derived oklch，其它 fallback neon palette 按 index 取色）
  - `highlightedOutcomeId` 对应的线 `strokeWidth=2.5 opacity=1`，其它 `1.5 opacity=0.55`
- 顶部 legend 行：每个 outcome 一个小色块 + 名称 + 当前¢，与下方列表 hover/选中状态联动
- 范围切换条与现 `PriceChart` 一致
- 不破坏现 `PriceChart`：现组件保留供别处使用，新组件独立

## EventOutcomesPanel 组件设计

- Props: `{ market: SportsMarket; selectedIdx: number; tradeSide: "yes"|"no"; onSelect: (idx)=>void; onSideSelect: (idx, side)=>void; onScrollToForm?: ()=>void }`
- 内部状态：`expandedIdx`（单值，受控本地）；初始 = `selectedIdx`
- 行视觉（参考用户截图，深色风格化）：
  - 左：现有 `Glyph`（队徽 / 字母圆）+ name + `$xx vol` 小字
  - 中：当前价 `%`（大号 `font-display`） + `▲/▼ Δ%`（win/loss tint）
  - 右：两个紧凑按钮 `[买 是 17.1¢] [买 否 83.0¢]`，绿/红色调与 OrderBook 现有 yes/no 配色一致
  - 选中 / 展开状态：`bg-primary/8 ring-1 ring-primary/30`
- 行展开区：`<div>` 渐显，内嵌 `<OrderBook sideLabels={...} mark={...} />`，与现有 OrderBook 完全相同（这就是『同样的数据、同样的逻辑，只是排版』）

## event.\$id.tsx 修改要点

- 移除 `EventDetailHeader` 的右栏 outcomes 列表（`<HeaderOutcomeRow>` 那块），头部只保留 fixture / 标题；非 fixture 类 event（league-winner 等）头部留单列大标题
- StageTabs 的 `chart` 和 `book` 两个 tab 合并为单个 `markets` tab，内容是 `<EventOutcomesPanel ...>`
- 右侧栏移除 `<TradeOutcomePicker>` 的卡片包装，只剩 `<TradeForm>`（仍 sticky）
- 新增 `pulseTradeForm`：`useState<number>(0)` ticker，每次 Buy 按钮点击 `setPulse(n+1)`，传给 TradeForm 容器加一次 `ring` 动画 className 然后清掉（用 `useEffect` 计时）
- 桌面 / 移动行为：`window.matchMedia('(min-width: 1024px)')` 决定是否 scrollToTradeForm
- `deriveTradeFormProps` 调用与现状一致，无需改

## /style-guide 同步

在现有 `TradeOutcomePickerDemo` 区块旁加一节 `EventOutcomesPanelDemo`：
- 3 个 variant：binary（2 项）/ 1X2（3 项）/ 多 outcome（7 项）
- 受控本地 state 演示「点击行 → 展开 OrderBook」「点击 Buy → 切 selected + side」
- 右侧用一个 stub TradeForm 占位框，展示 pulse 高亮效果

## 不会动的东西

- TradeDrawer 内部（含 `TradeOutcomePicker`、横滚 pills）保持现状 —— 抽屉是移动端"快捷下单"形态，与详情页主布局解耦
- 数据模型（`SportsMarket` / `Outcome`）零修改
- `deriveTradeFormProps`、`TradeForm`、OrderBook 内部、PositionsTable、Live Stream、Related markets 全部不动
- 深链 `?outcome=…`、live-stream outcome 同步等副作用 hooks 不动

## 验收

- 详情页对 binary（如英超某场比赛）/ 1X2（CAN vs BIH）/ 7 项 league-winner 都能正常显示，combined chart 多线清晰、行展开 OrderBook 顺滑
- 点击行内 Buy 按钮，右侧 sticky TradeForm 价格、outcome label、side 立即同步并有 600ms 高亮
- 移动端 Buy 按钮触发滚动到 TradeForm
- `/style-guide` 三个 variant 渲染正常
