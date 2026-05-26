
# 首页 Bento 改版方案

参考用户上传的 dashboard 排版，把当前"全宽分段杂志风"重构为「Hero + Bento 网格 + 已有三段保留」。所有视觉令牌、配色、字体不变；不动 trading 组件接口。

## 新结构

```text
TopBar
Hero Strip（保留并瘦身，右侧 HeroMarketCard 保留）
─────────────────────────────────────────────
BENTO GRID (lg:grid-cols-12, gap-4)
  ┌─ Col 1–3 (左轨) ─────┐ ┌─ Col 4–8 (中柱) ────┐ ┌─ Col 9–12 (右大区) ─┐
  │ FanPulseCard         │ │ "Today's matches"   │ │ PlayerSpotlight      │
  │ (投票 + RatioBar)    │ │ + 3 MiniEventCard 行 │ │  (NeonRing + 缩写    │
  │                      │ │                      │ │   + 队徽 + 3 stat)   │
  │ LiveTicker           │ │ "Top movers"         │ │                      │
  │ (垂直滚动价格)        │ │ + 3 MarketCard       │ │ SentimentCard        │
  │                      │ │                      │ │  (右下半高)          │
  │ TopTraders           │ │ StandingsPreview     │ │                      │
  │ (3–4 LeaderboardRow) │ │  (EPL top 5)         │ │                      │
  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘
─────────────────────────────────────────────
Trending markets（保留 6-card 网格）
Upcoming fixtures（保留）
OmenX bridge（保留）
Footer
```

中等屏 (md) 退化成 2 列：左轨 + 中柱合并堆叠在左 (col-span-7)，右大区 (col-span-5)。
小屏 (<md) 全部单列堆叠，顺序：FanPulse → Today's matches → PlayerSpotlight → Top movers → LiveTicker → Standings → TopTraders → Sentiment。

## 新建组件（src/components/sports/）

### `FanPulseCard.tsx`
投票卡。"Who wins tonight?" + 两个队徽 + 两条 `RatioBar` 显示当前社区投票占比 + 总投票数 + "vote yes / vote no" 跳具体市场。复用 `RatioBar` 和 `TeamCrest`。

### `LiveTicker.tsx`
垂直滚动条。一列 mono 行：`RMA 58¢ ↑4.2` / `LAL 47¢ ↑2.1` …。CSS `@keyframes` 无限上滚 + 鼠标 hover 暂停。每行可点跳市场。高度填满 col。

### `TopTradersCard.tsx`
3–4 行 `LeaderboardRow`（设计系统已有），头像 + 用户名 + 24h P&L。Mock 数据；点击跳 OmenX profile。

### `MiniEventCard.tsx`
紧凑横向赛事卡（替代当前 EventHeader 在 bento 里太大的问题）。左队徽 vs 右队徽 + kickoff 时间 + 联赛 + 「Trade →」按钮。高度 ~96px。

### `StandingsPreview.tsx`
小表格：联赛 tab（EPL/UCL/NBA）+ 5 行队伍排名（队徽 / 队名 / P W D L Pts）。每行点击跳那支队的市场聚合页（暂用 `#`）。

### `PlayerSpotlightHero.tsx`（即 PlayerSpotlightCard 的 hero 变体）
查看现有 `PlayerSpotlightCard`，若已经够用则**直接复用**，不新建。设计：`NeonRing size={220} dashed` 包裹一个大号球员缩写（如 "MBP"）+ 队徽小标 + 球员名 + 位置 + 3 个 StatChip（Goals 132 / Assist 320 / Matches 89）。我会先 read 一下 PlayerSpotlightCard，能复用就复用。

## 现有组件改动

### `src/routes/index.tsx`
重写第二屏起的结构。删除当前 Featured Event section（被 bento 取代——Tonight's headline event 的角色由 PlayerSpotlightHero + Today's matches 第 1 张 + Top movers 共同承担）。`#event-featured` 锚点改为指向 bento 区。

### 其他组件不动
`HeroMarketCard`、`MarketCard`、`MatchCard`、`SectionHeader`、`TopBar`、`Footer`、`EventHeader`（虽然 homepage 不再用，但保留在事件页/style guide）、`OutcomePill`、`CountdownPill`、所有 trading 组件。

## 视觉规则

- Bento 每个卡：`rounded-2xl border border-border bg-surface shadow-card`，hover 同当前 MarketCard 的微动效。
- 区分卡片分量：大卡（PlayerSpotlight）加 `bg-ambient + ring-1 ring-neon/15`；小卡保持 surface。
- LiveTicker 行用 `loss` / `win` 色标 delta，与 MarketCard sparkline 一致。
- 每个卡片右上角放小 SectionHeader-lite（kicker + 可选 action），不用 `SectionHeader` 组件（太重），inline 写。
- 不引入新的字体、新的色值、新的圆角。

## 不做的事

- 不引入真实球员/球队照片（版权）。PlayerSpotlight 用 NeonRing + 缩写 + 队徽（用户选项）。
- 不做投票后的实际提交逻辑。FanPulseCard 是展示态 + CTA 跳市场。
- 不做 LiveTicker 的真实数据，mock 8–10 条静态行循环。
- 不动 Trending/Upcoming/Bridge 三段。
- 不做响应式精修到 <640px——bento 在 md+ 是主战场，sm 单列堆叠即可。

## 验收

改完截 full_page，对比：
1. Hero 之后第一个 viewport (~777px) 是否同时能看到至少 4 个异构模块（参考图水平：6+）。
2. PlayerSpotlight 是否成为右侧视觉焦点。
3. LiveTicker 是否真的在动。
4. 每个 bento 卡是否都有可点击的"通往交易"路径。

## 文件清单

新建：
- `src/components/sports/FanPulseCard.tsx`
- `src/components/sports/LiveTicker.tsx`
- `src/components/sports/TopTradersCard.tsx`
- `src/components/sports/MiniEventCard.tsx`
- `src/components/sports/StandingsPreview.tsx`
- `src/components/sports/PlayerSpotlightHero.tsx`（仅当现有 `PlayerSpotlightCard` 不能直接复用时）

修改：
- `src/routes/index.tsx`
