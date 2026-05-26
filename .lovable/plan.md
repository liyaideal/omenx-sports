## 目标

`EventMarketTileCard` 三张卡片高度相等但内容塌缩在顶部、footer 浮高不一致。把 binary（2 outcome）卡换成大尺寸双列横排，three-way 保持现在的竖排，让两种形态各自天然填满卡片高度。

## 改动范围

只改 `src/components/sports/dashboard/EventMarketTileCard.tsx`。不动数据、不动外层 grid、不动 three-way 卡片视觉。

## 设计规格

**three-way（保持不变）**
- header → fixture(MCI vs ARS) → 3 行竖排 outcome → footer
- 现在的样子就对

**binary（新版）**
- header → 标题区（fixture 两队 / 单 market 标题） → **2 列横排大 outcome 块** → footer
- 两个 outcome 块各占一半宽度，等高，块内：
  - 顶部一行：YES/NO 圆形徽标（或队徽）+ 名称
  - 中间大字：价格 `48¢`，font-display，2xl 字号
  - 底部小字：24h delta（`↗ 2` 绿 / `↘ 4` 红）
- outcome 块用更厚的 padding（`p-4`）、`rounded-2xl`、与现在相同的 `bg-white/[0.03] ring-1 ring-white/[0.05]`
- outcome 容器：`grid grid-cols-2 gap-2 flex-1`，`flex-1` 让它撑满中段
- three-way 容器同样加 `flex-1` 保证 footer 贴底

**额外**
- 卡片根容器已有 `flex flex-col`，footer 加 `mt-auto` 双保险

## 技术细节

在 `EventMarketTileCard` 内按 `market.shape` 分叉：
- `three-way` → 现有 `OutcomeRow` map，外层 `flex-col gap-1.5 flex-1`
- `binary` → 新 `OutcomeBlock` 组件，外层 `grid grid-cols-2 gap-2 flex-1`

`OutcomeBlock` 复用现有徽标判定逻辑（team logo / Draw X / YES Y / NO N 颜色），重排为竖向：徽标+名称在上，价格大字在中，delta 在下。`PricePill` 不复用——这里要的是大字号裸数字，直接渲染 `{Math.round(price*100)}¢`。

footer 加 `mt-auto`。

## 不做

- 不加 sparkline / 不加 vol bar（那是方案 B）
- 不改 three-way 卡片
- 不动颜色 token、不动数据结构
