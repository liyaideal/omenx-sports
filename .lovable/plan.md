# Top scorer 重构：一张卡，多个 outcome

## 问题

当前 `Top scorer` 区块把同一个 futures market（"EPL Top Scorer 25/26"）的两个候选 outcome（Messi、Haaland）渲染成了两张独立的大卡 `TopScorerMarketRow`，视觉上像两个不同的 event。但它本质上和上方的 "Premier League — Winner 25/26" 完全同构：**一个 market，多个候选**。同时标题 `Top scorer futures` 也没说明这是哪个联赛的什么奖项。

## 方案

把 Top scorer 用**一张卡**呈现，复用 `LeagueWinnerMarketCard` 的样式（带球员小头像而不是球队 logo），让 "League Winner" 和 "Top Scorer" 在视觉上明显是"同类东西"。

### 变更

1. **新组件** `TopScorerMarketCard.tsx`（基于 `LeagueWinnerMarketCard`）
   - 同样的 rounded-3xl 卡片框 + header（`EPL · FUTURES` + title + `Trade ↗`）
   - 表头：`# / Player / Price`
   - 每行：序号、圆形球员头像（带 hue 光晕）+ 角标球队 logo、球员名 + `21G · #10 this season` 副标、`PricePill`
   - footer：`Settles May 24, 2026` / `Vol $3.6M`

2. **数据** `TOP_SCORER_MARKET.title`
   - 改为：`Premier League — Top scorer 25/26`（与 `Premier League — Winner 25/26` 平行表述，自解释）

3. **`src/routes/index.tsx`**
   - 删掉 `SectionHeader title="Top scorer"` 和 `TOP_SCORER_MARKET.outcomes.map(...)` 那段
   - 直接渲染 `<TopScorerMarketCard market={TOP_SCORER_MARKET} photos={[messi, haaland]} />`
   - 区块结构变成：`<LeagueWinnerMarketCard />` + `<TopScorerMarketCard />`，两张同构的 futures 卡纵向堆叠

4. **删除** `TopScorerMarketRow.tsx`（不再使用）

### 不动的部分

- `PlayerPropsSpotlight`（Mbappé）保持不变 —— 它是另一种形状（一个球员，多个 binary markets）
- 上方 `Live & upcoming` 网格不动
- `LeagueWinnerMarketCard` 不动

## 结果

页面中部下半部分变成两张视觉同构的 futures 卡：
```
┌─ Premier League — Winner 25/26 ──────┐
│  1. Man City      38¢ ↑2             │
│  2. Arsenal       31¢ ↑4             │
│  ...                                 │
└──────────────────────────────────────┘
┌─ Premier League — Top scorer 25/26 ──┐
│  1. 🧑 E. Haaland   16G…  41¢ ↓2     │
│  2. 🧑 L. Messi     21G…  34¢ ↑3     │
└──────────────────────────────────────┘
```
用户一眼就能看出这是两个 futures market，每个市场里有多个候选 outcome。
