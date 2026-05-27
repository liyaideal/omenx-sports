为全站所有队名短码加上「桌面 hover / 移动端 tap 弹 toast」的全名提示。

## 1. 新组件 `src/components/sports/TeamName.tsx`

一个轻量包装，统一所有出现 `team.short` 的地方：

```tsx
<TeamName short="MCI" full="Manchester City" />
```

行为：
- 渲染为 `<span>`（默认）或可选 `as` 多态，保留现有 className 透传。
- 桌面端：包一层 shadcn `Tooltip`，hover 显示 full name。
- 移动端：`onClick` 阻止冒泡 + 阻止默认，调用 `toast(full)` 显示 sonner toast。
- 用 `onClick` + `e.stopPropagation()` + `e.preventDefault()` 避免触发外层 `<Link>` 跳转。
- 通过 CSS（`md:` 断点）或 `matchMedia` 区分桌面/移动；为简单起见，统一两端都启用：桌面 hover 出 tooltip，移动 tap 出 toast，不互斥（hover 在触屏设备不会触发，体验天然分流）。

## 2. 替换所有短码渲染点

扫描并替换以下文件中直接渲染 `team.short` / `fixture.home.short` / `fixture.away.short` 的位置：

- `src/components/sports/dashboard/LiveStreamCard.tsx`（比分胶囊 + segment label）
- `src/components/sports/MatchCard.tsx`
- `src/components/sports/MarketCard.tsx`
- `src/components/sports/HeroMarketCard.tsx`
- `src/components/sports/TopMoverCard.tsx`
- `src/components/sports/EventHeader.tsx`
- `src/components/sports/dashboard/EventMarketTileCard.tsx`（如有）
- `src/routes/event.$id.tsx` 中渲染对阵双方短码处
- style-guide 路由不动（纯文档）

替换原则：只把视觉上的短码 span 换成 `<TeamName>`，不动任何 className/布局。

## 3. Toast 文案

- 内容：`full`（如 "Manchester City"）。
- 不加 description / icon，保持极简，避免在快速浏览时打断节奏。
- 利用 sonner 默认 3 秒自动消失。

## 4. 不改的内容

- 已经显示全名的地方（如 spotlight 卡片 Liverpool/Newcastle）不动。
- 联赛短码（EPL/LL）不在本次范围。
- 不引入额外依赖；`sonner` 和 `Tooltip` 都已在项目里。

## 技术细节

- `<Tooltip>` 需要 `TooltipProvider` 包裹；如根布局没有，则在 `TeamName` 内部就近 `TooltipProvider delayDuration={150}` 即可（多实例性能开销可忽略）。
- 阻止 Link 跳转：在 `<TeamName>` 的最外层节点绑定 `onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast(full); }}`。
- 这样桌面端 hover 出 tooltip 同时点击也能弹 toast；可接受。
- 触屏设备不会触发 `:hover`，因此 tooltip 在移动端自然不出现，只走 toast 分支。