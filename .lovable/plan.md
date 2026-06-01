## Featured Props 卡片：还原 event → markets 结构

用户语义：卡片标题 "World Cup Champion" 是一个 **event**，下面 5 行（Brazil/Argentina/France/England/Spain）是这个 event 下的 **markets**（每个国家都是一个 binary YES/NO 市场）。当前每行重复 "X to win the World Cup 2026"，看起来像一堆独立 event 堆在一起。

注：这是数据/展示层问题，底层 `WC_CHAMPION_SPOTLIGHT.props[]` 数据结构本身是合理的（一个 spotlight 容器 = event 概念，里面 5 个 binary markets）；只需在展示侧把行 label 改成"队伍名"，让父卡片的标题承担"to win the World Cup 2026"语义。

### 改动

**1. 数据层** `src/data/sports-markets.ts` (line 753–845)
- 给每个 prop 加一个简短 `shortLabel`/`subject` 字段（如 "Brazil"），用作行内展示
- 或者直接保留 `title` 不动，在组件里截取 — 但加字段更干净。**推荐：复用现有 `subtitle` 字段或新增可选 `subject?: string`**
- 给 `WC_CHAMPION_SPOTLIGHT` 也 review 一下 `firstName/lastName` —— 它是借用 PlayerSpotlight 类型来塞 event 的，现在显示为 "World Cup Champion" 是 OK 的，但 `position` 字段（"Tournament winner · 48 nations"）当前没显示，可作为 event 描述展示

**2. 组件** `src/components/sports/league/SpotlightPropsCardHorizontal.tsx`
- 行 label 优先级：`m.subject ?? m.title`
- 给行加 team logo（数据里 `outcomes[0]` 没 team，但可以从 prop 上加 `team?: Team` 字段；或者由 `subject` 文本 + 国旗 emoji 简化）。**推荐：给 prop 加可选 `team?: Team`，行展示队徽 + 国名，与 LeagueWinnerMarketCard 一致**
- 顶部 chip 文案保持 "Featured props" 没问题
- 卡片标题保留 "World Cup Champion"

**3. style-guide 同步**：`SpotlightPropsCardHorizontal` 已在 style-guide 引用（line 65, 1565），改完自动反映；新字段不影响其它 spotlight（球员 prop 不需要 subject/team，回退到 title）

### 视觉效果（改后）
```
┌─────────────────────────────────────────────┐
│ 🔥 FEATURED PROPS                           │
│ World Cup Champion                          │
│ ───────────────────────────────────────     │
│ 🇧🇷 Brazil       Vol $2.40M ↗+2¢  [Y 18¢][N 82¢] │
│ 🇦🇷 Argentina    Vol $2.10M ↘-1¢  [Y 16¢][N 84¢] │
│ 🇫🇷 France       Vol $1.80M ↗+1¢  [Y 14¢][N 86¢] │
│ 🏴 England      Vol $1.45M       [Y 11¢][N 89¢] │
│ 🇪🇸 Spain        Vol $1.20M ↗+1¢  [Y 10¢][N 90¢] │
└─────────────────────────────────────────────┘
```

### 可选讨论
"球员 spotlight"（Mbappé、Messi 这种）每行也确实是独立的 binary market（"Goals over 6.5", "Assists over 4.5"），那种语义上每行确实是独立 market，title 自带场景，不需要 subject。所以新字段是可选的，按场景填。

确认后执行。