## 目标

清理 `EventMarketTileCard` 顶部那一行的冗余 meta：
- 左：去掉 `· EVENT`（整个 section 已经叫 Upcoming Events，重复）
- 右：去掉 `1 · X · 2` / `YES / NO`（market shape 用户从下面的行就能看出来），换成对用户有价值的、**条件性**显示的徽标，没条件时留空

## 修改

### `src/components/sports/dashboard/EventMarketTileCard.tsx`

**左上角**
```tsx
<LeagueChip short={market.league.short} />
```
单独存在，去掉 `· EVENT` 那段 span。

**右上角 — 条件徽标**

判断逻辑（按优先级，命中一个就显示，不叠加）：

1. **🔥 HOT** — `market.participants >= 2000`（活跃度高）
   → `bg-[oklch(0.7_0.22_25_/_0.12)]` 暖橙色 pill
2. **↗ TRENDING** — 任一 outcome `|delta24h| >= 0.05`（5¢ 以上波动）
   → `bg-[oklch(0.78_0.18_155_/_0.12)]` 绿色 pill
3. 其他情况 → 不渲染任何东西，右上角留空

抽成一个小的 `<EventBadge market={market} />` 内部组件，返回 `null` 时父级 header 仍然用 `justify-between`，LeagueChip 自然贴左。

字号统一：`font-mono text-[10px] uppercase tracking-widest`，与其他 meta label 一致。

### 不动的地方

- `LeagueWinnerMarketCard` / `TopScorerMarketCard` 顶部的 `· SEASON WINNER` / `· TOP SCORER` 保留 — 这两个不是冗余，它们标注的是 market **类型**（用户需要区分 season-long 和 match），不是 shape
- `MatchMarketCard`、`UpcomingEventCard` 不动 — 本次只清理截图里的 tile
- 卡片其他部分（fixture、outcomes、footer）一律不动

## 阈值

参与人数和 delta 阈值写成 module-top 的 const，方便以后微调：
```ts
const HOT_PARTICIPANTS = 2000;
const TRENDING_DELTA = 0.05;
```

## 效果

- 普通 event：右上角空，视觉更安静
- 热门 event（如 MCI vs ARS, 2104 人）：右上 🔥 HOT
- 价格波动大的 event：右上 ↗ TRENDING
- 同时左上少一个 `· EVENT`，整个 header 留白更多
