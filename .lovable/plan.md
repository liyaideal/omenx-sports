# 移动端 Tab 拆成独立路由

## 现状问题

`MobileBottomNav` 的 Events / Fans 只是 `scrollIntoView` 到 home 页上的 `#events` `#fans` 锚点 —— 点了什么都没"换页"，等于书签。同时 home 页被 Events 网格 + Fans zone 塞得很长。

## 新结构

把移动端的 Events 和 Fans 各自抽成独立路由，home 变短，只保留"首屏感"内容。

### 路由

| 文件                      | 路径       | 内容                                                                 |
|---------------------------|-----------|----------------------------------------------------------------------|
| `src/routes/index.tsx`    | `/`       | 桌面端 = 现状不变。移动端 = Live hero + Day strip 预览（今天前 3-4 场）+ Season teaser + 两个跳转入口卡（"See all events →" / "Open Fans →"） |
| `src/routes/events.tsx`   | `/events` | 移动端：完整的 DayStripCalendar + 全部 upcoming 列表（原 home `#events` 那块整段搬过来）。桌面端访问直接 redirect 回 `/`（事件在 home 已经有完整呈现） |
| `src/routes/fans.tsx`     | `/fans`   | 移动端：FanZoneHeader + 关注/未关注分支 + LiveActivityCard。桌面端同样 redirect 回 `/` |

桌面端 redirect 用 route 的 `beforeLoad` 配合 `useMediaQuery` 不靠谱（loader 在服务端跑），所以直接的做法：两个新路由的 component 在桌面端用 `hidden md:block` 渲染一个"This page is only available on mobile, [back to home]"占位 + 移动端真实内容。简单、SSR-safe、零 JS gate。或者更干脆——两个路由的 head() 不放 og:image，组件渲染的内容在 desktop 上就用一个回到主页的卡片。

### MobileBottomNav 改造

- 删掉 `anchor` 字段和 `scrollIntoView` 逻辑。
- 用 TanStack `<Link to="/" | "/events" | "/fans">` 替换 `<button onClick>`。
- `Me` tab 仍然是 button + `onMeClick`（开 Sheet）。
- active 状态用 `useRouterState({ select: s => s.location.pathname })` 算（不再靠父组件 props）。这样组件自洽，不用 home 维护 `activeTab` state。
- 触觉反馈保留（`navigator.vibrate(8)`），在 Link 的 `onClick` 里调。

### home (`index.tsx`) 移动端瘦身

新的移动端纵向流：

```text
MobileTopBar
  ↓
MobileLiveHero (2 张 16/9)
  ↓
"Today" 小标题 + DayStripCalendar (只今天那一格高亮)
  + 今天的前 3 场 EventMarketTileCard
  + [See all events →] 大跳转卡 (Link to /events)
  ↓
Fans teaser: FanZoneHeader 简化版 (只显示 following count + 头像 row)
  + [Open Fans →] 跳转卡 (Link to /fans)
  ↓
Season Markets (保留，作为 home 的"长尾"内容)
  ↓
MobileBottomNav
```

桌面端 (`md:block`) 完全不动。

### style-guide 同步

按 memory 规则，`/style-guide` 里的 Mobile Shell 区要加：
- `/events` 页 PhoneFrame 演示（DayStripCalendar + 列表）。
- `/fans` 页 PhoneFrame 演示。
- 把现有 Mobile Shell 区里的 home 演示换成新的"短版" home。

## 技术细节

- 新建 `src/routes/events.tsx`, `src/routes/fans.tsx`，都用 `createFileRoute("/events")` / `("/fans")`。各自 head() 设独立 title + description + og:title/description + canonical。
- 桌面端占位：在两个新路由的 component 里用 `<div className="hidden md:flex ...">It's a mobile-first page — [Open homepage]</div>` + `<div className="md:hidden">真正内容</div>`，避免 redirect 引起的 SSR 抖动。
- 把 home 里 `#events` `#fans` 两个 section 的内容抽到新组件：`MobileEventsSection`（接受 day strip props + markets）和 `MobileFansSection`（接受 followed/suggested 数据），分别在新路由和 home 的瘦身版里复用（home 的 Fans teaser 用 FanZoneHeader + 头像 row，不复用 MobileFansSection 整体）。
- 删 `MobileBottomNav` 的 `active` / `onTabChange` props 改用 router state；同步 home 不再传 `activeTab`。
- `MobileBottomNav` 仍是 `md:hidden` 全局 fixed，所以新路由也会自动获得底部 tab —— 不需要每个路由单独引入。
- `routeTree.gen.ts` 由 Vite 插件自动重生，不要手改。

## 不改的事情

- 桌面端 home（`hidden md:block` 分支）。
- BridgeStrip、AppTopBar、所有 dashboard/* 组件。
- 数据层 (`sports-markets.ts` 等)。
- Me Sheet 行为。
