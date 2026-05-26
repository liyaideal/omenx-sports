# MarketCard / OutcomePill 升级方案

## 目标
1. 队名永不截断 —— pill 主显**3–4字母缩写**（RM / BAR / LAK / CEL / MCI），hover 显示完整队名 tooltip
2. 圆形占位 crest 替换为**真实队徽**，未命中时 fallback 到现有字母 crest

## 1. 队伍字典 `src/lib/teams.ts`（新建）

集中维护"全名 ↔ 缩写 ↔ logo URL"映射，组件只接收一个 `teamId`（slug）或完整 `Team` 对象。

```ts
export interface Team {
  id: string;          // slug, e.g. "real-madrid"
  name: string;        // "Real Madrid"
  short: string;       // "RM" (3–4 chars)
  logo: string;        // remote URL or imported asset
  accent?: string;     // optional brand color for crest ring
}
```

预置一组 demo 数据：Real Madrid / Barcelona / Man City / Arsenal / Lakers / Celtics / 以及中性 Yes / No（Yes/No 没有真实 logo，继续走字母 crest，缩写就是 "YES"/"NO"）。

## 2. 真实队徽来源

用 **稳定的体育数据 CDN URL**，无需打包资源、无需鉴权：

- 足球俱乐部：`https://r2.thesportsdb.com/images/media/team/badge/{id}.png`（TheSportsDB 公开 CDN）或 `https://a.espncdn.com/i/teamlogos/soccer/500/{id}.png`
- NBA：`https://cdn.nba.com/logos/nba/{teamId}/global/L/logo.svg`（NBA 官方 CDN）

具体 URL 在 `teams.ts` 里写死即可，组件不关心来源。

> 提示：这些是各联盟/数据商的公开 CDN，用于 demo/style-guide 没问题；正式上线如果要规避商标风险，可以换成自绘 SVG 或购买授权图源。要不要我现在就用这些 URL，后续你再替换？

## 3. `TeamCrest.tsx` 改造

新增 `logoUrl?: string` 属性：
- 有 `logoUrl` → 渲染 `<img>`，失败 (`onError`) 自动 fallback 到当前的字母 + 渐变圆
- 无 → 走现有字母 crest 逻辑
- 圆形容器、尺寸不变，避免影响其它使用方

## 4. `OutcomePill.tsx` 改造

Props 调整：
- 新增 `team?: Team` 替代裸 `label: string`（保留 `label` 作为 fallback，向后兼容）
- 内部用 `team.short` 做主显文案，用 `team.logo` 传给 `TeamCrest`

布局回到**单行横排**（不再两行堆叠），因为缩写很短：
```
[logo] RM            54¢
                     +3¢
```
左：圆 logo + 加粗大号缩写。右：价格（大号 mono）+ delta 小标签竖排。横向再也不会挤。

Tooltip：包一层 shadcn `<Tooltip>`，`content = team.name`，hover 0.2s 后浮出。Yes/No 这种没有"全名"的中性 outcome 不挂 tooltip。

## 5. `MarketCard.tsx` 改造

`outcomes` 类型从 `{ label, probability, delta24h }` 升级为 `{ team: Team, probability, delta24h }`。
style-guide 里的三张示例卡改用 `teams.realMadrid` / `teams.barcelona` / `teams.mancity` / `teams.arsenal` / `teams.lakers` / `teams.celtics` / `teams.yes` / `teams.no`。

## 6. 其它调用点

style-guide 里所有 `<OutcomePill label="...">` 用例统一换成 `team={...}`。`MatchCard`、`OutcomeSelector` 等如果也用到，一并迁移。

## 文件清单
- 新建 `src/lib/teams.ts`
- 修改 `src/components/sports/TeamCrest.tsx`（支持 logoUrl + 错误回退）
- 修改 `src/components/sports/OutcomePill.tsx`（team + tooltip + 横排布局）
- 修改 `src/components/sports/MarketCard.tsx`（接收 team 对象）
- 修改 `src/components/sports/OutcomeSelector.tsx`、`MatchCard.tsx`（保持一致）
- 修改 `src/routes/style-guide.tsx`（demo 数据切到 teams 字典）

## 一个待确认的小决策
Yes / No 这种中性市场，缩写要不要显示成 "YES"/"NO" 单色 pill（无 logo，只保留字母圆），还是继续显示文字 "Yes"/"No"？我倾向前者，视觉跟队伍 pill 对齐。
