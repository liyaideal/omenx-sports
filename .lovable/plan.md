## 删 StatsBar + 方案 C section header chips

### 视觉

```text
[Header.....................................]
[ All  Live  Soccer  EPL  UCL  ...  NBA  NFL ]

[Featured market 大卡]   Live & upcoming markets   ● 7 OPEN · +$142.20 TODAY ↑   Browse all ↗
                         ─────────────────────────────────────────────
                         [card][card][card]
                         [card][card][card]
```

页面从 header 直接进入 CategoryStrip → 内容网格，删掉中间那条 3 等分 KPI 横条。账户数据以小 chip 形式挂在 "Live & upcoming markets" 标题右侧。

### 改动

**1. `src/routes/index.tsx`**
- 移除 `<StatsBar>` 与外层包裹的 `<div className="px-6 pt-6 md:px-8 md:pt-8">`
- 移除 `StatsBar` import
- 给 `CategoryStrip` 外层加回上 padding：`pt-6 md:pt-8`（替代被删的间距）
- 给 `SectionHeader` 增加 `stats?: { positions: number; pnl: string }` 可选 prop
- 在 "Live & upcoming" 那个 `SectionHeader` 上传入 `stats={{ positions, pnl }}`

**2. `SectionHeader` 内部**
- 当 `stats` 存在时，title 右侧（在 `right` 之前）渲染 chips 行：
  ```text
  ● 7 OPEN POSITIONS   ·   +$142.20 TODAY ↑
  ```
  - "● 7 OPEN" 中性色：`text-muted-foreground`，点用 `bg-primary/70` 小圆点
  - "+$142.20 TODAY ↑" 涨用 `text-win`，跌用 `text-loss`；箭头根据 `+/-` 符号
  - 字号 `text-xs font-mono uppercase tracking-wider`
  - chips 之间用细中分隔符 `text-border` 的 `·`
  - 移动端（`max-md`）chips 折到标题下方一行，避免拥挤

**3. 删除文件**
- `src/components/sports/dashboard/StatsBar.tsx`

### 数据来源

`ACCOUNT_STATS.openPositions` 和 `ACCOUNT_STATS.pnlToday` 直接传给 SectionHeader，不新增 mock。

### 不动

- AppTopBar、AppShell、Featured 卡、其他 section、底部 OmenX bridge strip、CategoryStrip 本身样式

### 受影响文件
- 编辑 `src/routes/index.tsx`
- 删除 `src/components/sports/dashboard/StatsBar.tsx`
