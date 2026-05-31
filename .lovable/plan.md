# 全局直播 MiniPlayer + Trade 入口

## 现状

- `StreamMiniPlayer` 当前只在 `src/routes/event.$id.tsx` 内挂载，靠 `useStageOffscreen` 触发显隐。一旦用户跳到首页 / `/events` / `/league/...`，组件被卸载，浮窗消失。
- 浮窗底栏只展示当前选中那一队的价格 + 单边 `Buy` 按钮，进入的是 `TradeDrawer` 并预选了一边，体验上像"快速下注"，不像"交易入口"。
- 没有返回原事件详情页的入口（只在 Stage 还在视口时有"Back to stream"，跨页时无意义），也没有全屏播放。

## 目标

1. 用户在事件详情页开始看直播后，切到其他页面，右下角浮窗继续播 / 继续显示比分。
2. 浮窗提供 3 个明确入口：① 回到事件详情页 ② 全屏播放 ③ 打开 Trade 抽屉（双边选项，不是单边 Buy）。
3. 用户点 × 关闭后，本次会话内不再自动弹出（除非主动在另一场直播里"开始观看"）。

## 方案

### 1) 新建全局 LiveStreamProvider（src/components/sports/live/LiveStreamProvider.tsx）

Context 形态：

```ts
interface LiveStreamCtx {
  active: { marketId: string; outcomeId?: string } | null;
  startWatching: (marketId: string, outcomeId?: string) => void;
  stopWatching: () => void;
  setOutcome: (outcomeId: string) => void;
  // UI 状态
  minimized: boolean;            // 是否处于浮窗状态（false = 在事件详情页 Stage 上）
  setMinimized: (v: boolean) => void;
  fullscreen: boolean;
  openFullscreen: () => void;
  closeFullscreen: () => void;
}
```

挂载位置：`src/routes/__root.tsx`（在 `TradeDrawerProvider` 内层即可），这样浮窗能跨路由存在并能调 `useTradeDrawer()`。

### 2) 把 MiniPlayer 改成全局浮窗（GlobalStreamMiniPlayer）

- 由 `LiveStreamProvider` 直接渲染（portal 到 body），不再由 `event.$id.tsx` 控制。
- 显示条件：`active != null && minimized && !fullscreen && !dismissedThisSession`。
- 自动 `minimized`：
  - 在 `/event/$id` 且 id === active.marketId 时，由该页面通过 `useStageOffscreen` 控制 `setMinimized(true/false)`（保留现有"Stage 离开视口→浮"的体验）。
  - 路由变化到其它路径时，统一 `setMinimized(true)`。
- 关闭（×）→ 同会话内 `dismissed=true`；切换到新的 `marketId` 时重置。

### 3) 底栏改成 Trade 而非单边 Buy

新的底栏布局：

```text
┌────────────────────────────────────────────────┐
│ [video poster + LIVE + clock + score]          │
├────────────────────────────────────────────────┤
│ USA 48¢   PAR 27¢            [⛶] [↗] [Trade] × │
└────────────────────────────────────────────────┘
```

- 两个 chip 展示双方价格，点击选中那一边并写回 `active.outcomeId`。
- `Trade` 按钮：调 `openTrade({ marketId: active.marketId, outcomeId: active.outcomeId })`，由用户在抽屉里再决定 Buy/Sell + 数量。文案用 `Trade`，颜色用 primary 而不是当前的绿色 buy 色。
- `↗` 图标按钮：`router.navigate({ to: '/event/$id', params: { id: active.marketId } })`，自动滚到顶部恢复 Stage。
- `⛶` 图标按钮：`openFullscreen()` → 渲染一个全屏覆盖层（见 4）。

### 4) 全屏播放层（FullscreenStreamOverlay）

- 一个 `fixed inset-0 z-[60]` 的黑色背景层，由 `LiveStreamProvider` 渲染。
- 内容：16:9 居中视频区（沿用 `EventLiveStage` 的 poster + 比分 + clock），底部叠一行迷你 Trade 条（双边 chip + Trade 按钮），右上 ✕ 关全屏（回到浮窗或 Stage）。
- 触发：浮窗 ⛶、或事件详情页 Stage 右上新增 ⛶ 按钮。
- `Esc` 关闭，滚动锁定 body。

### 5) event.$id.tsx 接线

- 移除本地 `StreamMiniPlayer` 渲染。
- 进入页面时若 `market.isLiveStream`，自动 `startWatching(market.id, currentSelected.id)`；Stage 在视口内时 `setMinimized(false)`，离开视口 `setMinimized(true)`。
- 离开路由时 **不** stop（保持播放）；只有用户在浮窗按 × 才停。
- Stage 组件加 ⛶ 全屏按钮，调 `openFullscreen()`。

### 6) 选中态同步

- `event.$id.tsx` 内 `selectedOutcome` 变化时 `setOutcome(id)`，浮窗 / 全屏层共享同一个选中态。
- 反过来，浮窗里切换 chip 也会更新 ctx；回到事件详情页时初始 `selected` 优先取 ctx 里的值。

## 文件变更

新增：
- `src/components/sports/live/LiveStreamProvider.tsx`
- `src/components/sports/live/GlobalStreamMiniPlayer.tsx`（取代旧 `StreamMiniPlayer` 的渲染职责）
- `src/components/sports/live/FullscreenStreamOverlay.tsx`

修改：
- `src/routes/__root.tsx`：包裹 `LiveStreamProvider`。
- `src/routes/event.$id.tsx`：用 ctx 替代本地 MiniPlayer；Stage 加全屏按钮；进入页面自动 startWatching。
- `src/components/sports/event/EventLiveStage.tsx`：右上加 ⛶ 按钮（props 透传 onFullscreen）。
- `src/components/sports/event/StreamMiniPlayer.tsx`：保留作为视觉组件，由 Global 版本调用；底栏从「单边 Buy」改为「双边价格 + Trade + 全屏 + 返回 + ×」。

不动：`TradeDrawerProvider`、`TradeDrawer`、`MobileTradeBar` 逻辑保持。

## 边界 / 取舍

- 移动端（<sm）继续不显示浮窗，避免和 `MobileTradeBar` 抢底部空间；移动端的"全屏"通过事件详情页 Stage 的 ⛶ 按钮触发。
- 目前没有真实视频流，全屏层用 `livePoster` 静帧 + 比分作占位；接入真流时只换 `<video>` 节点即可。
- 关闭浮窗后跨会话不持久（不写 localStorage），刷新即重置。
