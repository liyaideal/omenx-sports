## 现状梳理（你看到的每个"小标"分别是什么）

现在卡片头部的 label 是杂揉出来的：

| 卡片 | 出现位置 | 头部 chip / glyph |
|---|---|---|
| `EventMarketTileCard`（默认） | 首页 lobby、联赛 Games | **联赛 chip**（`PL` `WC` `LL`…） |
| `EventMarketTileCard`（`showStage`） | 锦标赛 Games | **金色奖杯 stage chip**：`Group A · MD1` / `Round of 32` |
| `GroupWinnerCard` | Props · More events | **字母方块**（A/B/C…）+ kicker `Group winner` |
| `BinaryQuestionCard` | Props · More events | **"?" 方块** + 小字 `WC · Yes / No` |
| `LeagueWinnerMarketCard` | Props · Season futures | **联赛 chip** + 小字 `· SEASON WINNER` |
| `TopScorerMarketCard` | Props · Season futures | **联赛 chip** + 小字 `· TOP SCORER` |
| `SpotlightPropsCardHorizontal` | Props · Top storylines | 无 chip |

乱在哪：在 WC hub 里还显示 `WC` 联赛 chip（重复）；三种"类型"表达方式混用；Games 有奖杯 chip，Props 没有同维度的 chip。

## 目标：一套 chip 语法

每张卡片头部最多 **一个左侧 chip + 一个右侧状态 badge**：

```text
跨联赛页面（首页、Explore）  → LeagueChip（联赛短代号 + logo）
单个联赛 / 锦标赛 hub 内      → TypeChip（卡片类型，见下）
```

`TypeChip` 是统一组件，按含义渲染（采纳你的配色决定）：

| 卡片 | hub 内 TypeChip | 色调 |
|---|---|---|
| `EventMarketTileCard`（有 stage） | `Group A · MD1` / `Round of 32` | **amber**（Trophy） |
| `EventMarketTileCard`（无 stage, binary） | `Player prop` | **violet**（Sparkles） |
| `GroupWinnerCard` | `Group winner` | **amber**（Users） |
| `LeagueWinnerMarketCard` | `Season winner` | **amber**（Trophy） |
| `TopScorerMarketCard` | `Top scorer` | **amber**（Target） |
| `SpotlightPropsCardHorizontal` | `Featured props` | **violet**（Flame） |
| `BinaryQuestionCard` | **不加 chip**（按你的意见，用户不在意） | — |

配色规则：
- **amber** = 比赛阶段 / 赛季奖项类（Group/Round/Season winner/Top scorer）
- **violet** = 衍生玩法 / 编辑精选类（Player prop、Featured props）

右侧 `Hot` / `Trending` badge 完全不动。

## 改动

1. **新建 `src/components/sports/CardChip.tsx`**
   - 导出 `<TypeChip icon={…} label="…" tone="amber" | "violet" />`，单一样式源。
   - 替换 `EventMarketTileCard` 内联的 `StageChip`。

2. **`EventMarketTileCard`** — `showStage` 改名为 `hubContext?: boolean`：
   - `hubContext=false`（默认）→ 渲染 `LeagueChip`（首页行为不变）。
   - `hubContext=true` → 有 `stage` 渲染 `TypeChip(stage, amber)`；无 stage 且 binary → `TypeChip("Player prop", violet)`；其它 → 不渲染左侧 chip。

3. **`GroupWinnerCard`** — 去掉 kicker 小字，字母方块作为左侧 glyph 保留，**右侧加 `TypeChip "Group winner" (amber)`**。

4. **`BinaryQuestionCard`** — 去掉 `WC · Yes / No` 小字，**不加 TypeChip**，"?" 方块保留作为唯一左侧 glyph。

5. **`LeagueWinnerMarketCard` / `TopScorerMarketCard`** — 删掉 `LeagueChip + · SEASON WINNER / · TOP SCORER`，替换为单个 `TypeChip "Season winner"` / `TypeChip "Top scorer"`（amber）。

6. **`SpotlightPropsCardHorizontal`** — header 上方加一行 `TypeChip "Featured props" (violet)`。

7. **`league.$slug.tsx`** — `EventMarketTileCard` 调用点从 `showStage={isTournament}` 改为 `hubContext`，在 league hub 内**始终传 `true`**（常规联赛 Games 也不用再显示自己的联赛 chip）。

8. **首页 / 跨联赛 lobby** — 找 `EventMarketTileCard` 其它调用点，**不传 `hubContext`**，保持联赛 chip。

9. **`/style-guide`** — 现有的 "league chip vs stage chip" demo 扩展成 **"Card chip taxonomy"**：并排展示所有 props 卡 + EventMarketTile 在 hub context 下的新 chip。

## 不动

- 首页 dashboard 的 `EventMarketTileCard` 仍然显示联赛 chip。
- 右侧 `Hot` / `Trending` badge 不变。
- 队伍 / 球员 logo、WC logo、ambience 不动。
- 数据层字段（`stage`、`league.short`、`GroupMarket.kicker`）保留。
