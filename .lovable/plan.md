## OmenX Desktop Header 调研结果

OmenX 桌面端用的是 `EventsDesktopHeader`（`src/components/EventsDesktopHeader.tsx`），所有桌面列表页（Events / Resolved / Portfolio / Leaderboard / Insights / SEO 页）都用它。规则如下：

### 结构
```text
sticky top-0 z-50, border-b border-border/30, backdrop-blur-md
背景: linear-gradient(180deg, hsl(222 47% 8% / .98), hsl(222 47% 6% / .95))
顶部 1px 渐变高光: from-transparent via-primary/40 to-transparent

内层容器: mx-auto max-w-7xl flex justify-between px-4 lg:px-6 py-3 gap-6

[Left]  Logo(xl) + nav 按钮组（gap-1）
[Right] rightContent + Equity 胶囊 + Avatar+用户名+ChevronDown 下拉
```

### 左侧 Nav（核心规则）
- 4 个主导航：`Events / Portfolio / Leaderboard / Insights`
- 每个按钮：`rounded-lg px-3 xl:px-4 py-2 text-sm font-medium`
- 非激活：`text-muted-foreground hover:bg-primary/10 hover:text-foreground`
- 激活：`bg-primary text-primary-foreground shadow-[0_0_12px_hsl(260_60%_55%/0.3)]` + 底部一道 `-bottom-3 h-[2px] w-6` primary 下划线
- hover **必须**用 `hover:bg-primary/10`（品牌紫），禁止 `hover:bg-muted`（来自 DESIGN.md 约定）

### 右侧
- Equity 胶囊：`border border-border/50 bg-muted/30 rounded-lg px-3 xl:px-4 py-2`，金额用 `font-mono text-trading-green`
- 头像：`h-9 w-9 border-2 border-primary/50`，旁边显示用户名 + ChevronDown
- 下拉菜单分组：Rewards/Referral → Settings/Language → Transparency/Help/Discord → Sign Out
- 未登录：Language 胶囊 + `Sign In` 主按钮

### Logo
- 用 `Logo size="xl"`（h-8），来自 `@/assets/omenx-logo.svg`，右侧带 `MainnetBadge`

---

## Sports 站点标签 —— 放哪里合适

OmenX 自己的 4 个 tab 是平级的（Events / Portfolio / Leaderboard / Insights）。考虑到「Sports 是 OmenX 旗下的一个子站点」，最自然、和母站最一致的做法是：

**把 `Sports` 作为主 nav 里的第 5 个 tab，紧跟 Events 之后，并默认 active**（因为当前就在 Sports 站）。

这样：
- 视觉规则完全复用（同样的 active 紫色高亮 + 下划线）
- 用户能直接从 nav 跳回 OmenX 主站的其他 tab（Events / Portfolio / Leaderboard / Insights）
- 不引入额外的"子站点徽章"语言，避免视觉噪音

可选增强：Sports tab 文案前加一个小 ⚽ 图标（lucide `Goal` 或 `Trophy`），帮助一眼识别这是体育子站。

---

## 实施计划

### 1. 资源准备
- 复制 OmenX 的 `src/assets/omenx-logo.svg` 到本项目 `src/assets/omenx-logo.svg`
- 新建 `src/components/sports/dashboard/Logo.tsx`（精简版，不带 MainnetBadge，因为本项目没有这套体系）

### 2. 重写 `src/components/sports/dashboard/AppTopBar.tsx`
完全按 `EventsDesktopHeader` 的视觉规则实现：

```text
sticky top-0 z-50 border-b border-border/30 backdrop-blur-md
+ 顶部 1px primary 高光
+ 同款深色渐变背景

[Logo xl] ─ [Events] [Sports ←active] [Portfolio] [Leaderboard] [Insights]
                                       ........... 右侧 ...........
                                       [Equity $...] [Avatar Jeremy ▾]
```

- Events / Portfolio / Leaderboard / Insights → 外链到 OmenX 主站（用 `<a href>` 或占位 `#`，后续接真实 URL）
- Sports → 当前路由 `/`，强制 `isActive = true`
- Equity 数值先用现有 mock（Jeremy 余额）
- 下拉菜单复用 OmenX 的项目结构（Rewards、Referral、Settings、Language、Transparency、Help、Discord、Sign Out），点击先用 `console.log` 占位

### 3. 移除现有 AppTopBar 里的
- 长 search box（OmenX 桌面 header 里没有搜索）
- 5 图标 nav 簇（home / discover / wallet 等）

### 4. 不需要改动
- `src/routes/index.tsx`（AppTopBar 用法不变）
- `AppShell.tsx`（上一轮已去掉外框）

### 受影响文件
- 新增 `src/assets/omenx-logo.svg`
- 新增 `src/components/sports/dashboard/Logo.tsx`
- 重写 `src/components/sports/dashboard/AppTopBar.tsx`
