
# Polymarket 模块整合 + 信息架构重构

## 1. 核心决策

新增 `/league/$slug` 锦标赛 Hub 层，`/events` 重新定位为**时间维度的跨联赛 lobby**。两者职责正交。

**只做 1X2 盘面**，不做 Moneyline/Spread/Total 三列盘口，不做 Line 选择器。

**Fans 体系完全不动**：`/fans` 路由、bottom nav 的 Fans tab、所有 fans 组件、桌面 Fans 区块全部保留。

| 路由 | 回答的问题 | 内容 |
|---|---|---|
| `/events` | When? "现在能下注什么" | Live + 即将开始 + 今日排程，跨联赛 |
| `/league/$slug` | What's the whole picture? | Games / Props / Bracket，单赛事纵深 |
| `/event/$id` | 单市场详情 | 不变 |
| `/fans` | 社区 | 不变 |

## 2. /events 改造

| 区块 | 改造后 |
|---|---|
| Live Now hero | 保留 |
| Upcoming + DayStrip | 保留（1X2 卡） |
| Season Futures（联赛冠军 + 射手榜） | **迁出**到各自 hub 的 Props tab |
| Event Spotlight | **迁出**到各自 hub 的 Props tab |
| Explore leagues chip 行 | **新增**底部：World Cup / UCL / EPL / LaLiga → 各 hub |

## 3. /league/$slug 结构

```text
/league/$slug
├── LeagueHubHero
└── HubTabs (?view=games|props|bracket)
    ├── games  → 该赛事所有 1X2 比赛卡
    ├── props  → Winner / Group Winner / Player Props
    └── bracket→ 淘汰赛图（仅 tournament 类）
```

- tournament（World Cup、UCL knockout）：Games / Props / Bracket
- season-league（EPL、LaLiga）：Games / Props

## 4. 模块落位

| 模块 | 落点 | 实现 |
|---|---|---|
| 赛事 Hero | hub 顶部 | 新 `LeagueHubHero` |
| Hub Tabs | hub | 新 `HubTabs`（query param） |
| 比赛卡 | hub Games + `/events` | **复用 `EventMarketTileCard`（1X2）** |
| Props 网格 | hub Props | 新 `PropsGrid` |
| 二元 gauge 卡 | Props 内变体 | 新 `BinaryQuestionCard` |
| 分组冠军卡（Group A…J） | Props 顶部 | 新 `GroupWinnerCard` |
| Bracket 淘汰赛图 | hub Bracket | 新 `BracketView` |
| Season Futures / Player Spotlight | hub Props | 移动现有组件 |
| Sticky 交易浮窗 / Map | — | 后期 / 不做 |

## 5. 数据模型

`SportsMarket.league` 扩展：

```ts
league: {
  name: string;
  short: string;
  slug: string;                              // 新增
  kind: "tournament" | "season-league";      // 新增
}
```

新增：
- `LEAGUES: LeagueHub[]`（hub 元数据 + hero 配置）
- `GROUP_WINNER_MARKETS: SportsMarket[]`
- `BRACKET_DATA: BracketRound[]`

## 6. 入口与导航

- `/events` 底部 chip 行 → 各 hub
- 桌面 `/` Season 区块改成"联赛入口卡"
- 单场卡 `LeagueChip` 可点 → 对应 hub
- 移动端 bottom nav 不变（Events / Fans / Me）

## 7. 分期路线图

| 阶段 | 内容 |
|---|---|
| **P0** | `/league/$slug` 路由 + Hub Hero + Tabs；`/events` 移出 Season Futures + Spotlight；联赛 chip 入口；hub Games tab 复用现有 1X2 卡 |
| **P1** | hub Props tab：Props 网格 + Group Winner + Binary gauge；Season Futures / Spotlight 落位 |
| **P2** | hub Bracket tab（仅 tournament） |
| **P3** | Sticky 交易浮窗 |

## 8. 涉及文件

### 新增
- `src/routes/league.$slug.tsx`
- `src/components/sports/league/LeagueHubHero.tsx`
- `src/components/sports/league/HubTabs.tsx`
- `src/components/sports/league/PropsGrid.tsx`
- `src/components/sports/league/BinaryQuestionCard.tsx`
- `src/components/sports/league/GroupWinnerCard.tsx`
- `src/components/sports/league/BracketView.tsx`
- `src/data/leagues.ts`

### 修改
- `src/data/sports-markets.ts`（league 字段 + 新数据集）
- `src/components/sports/mobile/MobileEventsSection.tsx`（移除 Season Futures + Spotlight，加 chips）
- `src/routes/index.tsx`（桌面 Season 区改"联赛入口卡"）
- `src/routes/style-guide.tsx`（同步新组件 demo）

### 不变
- `EventMarketTileCard`、`/event/$id`、`/fans` + 全部 fans 组件、MeSheet、MobileBottomNav、MobileChrome、交易表单

## 9. P0 先交付

本次执行**只做 P0**。P1/P2/P3 各自再独立 plan。
