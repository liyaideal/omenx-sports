## 目标

删除首页 Season Events 区块右上角的 "Browse all" 链接，并在当前 section 内直接展示「全部」 season events——通过补充其它联赛（LaLiga、UCL）的 Winner / Top scorer mock 数据，让区块自然扩展为多联赛分组。

不新增独立列表页，不动右侧 PlayerPropsSpotlight。

## 数据层改动 — `src/data/sports-markets.ts`

在现有 `LEAGUE_WINNER_MARKET` / `TOP_SCORER_MARKET` 下方新增 4 个 mock market（均复用现有 `TEAMS`，不动 sports-mock）：

- `LALIGA_WINNER_MARKET` — id `laliga-winner-25-26`，4 个 outcome：Real Madrid 46¢、Barcelona 39¢、Atlético（暂用 Real Madrid hue+短名 fallback「ATM」纯字母 glyph，team 字段省略，用 `label`+`meta`）、Sevilla 同上。为避免扩 TEAMS，第 3/4 行不带 team 字段，只用 label 文本行（card 已能渲染无 team 的行 — 需快速确认）。
- `UCL_WINNER_MARKET` — id `ucl-winner-25-26`，outcomes：Man City、Real Madrid、PSG、Liverpool（全部有 team）。
- `LALIGA_TOP_SCORER_MARKET` — id `laliga-top-scorer-25-26`，outcomes：Mbappé / Real Madrid、Lewandowski / Barcelona。
- `UCL_TOP_SCORER_MARKET` — id `ucl-top-scorer-25-26`，outcomes：Haaland / Man City、Mbappé / Real Madrid。

新增数组导出：

```ts
export const SEASON_LEAGUE_GROUPS = [
  { league: "EPL",    winner: LEAGUE_WINNER_MARKET,        topScorer: TOP_SCORER_MARKET,        photos: { messi, haaland } },
  { league: "UCL",    winner: UCL_WINNER_MARKET,           topScorer: UCL_TOP_SCORER_MARKET,    photos: { haaland, mbappe } },
  { league: "LaLiga", winner: LALIGA_WINNER_MARKET,        topScorer: LALIGA_TOP_SCORER_MARKET, photos: { mbappe, lewandowski } },
];
```

photos 用现有 Unsplash / spotlight 头像复用；不新增图片依赖。

把 4 个新 market 追加进底部 `MARKETS` 数组，让 `/event/$id` 也能命中。

## 组件层改动

### `src/components/sports/dashboard/TopScorerMarketCard.tsx`
- `photos` prop 改为 optional。渲染时若 `photos[o.id]` 缺失，退化为 `o.team?.logo`，再缺失则显示首字母 glyph。这样新加的 top scorer 市场可以零额外配置工作。

### `src/routes/index.tsx`
- 删掉 `SectionHeader` 的 `right={...}` Browse all 链接（仅删该 prop，header 其它不动）。
- 将左侧列从「写死两个 card」改为：`SEASON_LEAGUE_GROUPS.map(group => <LeagueWinnerMarketCard /> + <TopScorerMarketCard />)`，外面用一个垂直 `flex flex-col gap-5` 容器。右侧 PlayerPropsSpotlight 不变（保持 `lg:sticky lg:top-4 lg:self-start` 行为，如果当前没有则不引入新滚动状态）。
- 移除 `ArrowUpRight` 在该 section 的依赖（若文件别处仍在用则保留）。
- 移除已不再使用的局部 import：`LEAGUE_WINNER_MARKET`、`TOP_SCORER_MARKET`、`TOP_SCORERS`，改为 `SEASON_LEAGUE_GROUPS`。

## 不动的部分
- AppShell / AppTopBar / SectionHeader 组件本身；
- PlayerPropsSpotlight；
- LeagueWinnerMarketCard（已能处理 3-4 个 outcome）；
- `/event/$id` 路由代码（自动从 MARKETS 取数）；
- 样式 token、settings 文件。

## 验证
- 首页 EPL / UCL / LaLiga 三组 Winner+Top scorer 自上而下渲染，右上角无 "Browse all"。
- 点击任一新 card 的 Trade / 行链接能打开 `/event/<新 id>`，header 数据正确。
- 视口 1021px 下右侧 Spotlight 仍正常对齐第一组卡片高度，多组卡片在左侧滚动堆叠不溢出。