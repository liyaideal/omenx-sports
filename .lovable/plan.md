## 问题诊断

截图里的 `SpotlightPropsCardHorizontal`（Featured props 区段第三张卡）信息有大量重复：

- `@WC26_GROUP_F` — 来自 `PlayerSpotlight.handle`，在球员卡（Mbappé）有意义，套到 group 上就是噪音。
- `World Cup 2026 · Group stage` — 来自 `position` 字段，但当前页就是 WC 2026 专题页。
- 每个 row 重复 `Vol $X · Group stage` — `Group stage` 在 3 行里出现 3 次；卡片标题已经是 "Group F Winner"，rows 又是 "France **to win Group F**"、"Germany **to win Group F**"、"Japan **to win Group F**"，"to win Group F" 也是 3 次重复。
- 整体没有"featured / 营销"的视觉钩子 — 只是个普通的列表卡。

---

## 改动方案

### 1. `SpotlightPropsCardHorizontal.tsx` — 去噪 + 加营销感

**Header 简化**：
- 删掉 `@handle` 那一行。
- 删掉 `position` 副标题。
- 标题左侧加一个发光的 **"Featured" 徽章**（Sparkles 图标 + 高亮渐变背景），右上角的 `N markets` 改成更醒目的小 chip。
- 标题下面加一行 **tagline**（新字段 `tagline?: string`，例如 "Pick who tops Group F before the final whistle."），如果没有则不渲染。

**Portrait 列加营销感**：
- 头像区右侧加一条从左到右淡出的彩色渐变蒙版，让头像和内容自然过渡（不再是硬切左右两栏）。
- 头像下方叠一个小角标，例如 "🔥 Hot" 或 "+24h Vol $268K"（来自 `player.props` 聚合 volume24h），让用户感到这是被推荐的热门 bundle。

**Rows 简化**：
- 删除每行的 `endsLabel`（卡片只有一个截止时间，统一展示到 footer）。
- meta 行只留 `Vol $X · ↗ +Δ% 24h`（用 outcome[0].delta24h 算 24h 涨跌指示），更像交易卡片。

**新增 Footer**：
- 增加一个 footer：`Clock + 单一 endsLabel`（取 `player.props[0].endsLabel`） + 右侧 `Users + 聚合 traders + Vol 聚合`。
- 这样和 GroupWinnerCard / BinaryQuestionCard 的 footer 风格一致。

### 2. `sports-markets.ts` — 清理 GROUP_F_SPOTLIGHT 数据

- 新增可选字段 `tagline?: string` 到 `PlayerSpotlight` 接口。
- `GROUP_F_SPOTLIGHT`：
  - `position` 改成简短的 `"Group F · 16 nations"`（不再重复 World Cup 2026）。
  - 新增 `tagline: "Pick who tops Group F before the knockouts."`。
  - 三条 prop 的 `title` 简化为 `"France"`、`"Germany"`、`"Japan"`（去掉 "to win Group F"）。
  - `endsLabel` 由 `"Group stage"` 改成 `"Settles Jun 27, 2026"`（和 group 卡片对齐）。
- 同样地，`MBAPPE_SPOTLIGHT` 和 `CHELSEA_SPOTLIGHT`：把 `position` 留作球员位置（本来就是球员信息，合理），可选添加 tagline 营销文案。

### 3. `/style-guide` 同步

`SpotlightPropsCardHorizontal` 已经有 demo 区段，更新数据驱动展示自动反映；无需额外结构改动。

---

## 不改动

- `PlayerPropsSpotlight`（首页竖版 carousel）保留，position/handle 在球员场景下仍合适。
- GroupWinnerCard / BinaryQuestionCard 不动。
- 数据层只动 3 个 SPOTLIGHT 常量 + 1 个 interface 字段。

---

## 风险

- `tagline` 是新字段；老的 spotlight 没填会回退为不渲染该行，header 自动收紧。
- 移除 `@handle` 和 `position` 是这张卡的视觉变化；如果未来想保留它们，可以做成 `variant: "player" | "promo"`，但目前 3 张 spotlight 都更适合 "promo" 形态 — 这次先统一成 promo 风格。
