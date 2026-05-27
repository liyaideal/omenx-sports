## 问题

之前为了"用 desktop 尺寸展示"，我在每个 `Variant` 外层加了 `min-w-[1280px]` + `overflow-x-auto`，导致：
- 卡片被强制撑到 1280px，超出左侧 Modules 目录之外的可见区域
- 每张卡片都得横向滚动才能看全，非常难用

但卡片本身（EventMarketTileCard、MatchMarketCard、LeagueWinnerMarketCard 等）都是**自适应宽度**的——它们会自动撑满父容器。所以根本不需要固定 1280。

## 调整方案（仅改 `src/routes/style-guide-homepage.tsx`）

1. **去掉 Variant 的固定宽度框**
   - 移除 `overflow-x-auto` 和内层 `min-w-[1280px]` 包装
   - `Variant` 恢复为简单的虚线边框 + padding 容器，让卡片自然撑满

2. **去掉变体里写死的小宽度容器**
   - `MatchMarketCard` / `FanPostCard` / `FansZoneEmpty` 等当前外层包了 `max-w-[420px]`——保留这个最大宽度，因为这些卡片在真实首页里就是窄列卡片，撑满整行反而失真
   - `LiveActivityCard` / `PlayerPropsSpotlight` 保留 `w-[340px]`，因为它们在真实首页里是固定窄列
   - `AppTopBar` / `LeagueWinnerMarketCard` / `TopScorerMarketCard` / `EventMarketTileCard` / `BridgeStrip` / `PageSectionHeader` / `DayStripCalendar` / `FanZoneHeader` 是宽容器型组件，让它们撑满 Variant 框

3. **目录瘦身（可选小优化）**
   - 目前 TOC 列宽 `200px`，可压到 `160px`，给 main 多一点空间
   - 整页 `max-w-[1400px]` 不变

## 效果

- 所有卡片在当前 1021px 视口下完整可见，不再横向溢出
- 真实首页里"窄列"型的卡片（match / fan post / activity / spotlight）保留其窄宽度，避免视觉失真
- "宽行"型的卡片（top bar / event tile / winner / scorer / bridge / day strip）随主列宽度自适应铺满

如果之后想看 1920 desktop 下的真实表现，可以直接把浏览器 / preview 切到 desktop 视口，不需要在 playground 里强制撑宽。
