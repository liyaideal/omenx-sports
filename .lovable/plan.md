## 问题诊断

现在 Grid 是"价格固定在左轴 + 未来格子静止排在右边"，所以看起来是价格自己在上下抖。Bettle 是反过来：**价格线水平向右一直走、格子持续向左滑**，价格线尖端在屏幕中央的"NOW"分界线上 hit 到哪个格子就算中。

## 重做布局

主区横向一分为二：

```
┌──────────────── HISTORY ────────────────┬──── FUTURE GRID ────┐
│  price line ───────────────────●━━━━━━━━│ [cell][cell][cell]… │
│  ($50.6¢ tag)                  NOW──────│  ▲ 每秒整列向左滑    │
└──────────────────────────────────────────┴──────────────────────┘
        左 ~38%                              右 ~62%（10 列×11 行）
```

- **HISTORY 区**：60s 滚动 SVG 折线（涨绿/跌红），尾端贴 `50.6¢` 胶囊。线一直向右画到 NOW 线。
- **NOW 分界线**：HISTORY 与 GRID 中间一条 1px cyan dashed 竖线 + 顶部 `▲ NOW` 标，这是 hit 判定线。
- **FUTURE GRID**：10 cols × 11 rows，每 1s 整列 `translateX(-cellW-gap)` 平移一列；最右侧 push 新一列；y 轴中点 = 当前价 round 后取整，超出 ±5¢ 时 y 中心 1s 平滑过渡跟随。
- **价格"延伸尖端"**：价格线尾端再向 GRID 内画一小段 dashed 投影（1–2 cells），强调"线正朝格子走"。

## 命中逻辑改写

不再"等 N 秒到点查价格"，改成"格子撞到 NOW 线时查价格"：

1. 点击 GRID 某 cell → 记下 `row + 当时距 NOW 的列偏移 = secondsAhead`，stake/mult/leverage 锁定。
2. 每秒整列左移，cell 的 col 减 1。
3. cell 抵达 col 0（NOW 线）瞬间：取当前 `price`，落入 `[center-0.5, center+0.5)` 则 won，否则 lost。
4. cell 越过 NOW 后立即从 GRID 消失。

语义等价于现有 `targetAt` 比较，视觉变成"格子撞到价格"，体验完全像 Bettle。

## 文件改动

- **重写** `src/features/strikezone/Grid.tsx`
  - 删 Y 轴和 PriceCapsule
  - cells 容器 `transform: translateX(- baseCol * (cellW+gap))` + `transition: transform 1000ms linear`，每 `tickSec` 把 baseCol += 1，最右压入新一列 mult
  - 命中判定改在 `baseCol` 变化时遍历 markers
- **新增** `src/features/strikezone/HistoryChart.tsx`
  - SVG 折线，60 个 1s 采样点（来自 `useLiveTicker.history`）
  - 末端 PriceCapsule 水平贴线尾
  - 右沿 dashed 投影
- **改** `src/features/strikezone/PriceCapsule.tsx`：接受 `{ price, x, y }` 绝对定位
- **改** `src/routes/strikezone.tsx`：主区改为 `flex` 的 `<HistoryChart>` + `<NowDivider>` + `<Grid>`；删 cell-level `targetAt` 比较循环（settle 由 Grid 在 col=0 时 callback）

## 不动

顶部 Event Tabs、Sidebar（balance / markets / bet size / leverage / stop）、杠杆数学、热度配色、字体、倍率公式 —— 全保留。

## 边界

- 价格在 60s 内漂出 ±5¢ 时，y 轴中心 1s 平滑跟随（避免 row 跳变）
- 下到 +10s 列的注会经历完整 10s 左移动画
- HISTORY 区不够数据时（开局前几秒）左侧线段从右往左淡入