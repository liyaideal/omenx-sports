
# 交易详情页 (/event/$id) 改造计划

## 现状速览

- 左列：`EventDetailHeader`（队徽 + 三选项 outcome list） → `PriceChart` → `OrderBook`
- 右列：sticky `TradeForm`（lg+ 才 sticky）
- 底部全宽：`PositionsTable`
- 直播信号只在卡片里出现（`isLiveStream` + `livePoster` + `liveScore` + `liveClock`），详情页完全没用到

## P0 — 直播 LiveTrade 模块（你点名要的）

**目标**：直播中的 event 让用户边看边下单，鼠标不离开页面。

新增组件 `EventLiveStage`（替换/前置于 PriceChart）：

- 容器 16:9，复用 `livePoster` 作为视频海报，中间放大号 Play 按钮（mock 播放，点击切到"已播放"态加伪播放动画 + 字幕条；真接入留 props 口子）。
- 顶部叠加：左 LIVE 红胶囊（呼吸点），中央比分 bug（沿用 LiveStreamCard 的样式），右 `liveClock`。
- 右下角浮动控件：Mute / PIP / Fullscreen / Theatre。
- 下方一行 "Streaming now · N watching · 同步行情 · Δ24h"。
- 在 PriceChart 上方 Tab 切换：`Stream | Chart | Order book`，三者占同一卡槽，用户随时切，避免页面被拉长。直播事件默认落在 Stream。

**Sticky mini player**（关键体验）：

- 用户向下滚动越过 Stage 阈值后，把播放器收成右下角 320×180 浮窗（broadcast 比分条 + 关闭/还原按钮），始终可见。
- 浮窗里的 outcome cents + 一键 Buy 复用 `useTradeDrawer().openTrade`，让用户在看 PositionsTable 时也能下单。

非直播 event 不渲染该模块，详情页保持现状。

## P1 — 其他建议（建议同期做的，优先级从高到低）

挑你想要的我一并落地：

1. **Related markets 侧栏 / 抽屉条**：同一 fixture 的其他 market（Anytime scorer / Total goals / BTTS / Cards）做一排横向 chip，点 chip 在当前页内切换 market，无需返回上一级。
2. **Live tape（最近成交）**：PriceChart 下面 8 行滚动公共成交（用户名 + Y/N + cents + size + 时间），社交证明 + 真实感。
3. **Order book + Trade form 双列折叠**：屏幕窄时 OrderBook 可折叠成"深度条"（绿/红堆叠 bar），把垂直空间还给直播 + 图表。
4. **Mobile sticky 下单条**：移动端把 TradeForm 收到底部固定 bar：当前 outcome cents + 数量 + Buy 大按钮，点开展开全屏 sheet。当前 `lg:sticky` 在 md 以下完全失效，体验断档。
5. **Header 简化**：上方 "Markets" 三选项列表 + 下方 Volume/24h/Traders 数字条挤在 header 里有点重，建议把 stats 移到 PriceChart 顶部一行 inline metric，让 header 只承担"这是哪场比赛 + 选哪个 outcome"。
6. **Countdown / 阵容 strip**（非直播 + 未开赛事件）：kickoff 倒计时 + 首发预测 + 天气，给 pre-match 用户内容补给。
7. **Share 深链**：右上加分享按钮，复制当前 URL 带 `?outcome=...`，落地页自动选中。
8. **Comments / Chat tab**：直播时尤其重要，可挂在 Stage 右侧 docked 面板，桌面端 lg+ 显示。

## 技术细节

- 新建 `src/components/sports/event/EventLiveStage.tsx`、`StreamMiniPlayer.tsx`、`StageTabs.tsx`。
- mini player 用 `position: fixed` + `IntersectionObserver` 检测 Stage 是否离开视口；用 React portal 挂到 `<body>`，避免被 AppShell padding 截断。
- 视频源先用 `<video poster muted loop autoPlay playsInline>` + 一段循环短片 placeholder（或就用 poster + 伪播放动效），留 `streamSrc?: string` 字段在 SportsMarket 上以后接真源。
- `/style-guide` 同步加 EventLiveStage / StreamMiniPlayer 的 demo（按你 memory 里的规则）。
- 改完去 `/event/wc26-usa-par`（直播态 fixture）和一个非直播 event 双向回归。

## 建议本轮先做

P0（直播 Stage + sticky mini player + Stream/Chart/Orderbook tab）+ P4（移动端 sticky 下单条），其他 P1 你挑。
