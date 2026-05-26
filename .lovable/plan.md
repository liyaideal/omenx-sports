## 目标

Featured 卡 (`MatchMarketCard`) outcome 区当前用每行一个渐变填充条作 implied probability 可视化，在窄列里像"没填满的进度条"。换成**顶部单条三色堆叠 100% bar + 下面干净的 outcome 行**，更像 Polymarket 的标准玩法。

## 改动范围

只改 `src/components/sports/dashboard/MatchMarketCard.tsx`。数据、外层布局、其他卡片不动。

## 设计规格

**新结构（替换现在的 `<a> outcomes`）**：

```text
[ ====== 42% blue ====== | == 21% violet == | ==== 37% red ==== ]    <- 单条堆叠 100% bar，h-2, rounded-full
  ● Home              Chelsea                            42¢  ↗ 3
  X  Draw                                                21¢  ↘ 1
  ● Away              Paris SG                           37¢  ↘ 2
```

**堆叠条**
- 高度 `h-2`，`rounded-full overflow-hidden bg-white/[0.05]`
- 内部 flex，三段宽度按 `price / total * 100%`
- 颜色：home = home team hue，draw = 中性 `oklch(0.55 0.04 280)`，away = away team hue
- 段之间 1px 分隔（用 `gap-[2px]` 或 inset 阴影）
- 不放任何文字标签，下面行就是图例

**outcome 行**（替换 `OutcomeRow` 渲染）
- 一行三列布局：`[hueDot/x] [teamName + small "Home/Draw/Away" muted]`，右侧 `PricePill`
- 左侧不再是 logo 圆而是一个 `h-2.5 w-2.5` 实心圆点（颜色 = 对应堆叠段颜色），让行更轻
- 队伍名用 `font-display text-sm font-medium`
- `Home / Draw / Away` 角色标签用 `font-mono text-[10px] uppercase tracking-widest text-muted-foreground`
- 行间距 `space-y-2.5`
- 整个 outcomes 块仍包在 `<a href={market.tradeHref}>` 里

**保留不动**
- header（联赛 chip + more 按钮）
- 标题 + 紫色光晕
- 两队 crest + vs + kickoff
- 底部 footer（时间 / 参与人数 / Vol）

## 不做

- 不动数据结构
- 不改其他卡片
- 不加交易按钮 / 不加 sparkline
