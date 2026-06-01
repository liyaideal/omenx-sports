## 现状梳理

我把项目里所有 event/market 卡片的跳转路径全部走了一遍，按"会不会进入有效 `/event/$id`"分成三类：

**✅ 已经正确（不需要改）**
- `MatchMarketCard`、`LiveStreamCard`、`EventMarketTileCard`、`MobileLiveHero`、`LeagueWinnerMarketCard`、`TopScorerMarketCard`、`PlayerPropsSpotlight`、`BinaryQuestionCard`：用的都是 `MATCH_MARKETS` / `ALL_MARKETS` 里已注册的 `market.id`。
- `SpotlightPropsCardHorizontal`、`GroupWinnerCard` 内的 Y/N 按钮：经上一轮改造已经指向 `eventMarketId`（合并后的多 outcome 市场）或 `GROUP_OUTCOME_MARKETS` 自动生成的合成市场。
- 死代码（无人引用，不会触发问题）：`MiniEventCard`、`UpcomingEventCard`、`TopMoverCard`、`HeroMarketCard`。

**❌ 当前会跳到 404 "Event not found"**
1. **`BracketView` 的全部对阵卡** — 卡片 `<Link to="/event/$id" params={{ id: matchup.id }}>`，而 `r32-1…r32-16`、`r16-1…r16-8`、`qf1…qf4`、`sf1`、`sf2`、`final` 这 31 个 id **没有一个注册在 `ALL_MARKETS`**，每张卡都会触发 `notFound()`。
2. **`GroupWinnerCard` 的"打开整个组"链接** — 卡片外层 `<Link>` 用 `market.id`（来自 `WC26_GROUPS`），id 为 `wc26-grpa-winner … wc26-grph-winner`。但 `ALL_MARKETS` 里只手工注册了 **A 组和 F 组**两个合并市场（`WC_GROUP_A_WINNER_MARKET`、`WC_GROUP_F_WINNER_MARKET`），B/C/D/E/G/H 6 个组点进去都会 404。

## 修复方案

只动数据层，照搬已经存在的 `GROUP_OUTCOME_MARKETS` 自动注册模式，避免再手抄一遍硬编码市场。

### 1. `src/data/tournament.ts` — 新增两个自动派生的市场集合

**(a) `GROUP_WINNER_MARKETS`**：遍历 `WC26_GROUPS`，为每个组生成一个 `SportsMarket`：
- `id = group.id`（如 `wc26-grpb-winner`）
- `kind: "league-winner"`、`shape: "multi"`
- `title = group.title`、`endsLabel/volume/participants` 直接复用
- `outcomes`：每个 `standings[i]` 映射成 `{ id: team.short.toLowerCase(), label: team.name, price, delta24h, team }`
- 这样 B-H 组卡片点进去就是真实的「Group X — Winner」多 outcome 详情页，和现在 A/F 一致。

**(b) `BRACKET_MARKETS`**：遍历 `WC26_BRACKET` 每个 `matchup`，生成 `SportsMarket`：
- `id = matchup.id`（如 `r32-1`、`qf1`、`final`）
- `kind: "match"`、`shape: "binary"`
- `title`：如 `"${home.name} vs ${away.name}"`，TBD 队伍时降级为 `"${round.label} · TBD"`
- `outcomes`：`[{ id: 'home', label: home.name, price: homePrice, team: home }, { id: 'away', label: away.name, price: awayPrice, team: away }]`
- `endsLabel = matchup.kickoffLabel ?? round.label`，`volume/participants` 用占位值（统一格式即可）
- 若 `home`/`away` 任一缺失或价格为空（待定对阵），跳过生成 — 此时卡片仍可点击但走 `notFoundComponent`，与"对阵未定"的真实语义一致。

### 2. `src/data/sports-markets.ts`

`ALL_MARKETS` 末尾追加：
```
...GROUP_WINNER_MARKETS,
...BRACKET_MARKETS,
```
（已存在的手工 `WC_GROUP_A_WINNER_MARKET` / `WC_GROUP_F_WINNER_MARKET` 与新自动生成的 A/F 项会撞 id。处理方式：删掉这两个手工常量及其在 `ALL_MARKETS` 的引用，全部由 `GROUP_WINNER_MARKETS` 接管，保证 8 个组一致。）

需要确认 `SPOTLIGHTS` 里 `eventMarketId: "wc26-grpa-winner" / "wc26-grpf-winner"` 仍然指向自动生成的同名 id —— 完全一致，无需改动。

### 3. `/style-guide` 同步

`style-guide.tsx` 里 `GroupWinnerCard` 现在只展示了 1-2 组样本，新增的自动注册不会影响演示。无需新增 demo，但要确认 `<BracketView rounds={WC26_BRACKET} />` 这段在 style-guide 现在变成"可点击 → 真实详情页"，符合 playground/产品同步约定，无需额外改动。

### 4. 回归检查

改完后过一遍所有入口：
- `/league/world-cup-2026?view=props` → 8 个 GroupWinnerCard 全部可跳。
- `/league/world-cup-2026?view=bracket` → 32 → 16 → 8 → 4 → 2 → 1 全部对阵卡可跳。
- 其余首页 / events / fans / mobile 卡片：已确认 `market.id` 来自注册集合，不动。

## 不做的事

- 不动任何卡片组件 UI 或交互逻辑。
- 不动 `event.$id.tsx` 详情页本身（它已经能处理 `match` / `multi` / `binary` 三种 shape）。
- 不重命名/合并现有 `GROUP_OUTCOME_MARKETS`（那是 Y/N 单候选合成市场，与新的"整组多 outcome"市场互补，共存）。
