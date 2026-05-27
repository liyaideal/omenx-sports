## 目标

在 `/style-guide` 下新开一个 **homepage playground** 子路由，把首页的每个模块按"模块 → 所有状态"陈列出来，研发可以一眼看到同一组件在不同 props / 数据下的样子（比如 Fans Zone 在关注/未关注、Live Activity 在有/没匹配 trade 时分别长什么样）。

## 路由结构

新增 `src/routes/style-guide.homepage.tsx`（URL `/style-guide/homepage`，独立路由，不和现有 `/style-guide` 长页面挤）。在现有 `/style-guide` 的左侧导航顶部加一条 `→ Homepage Playground` 链接。

页面整体复用 style-guide 的浅 chrome（顶部 header + 侧边目录 + Section 组件），不套 `AppShell` 真实壳，避免和真首页混淆。

## 模块清单与状态矩阵

每个模块一个 `Section`，里面用小标题 + 浅卡片背景把 variant 横向/纵向并排陈列，每个 variant 上方写一行 mono caption 描述它代表什么状态。

### 1. AppTopBar
- 默认：有 equity、有 avatar
- 零余额：equity = `$0.00`
- 长用户名（截断验证）

### 2. FanZoneHeader
- 关注 0 队（CTA 状态）
- 关注 1 队
- 关注 5+ 队

### 3. Fans Zone 主体（互斥两态）
- **Empty**：`FansZoneEmpty` + editor pick（无关注时显示）
- **Filled**：`MatchMarketCard`(featured) + `FanPostCard`

### 4. MatchMarketCard
- 3-way (1X2 含 draw)
- 2-way binary
- 含 fixture / 无 fixture（如果支持）

### 5. FanPostCard
- 默认一条

### 6. LiveActivityCard
- 有关注队 + 有匹配 trade
- 有关注队 + 无匹配 trade（"following filter empty"）
- 无关注队（显示全部 trade）
- 完全没有 trade（空态）

### 7. SectionHeader
- `live=true`，无 stats
- `live=false`，无 stats
- 带 stats（保留 prop 兼容性演示）
- 自定义 `right` slot

### 8. DayStripCalendar
- 未选中（all）
- 选中今天 / 明天 / 昨天
- 部分日期 count = 0
- 全部日期 count = 0（极端态）

### 9. EventMarketTileCard
- 3-way 1X2，含 fixture，无 badge
- Binary YES/NO
- HOT 徽标（participants ≥ 2000）
- TRENDING 徽标（|delta| ≥ 0.05）
- 大 delta 上行 + 大 delta 下行（颜色验证）

### 10. ShowMoreEventsButton
- 折叠（`Show 5 more`）
- 展开（`Show less`）

### 11. 空事件态
- "No events scheduled for tomorrow" 占位卡

### 12. LeagueWinnerMarketCard
- 4 行（EPL）
- 2 行（短列表）
- 全正 delta / 全负 delta

### 13. TopScorerMarketCard
- 含球员照片
- 缺照片 fallback（initials）

### 14. PlayerPropsSpotlight
- 1 个球员（无翻页箭头）
- 3 个球员（含翻页）
- 球员 props 全 YES 重 / 全 NO 重

### 15. OmenX bridge strip
- 有 open + 有 today P&L + 有 to claim（当前真实态）
- 有 open + 今日打平
- 0 open（"no calls yet"）
- 有 open，无 to claim
- 大额 toClaim（位数验证）

## Mock 数据策略

新建 `src/data/style-guide-fixtures.ts`，集中存放 playground 专用 mock，不污染真实 `sports-markets.ts` / `sports-mock.ts`：
- 从真实数据 import 一份基础对象，用 `structuredClone` + overrides 派生出 HOT / TRENDING / 全正 / 全负 等变体
- `LIVE_TRADES_EMPTY = []`、`LIVE_TRADES_NO_MATCH = [...]`（trade 里都不含关注队）等几组 trades 列表
- `ACCOUNT_STATS_ZERO`、`ACCOUNT_STATS_NO_CLAIM` 等账户状态变体
- `BRIDGE_STRIP` 抽成独立 presentational 组件（从 `index.tsx` 提取，见下）便于复用

## 一处小重构

当前 `index.tsx` 里底部 bridge strip 是 inline JSX，没法在 playground 复用。计划：
- 抽成 `src/components/sports/dashboard/BridgeStrip.tsx`，props 为 `{ openPositions, pnlToday, toClaim, portfolioHref }`
- `index.tsx` 改为引用该组件
- playground 直接用不同 props 实例化多份

SectionHeader 已经是从 index.tsx 内部 helper —— 同步抽到 `src/components/sports/dashboard/PageSectionHeader.tsx`（名字避免和现有 `SectionHeader` 冲突），让 playground 也能 import。

## 页面布局

```
/style-guide/homepage
├─ Sticky 顶部：← Back to Style Guide · Homepage Playground
├─ 左侧目录（锚点跳到每个模块）
└─ 主区：每个模块一个 Section
     ├─ 模块名 + 一句话用途
     ├─ Variant grid（每个 variant 一个 caption + 渲染框）
     └─ 用半透明虚线框 + mono caption 标注 state
```

每个 variant 框统一外观：`rounded-xl border border-dashed border-border/50 bg-background/40 p-4`，上方一行 `font-mono text-[10px] uppercase tracking-widest text-muted-foreground` 写状态名（如 `following = 0`、`hot · participants 2400`）。

## 不动的地方

- 真实 `/` 首页逻辑、视觉、数据不变
- `/style-guide` 原页面保留，只在导航顶部加一条跳转链接
- `sports-markets.ts` / `sports-mock.ts` 内容不动（只新增 fixtures 文件）

## 验收清单

- 访问 `/style-guide/homepage` 能看到所有 15 个模块
- 每个 variant 都能独立渲染（不依赖用户交互）
- Fans Zone 的 empty / filled 两态都在同一页可见
- Live Activity 4 种数据态都可见
- Bridge strip 5 种数据态都可见
- 不影响 `/` 真实首页

