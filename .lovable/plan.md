## 问题

GUES-01..08 进度 HUD 里的国旗目前是 emoji（`country.flag`），尺寸只占瓦片很小一块，和下方"做旧国旗大图 + 复古记分牌"的整体视觉不在一个量级，显得寒酸。

## 方案

把 HUD 里每个已揭晓 / 进行中 / 已锁单 tile 的 emoji 换成已有的做旧旗帜纹理 `country.flagImage`（即 Active Bay 用的同一张图），并明显放大。

### 修改点（单文件）

`src/components/sports/promo/GuessTheLegendTab.tsx` 的 `RoundTile`：

- 替换 emoji 区块：用 `<img src={country.flagImage}>`，`w-full h-12`（瓦片宽度的 80%+，相对当前 emoji 大概 2× 视觉体量），`object-cover`，`rounded-sm`，外加 1px 暗色描边贴合复古面板。
- 状态滤镜：
  - voting / locked-in：原色 + 轻微 `contrast(1.05) saturate(1.1)`
  - revealed-hit：原色 + 顶部一道极淡绿色 inset 光
  - revealed-miss：`grayscale(0.5) opacity(0.7)`
  - upcoming：继续显示大号"?"，不放图（保持神秘）
- 瓦片内部 padding 微调（`p-2` → `px-1.5 pt-1.5 pb-2`），让回合编号、旗、底色条三者节奏更紧凑。
- 底部彩条 + 外框色保持现状（已经能传达 hit/miss/active 状态）。

### 不动的部分

- 数据结构 / 路由 / Active Bay / Archive 全部不动。
- emoji 字段 `country.flag` 保留（其它地方可能还在用）。
- DESIGN.md 不改（这是同一套规则的更忠实执行，不是新规则）。
- `/style-guide` 里的 `LegendScoreboardDemo` 因为复用同一组件会自动同步，无需单独改。

### 验证

改完用 Playwright 截 `/promo/world-cup?tab=legend` 桌面态确认 HUD 旗帜明显变大、与下方主旗风格一致。
