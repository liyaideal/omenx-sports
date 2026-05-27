目标：把首页所有"看起来能点其实没反应"的元素都接上交互。

---

### 1. AppTopBar 头像 → 复制 OmenX 的下拉菜单

按 OmenX `EventsDesktopHeader.tsx` 的下拉结构 1:1 搬过来，把里面的 `navigate("/xxx")` 全部换成跳 OmenX 绝对 URL。

- 触发：头像 + 名字 + ChevronDown 包成 `<DropdownMenuTrigger asChild>`
- 菜单项（与 OmenX 顺序一致）：
  - Rewards / Referral → `omenxUrl.account()`
  - Settings → `${OMENX_BASE}/settings`（新加 `omenxUrl.settings()`）
  - Language 子菜单：EN/ES/FR/DE/PT/JA（本地 `useState`，纯前端切换）
  - Transparency Audit → `${OMENX_BASE}/settings/transparency`
  - Help & Support → 开新窗 `https://omenx-helpcenter.lovable.app`
  - Join Discord → 开新窗 `https://discord.gg/qXssm2crf9`
  - Sign Out → 跳 `${OMENX_BASE}/`（不在子站做 supabase signOut）

`shadcn/ui` 的 `dropdown-menu` 已在项目里。

### 2. FanZoneHeader 的 "N teams / Add team" → 弹窗管理关注

- 按钮包成 `<DialogTrigger>`，打开 `<Dialog>`
- 弹窗内容复用 `FansZoneEmpty` 里"Follow your team"那段 grid（crest + Check/Plus 角标 + Save preferences）
- 抽出新组件 `FollowTeamsPanel.tsx`，`FansZoneEmpty` 和弹窗共用
  - props：`suggested: TeamLite[]`、`initialFollowed?: Set<string>`、`onSave(names)`
- 当前没有持久化层，`onSave` 只 `console.log` + 关闭弹窗（与现有 "Save preferences" 行为一致）
- 弹窗标题："Manage teams you follow"

### 3. MatchMarketCard 右上角 More (⋯) → 下拉菜单

- 把 More 按钮换成 `<DropdownMenuTrigger asChild>`
- 菜单项：
  - **Share market** → `navigator.clipboard.writeText(market.tradeHref 绝对 URL)` + sonner toast "Link copied"
  - **View on Polymarket** → `<a href={market.tradeHref}>`（带 ExternalLink 图标）
- `onClick={(e) => e.stopPropagation()}`，避免触发卡片内部 `<a>` 的跳转

### 4. PlayerPropsSpotlight → 多 event 轮播

**数据：** `data/sports-markets.ts` 把 `SPOTLIGHT: PlayerSpotlight` 改成 `SPOTLIGHTS: PlayerSpotlight[]`，保留原球员为第一个，再加 2 个 mock：

- 一个球队主题，比如"切尔西本赛季三冠王概率"，`firstName`/`lastName` 用队名拆分，`handle` 用 team short，`photo` 用队徽（在圆形 portrait 容器里居中显示），`position` 写 "Premier League · Club"
- 一个小组赛冠军主题，比如"Group F Winner"，`photo` 用奖杯/league badge，`position` 写 "World Cup 2026 · Group F"
- `props` 字段每个 event 自己一组（球队的可以是 "Win the league / Top 4 / Champions League qualification"；小组冠军可以是 4 个国家队的 to-win 价格）

类型 `PlayerSpotlight` 字段宽松，复用即可，不需要新建类型；命名上 `position` 当作"副标题"使用。

**组件：** `PlayerPropsSpotlight` 改签名 `{ players: PlayerSpotlight[] }`

- 内部 `useState<number>(0)` 维护当前 index
- ← / → 循环切换（取模），切换时图片 / 姓名 / position / props 列表同步更新
- 去掉左上角 X 按钮
- 右上角原来的 ↗ "Open" 改成 **Share** 按钮（Share2 图标）：点击复制当前 event 的 tradeHref 到剪贴板 + sonner toast "Link copied"

**调用方：** `index.tsx` 传 `players={SPOTLIGHTS}`；`style-guide.tsx` 同步成 `players={[SPOTLIGHTS[0]]}` 或整组。

---

### 涉及文件

- `src/lib/omenx.ts`（加 `settings`、`transparency` 2 个 URL）
- `src/components/sports/dashboard/AppTopBar.tsx`（头像换 DropdownMenu）
- `src/components/sports/dashboard/FanZoneHeader.tsx`（按钮换 DialogTrigger）
- `src/components/sports/dashboard/FollowTeamsPanel.tsx`（新建）
- `src/components/sports/dashboard/FansZoneEmpty.tsx`（改用 FollowTeamsPanel）
- `src/components/sports/dashboard/MatchMarketCard.tsx`（More 换 DropdownMenu + 阻止冒泡）
- `src/components/sports/dashboard/PlayerPropsSpotlight.tsx`（多 event 轮播 + Share + 去 X）
- `src/data/sports-markets.ts`（SPOTLIGHT → SPOTLIGHTS 数组，+2 个 mock）
- `src/routes/index.tsx`（传 players 数组、FanZoneHeader 接 suggested）
- `src/routes/style-guide.tsx`（同步 SPOTLIGHT 用法）

不引入新依赖。所有交互都在前端层，不动业务逻辑、不动路由表。