## 问题

`LeagueHubHero` 对所有 tournament 类型的 league 都会在 crest 容器右上角叠加一个金色 `<Trophy />` 图标。对 World Cup 2026 来说,league logo 本身就是一座大金奖杯 —— 结果变成"奖杯叠奖杯",视觉冗余且压到 logo 边缘,显得脏。

## 改动

**`src/components/sports/league/LeagueHubHero.tsx`** —— 删掉 crest 容器右上角那块 `<Trophy>` overlay(及其 import)。

理由:
- "这是个 tournament"这层信息已经由 logo 上方那条 `Tournament` 文字 chip + 金色 `kickoffLabel` 倒计时 pill + 金奖杯 hero 背景 ambience 表达过了,不缺这一个角标。
- League logo 本来就是品牌资产,不应该被装饰图标遮挡。
- Season league(EPL 等)本来就没有这个 overlay,删掉之后 tournament/season 两种 hero 的 crest 处理也更一致 —— 都靠 logo 本身说话,差异化交给 chip 行和背景纹理。

不动的部分:
- 背景 pitch stripes、accent 渐变光晕、`kickoffLabel` / hostFlags / stats 等其他 tournament-only 元素全部保留。
- 不改 `world-cup-2026.svg` 本身,不改其它 league 的 hero。
- `Trophy` 在 `CardChip` (TypeChip "Season winner" / "Group winner") 里继续使用,不受影响。

## 备选(不推荐,先不做)

如果之后想给 tournament hero 一个更精致的"高光"动作,可以考虑把 crest 容器换成带金色 ring + 内阴影的"奖杯展柜"框,但这是一次独立的视觉升级,不在这次清理范围内。
