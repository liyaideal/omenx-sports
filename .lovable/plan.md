## 目标

干掉 mobile 的 Home 标签，让用户直接进入 Events。Desktop home 完全保持不变。账户数据只在 MeSheet 里出现，零重复。

## 改动

### 1. Mobile 底部导航：4 → 3 tab
`src/components/sports/mobile/MobileBottomNav.tsx`
- 删除 `Home` tab，剩 `Events / Fans / Me`

### 2. `/` 路由在 mobile 上重定向到 `/events`
`src/routes/index.tsx`
- 加一个 mobile-only 客户端重定向：`useEffect` 里 `window.matchMedia("(max-width: 767px)").matches` 时 `navigate({ to: "/events", replace: true })`（避免 SSR/hydration 问题）
- 删除整段 `<MobileChrome> … </MobileChrome>` mobile 分支
- Desktop 分支（`hidden md:block` / `hidden md:grid`）完全保留，包括 Season 右栏的 `PlayerPropsSpotlight`

### 3. Spotlight 搬到 `/events` 末尾（mobile）
`src/components/sports/mobile/MobileEventsSection.tsx`
- 在 Season futures 之后追加一个 Spotlight section（标题 "Event Spotlight"，用 `PlayerPropsSpotlight`）
- 顺序：Live hero → DayStrip → Upcoming → Season futures → **Spotlight**

### 4. 删除不再使用的 mobile-only 组件
- `src/components/sports/mobile/MobileHomeHero.tsx`
- `src/components/sports/mobile/MobileAccountSnapshot.tsx`
- `src/components/sports/mobile/MobileLiveStatusBar.tsx`

### 5. Style-guide 同步
`src/routes/style-guide.tsx`
- 删除 "Mobile Home modules" 演示区块
- mobile 架构说明改为：`Events (默认入口) / Fans / Me`，注明 Spotlight 在 events 末尾

## 不动的部分
- Desktop `/` 完整布局（含 Season 右栏 Spotlight）
- `/fans` 路由
- `MobileChrome`、`MobileTopBar`、`MobileFansSection`
- `MeSheet`、数据层