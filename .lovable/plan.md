目标：每场比赛在 Combo 内最多只能选 1 条 leg。从 Moneyline / Spread / Total 三个 section 中任选一个；在同场内再点另一个按钮（不管来自哪个 section、哪一档线）会替换已有 leg。

实施：

1. `src/components/sports/promo/combo/useComboState.ts`
   - `selectOutcome` 的唯一性键从 `market.marketId` 改回 `match.matchId`：同场命中即替换，不同场比赛才新增（仍受 4 腿上限约束）。
   - `removeLeg(marketId)` 实现不变（按 marketId 过滤）；因每场只一条，等效于按 matchId 删除。
   - 当替换发生且新 market 与旧 market 不同时，可选地用 `toast.info` 提示"Replaced your pick for {match}"，保持当前 toast 风格简短。

2. `src/components/sports/promo/ComboChallengeSection.tsx`
   - `MatchCard` 中各 section（Moneyline / Spread / Total）按钮的高亮逻辑保持按 `outcomeId` 匹配 selectedLeg；同场只会有一个按钮高亮。
   - LineStepper、percentage 显示、卡片整体布局不动。
   - builder slot / quote / mobile sticky bar 不动。

不做：
- 不改数据模型，每场仍同时暴露 ML / SP / TT 三类 market 与多档线。
- 不改 stake（固定 10U）、quote、submit、ticket 渲染、4 腿上限。
- 不改 style-guide mock 字段。