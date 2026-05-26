# 统一 Event vs Market 文案

## 1. 概念定义（写入设计规范）

| 术语 | 含义 | 例子 |
|---|---|---|
| **Event** | 现实世界的赛事 / 时段 | Arsenal vs Chelsea；EPL 24/25 赛季；EPL Top Scorer 赛季 |
| **Market** | 挂在某个 event 上的可交易问题 | 1X2、BTTS、Over 2.5、Top Scorer |
| **Outcome** | market 的一个选项 | Home / Draw / Away、YES / NO、Haaland |

规则：
- 用户在首页看到的卡片 = **event**（每张卡聚合了 1 个主 market 的报价）
- "Featured / Live & upcoming / Browse all" 这一层级一律说 **event(s)**
- "1X2 / BTTS / Top scorer / Player props" 这一层级才说 **market(s)**
- Outcome 行（Home 58¢、Haaland 24¢）说 **outcome**，不要说 market

## 2. 首页文案改动（`src/routes/index.tsx`）

| 位置 | 现状 | 改为 |
|---|---|---|
| 左栏 SectionHeader | `title="Featured" accent="market"` | `title="Featured" accent="event"` |
| 中上 SectionHeader | `title="Live & upcoming" accent="markets"` | `title="Live & upcoming" accent="events"` |
| "Browse all" 链接 | `omenxUrl.markets()` | `omenxUrl.events()` |
| 中下 SectionHeader | `title="Top scorer" accent="futures"` | 保留（futures 是合理 market 分类描述） |

`<head>` meta 文案（`description`、`og:description`）已经用 "sports markets / prediction markets"——这是平台业务定位，**保留不动**（"prediction market" 是产品类别名词）。

## 3. AppTopBar / 导航

- `AppTopBar.tsx` 顶部导航已经是 `Events`，正确，不改。
- `omenxUrl` 工具里如果只有 `markets()` 没有 `events()`，新增 `events()`（指向 `/events`，与顶部导航一致）。

## 4. 组件命名（**保留**，仅文档说明）

文件/组件名（`MatchMarketCard`、`EventMarketTileCard`、`LeagueWinnerMarketCard`、`MATCH_MARKETS` 数据等）**不改**——这些是技术命名，表示"渲染某 event 下某 market 的卡"。强行改名会引发大面积 diff 且语义其实正确。本次只统一**面向用户的可见文案**。

## 5. 写入设计规范

在 `.lovable/plan.md` 顶部新增一节 `## Copy conventions: Event vs Market`，内容即第 1 节的定义表 + 规则，作为后续所有改动的强约束。

## 6. 不动的部分

- 所有卡片内部 UI、布局、价格行
- meta `title` / `description`
- 数据层 (`src/data/sports-markets.ts`) 字段名
- StatsBar 已删除（上一轮）
- 紫红 halo 已删除（上一轮）

## 技术细节

- `SectionHeader` 的 `accent` prop 是纯展示字符串，无类型枚举约束，直接换文案即可。
- 若 `omenxUrl` 没有 `events()`，在 `src/lib/omenx.ts`（或对应文件）追加：`events: () => \`${OMENX_BASE}/events\``。
