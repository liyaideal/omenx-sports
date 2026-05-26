# Bento 排版修复计划

## 当前问题（对比参考图诊断）

1. **Top Movers 卡片崩了** — 中间列只有 ~440px 宽，硬塞 3 个完整 `MarketCard`（含 EventHeader + 双 OutcomePill + sparkline + Vol/OI），结果 grid 退化成 2 列，第 3 张换行，标题全部折行到 2 行，看起来很挤。
2. **Player Spotlight 不像参考的视觉主角** — 参考里它是右栏最大的"方块"，几乎只有大圆环 + KM。我们用了带 prev/next 箭头、name、3 个 stat chip 的完整版，但右栏太窄导致 NeonRing 被两侧箭头挤压、name + stat 区域反而被 `overflow-hidden` 切掉。
3. **左栏巨大空白** — `FanPulseCard` 用 `h-full` + `mt-auto`，会被拉到和中间列一样高，% 进度条和 Trade footer 之间留出大片空白。
4. **右栏 SentimentCard 被压扁** — TopTradersCard 之后空一大块再到 SentimentCard，且 SentimentCard 文字被裁。

## 修复方案

### A. 新增组件 `TopMoverCard.tsx`（核心修复）

参考图中"Top Movers"那 3 张卡的精简版本，**仅供 bento 中栏使用**，不替换通用 `MarketCard`：

- 高度固定 ~260px，宽度自适应（3 列 grid，每张 ~135–160px 也能撑住）
- 顶部：联赛 pill + 倒计时 pill（同 MarketCard 样式但更紧凑）
- 标题：font-display 16px，`line-clamp-2`，最多两行
- 两个圆形价格徽章（沿用 NeonRing 思路，参考图中的 58¢/+4.2¢ 圆球样式），并排居中
- 下方迷你 sparkline（高 ~36px）
- 底部一行：`Vol $X` · `OI $Y`，font-mono 10px
- 整卡可点击进入对应 market

### B. 重构 PlayerSpotlight 使用方式

新增 `PlayerSpotlightHero.tsx`（参考图右栏顶部的大方块）：

- 去掉 prev/next 箭头（参考图也没有；那两个箭头在窄列里把 ring 挤变形）
- 顶部只留 `@handle` + 右上角 chart icon
- 主体：居中大号 `NeonRing` (size ~260)，里面只放 monogram (text-6xl) + `#10`
- **删除下方的 name / position / 3 stats** —— 这块在参考图里就没有，我们之前堆上去反而显得乱且会被裁。stats 改放在 bento 别处或彻底去掉。
- 卡片设成接近正方形（aspect-square 或 min-h-[360px]），让它成为右栏的视觉重心。

保留原 `PlayerSpotlightCard.tsx` 不动（其它页面/路由仍在用）。

### C. 修 FanPulseCard 拉伸空白

- 去掉外层 `h-full`，改成自然高度
- 去掉 footer 上的 `mt-auto`，换成 `mt-3`
- 让左栏 FanPulse + LiveTicker 按内容堆叠，下方留白由 grid 自然处理（中栏更高没关系）

### D. 调整 bento grid 比例

把 `lg:grid-cols-12` + `col-span-3/5/4` 改为显式像素：

```text
lg:grid-cols-[260px_minmax(0,1fr)_340px]
```

- 左 260：FanPulse 紧凑、LiveTicker 行不压字
- 中 1fr (~520px)：3 张新 `TopMoverCard` 能舒服地一行排开
- 右 340：PlayerSpotlightHero 接近方形、TopTraders 行不挤、SentimentCard 不裁

各列 `items-start`（不再 stretch），消除拉伸空白。

### E. SentimentCard 兜底

如果 340px 下 SentimentCard 仍然挤，把它从右栏挪到左栏 LiveTicker 下方（左栏空间富余），右栏只留 PlayerSpotlightHero + TopTraders。最终在浏览器复核后决定。

## 不动的部分

- Stadium Neon 配色 / 字体 / 圆角 token 全部不变
- Hero strip、Today's matches（MiniEventCard）、Standings、Trending、Upcoming、OmenX Bridge **完全不动**
- 通用 `MarketCard`、`PlayerSpotlightCard` 组件保持原样（其它地方仍在用）
- 不引入新的依赖、不动 routing

## 验收

- 1021×777 视口下，bento 第一屏看得清：3 张 Top Mover 卡一行不换行、每张标题不被截断
- Player Spotlight 是右栏视觉锚点，圆环居中不被挤压
- 左栏 FanPulse 底部不再有大片空白
- SentimentCard 完整显示（位置可能在左栏底部）
- 截图复核通过

## 涉及文件

- 新建 `src/components/sports/TopMoverCard.tsx`
- 新建 `src/components/sports/PlayerSpotlightHero.tsx`
- 编辑 `src/components/sports/FanPulseCard.tsx`（去 h-full / mt-auto）
- 编辑 `src/routes/index.tsx`（grid 模板、组件替换、可能挪 SentimentCard）
