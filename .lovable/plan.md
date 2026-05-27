
# 移动端首页适配

参考截图风格（深色、超大圆角、大队徽、问候语 + 顶部状态栏、内容卡片层叠），把当前桌面 3 栏布局重排成单列移动流，并加上常驻 BottomNav。所有现有卡片组件（`LiveStreamCard`/`EventMarketTileCard`/`MatchMarketCard`/`FanPostCard`/`LiveActivityCard` 等）直接复用，只调整外层容器/排序，不动业务逻辑。

## 1. 新组件

**`src/components/sports/mobile/MobileTopBar.tsx`**
- 高 56px，sticky 顶部，半透明 + backdrop-blur
- 左：`Ω` lockup（点击 = 跳 `omenxUrl.home()`，主站）→ 小箭头 → 斜体 `Sports`（点击 = 留在 `/`）。视觉上是一条面包屑，明确告诉用户"现在在 OmenX › Sports"
- 中：留白
- 右：用户头像（点击打开 Me Tab 抽屉，复用 AppTopBar 里的 DropdownMenu 项作为 sheet 内容）+ 通知铃铛（占位，先不挂逻辑）
- 仅在 `md:hidden` 显示；桌面继续用 `AppTopBar`

**`src/components/sports/mobile/MobileBottomNav.tsx`**
- 固定 `bottom-0`, `z-50`, `pb-[env(safe-area-inset-bottom)]`, 高 64px + safe-area
- 4 个 tab：**Home / Events / Fans / Me**
  - Home → `/`
  - Events → `/` 并 scrollIntoView 到 events 区段（移动端首页内 section anchor `#events`）。下一阶段再拆 `/events` 独立路由
  - Fans → `#fans`
  - Me → 打开 Me Sheet（见下）
- 当前激活的 tab：图标实色 + neon 描边 + 顶部 1px gradient 指示条
- haptic 反馈（`navigator.vibrate(10)`）
- 仅 `md:hidden` 显示；桌面布局不受影响

**`src/components/sports/mobile/MeSheet.tsx`**
- 用 `Sheet`（side="bottom"），圆角 + drag handle
- 顶部用户卡：头像 + 用户名 + Equity 大字（绿色，复用 ACCOUNT_STATS.available）
- BridgeStrip 内容上移到这里：`openPositions` / `pnlToday` / `toClaim` 三个 stat tile + "Open Portfolio" CTA
- 中段："Back to OmenX" 卡片组（2×2 网格）：Markets / Crypto / Politics / Leaderboard，各自带 `ArrowUpRight`，点击外链跳 omenx 主站
- 底部菜单：Rewards / Referral / Settings / Language / Transparency / Help / Discord / Sign Out（直接搬 AppTopBar 里的 DropdownMenu 项）

**`src/components/sports/mobile/MobileLiveHero.tsx`**（参考截图的 Live Scores 大区）
- Section header：`Live` + 斜体 neon `Scores` + 右侧 pill `N matches`
- 内容：第一张直播比赛用大队徽形式呈现（左队徽 80px + 比分 + 右队徽 80px + 下方队名/分钟），下方是横向滑动的额外 live 比赛缩略（如果有多场）
- 仅当存在 `liveStreamMarkets.length > 0` 时渲染；底部接一个"Open market →"链接进 event 详情
- 沿用 `TeamName` + 现有 fixture 数据

## 2. 首页路由 `src/routes/index.tsx` 改造

```text
mobile (< md)                         desktop (≥ md, 不动)
┌─────────────────────┐               同现状（AppTopBar + 3 列网格 + BridgeStrip）
│ MobileTopBar        │
├─────────────────────┤
│ MobileLiveHero      │ ← 大队徽直播
│  (id="live")        │
├─────────────────────┤
│ Day strip           │
│ EventMarketTileCard │ ← 单列堆叠，全部展开
│ EventMarketTileCard │
│ EventMarketTileCard │
│  (id="events")      │
├─────────────────────┤
│ Fans zone           │ ← 单列：FanZoneHeader → MatchMarketCard
│  (id="fans")        │   → FanPostCard → LiveActivityCard
├─────────────────────┤
│ Season              │ ← 单列：League winner / Top scorer 交替
│  (id="season")      │   → PlayerPropsSpotlight 最后
├─────────────────────┤
│ 80px 空白           │ ← 避免被 BottomNav 遮挡
└─────────────────────┘
│ MobileBottomNav     │ fixed
```

- 用 `useIsMobile()` 判断，或更稳：JSX 内同时渲染两套但用 `hidden md:block` / `md:hidden` 切换（SSR 友好，无闪烁）
- 桌面分支保持 100% 当前代码，移动分支用新结构
- `BridgeStrip` 在移动端不渲染（已并入 MeSheet）；`AppTopBar` 在移动端不渲染

## 3. Style guide 同步

按 memory 规则，所有新组件 + 移动端首页结构都加到 `/style-guide`：
- 新增 section "Mobile shell"，展示：
  - `MobileTopBar`（固定宽度容器模拟手机）
  - `MobileBottomNav`（同上）
  - `MeSheet`（嵌入 open 状态预览）
  - `MobileLiveHero`（用一条 live fixture）
  - 一个 360×740 的 phone frame 容器，把整套移动首页 mock 嵌进去做整体预览

## 4. 不在本次范围（后续可单做）

- `/events`、`/fans`、`/me` 拆成独立路由（目前先用 anchor + sheet，验证交互后再拆）
- 通知铃铛逻辑
- 真实 haptic / pull-to-refresh
- Tablet 中间断点专属布局（先沿用 desktop 网格）

## 技术细节

- `useIsMobile` 已存在 (`src/hooks/use-mobile.tsx`, 768 断点)；为了 SSR 不闪烁，渲染时用 Tailwind `md:hidden`/`hidden md:block` 切换两套树，而不是 JS 判断
- BottomNav 占位用 `pb-20` 给主内容加 padding，避免遮挡
- MeSheet 用 shadcn `Sheet`（已在 ui 目录），side="bottom"
- 所有新组件路径放 `src/components/sports/mobile/` 便于聚类
- 颜色全部走 design tokens（`--primary`, `--accent`, `--win`, `--loss`, `--surface`），不写裸色值
- 不动 `routeTree.gen.ts`、不加新路由文件（本次仅在 `/` 加移动分支）

