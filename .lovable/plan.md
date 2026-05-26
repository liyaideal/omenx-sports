# Stadium Neon × OmenX — 体育专区首页方案

## 定位

这个项目是 OmenX 的体育子专区，部署在 `omenx.app/sports`。所有账户类功能（钱包、设置、Portfolio、已结算历史、KYC、登录）都跳回 OmenX 主站对应页。本专区只负责两件事：**赛事/市场发现**（homepage）+ **简化交易页**（已有 EventHeader/OrderBook/TradeForm）。

风格独立（Stadium Neon），但通过双 logo 联合品牌让用户始终知道"我还在 OmenX 里"。

## TopBar：联合品牌 + 出口

固定在顶部，所有页面共用。结构（≥1024）：

```text
[OmenX] | [⚽ Stadium Neon]          Markets  Sports  Crypto     [Search]  [Wallet ↗]  [Avatar ↗]
└─ 双 logo 联合品牌 ─┘                └─ 品类导航 ─┘                └── 全部跳 OmenX ──┘
```

- 左侧：OmenX 主 logo（小，灰阶） + 细竖线分隔 + "Stadium Neon" 子品牌（霓虹）。点 OmenX logo → `omenx.app`；点 Stadium Neon → `/sports`（home）。
- 中间：品类 tabs。`Sports` 高亮（neon underline）；其它（Markets/Crypto/Politics）= `<a>` 链接到 OmenX 主站对应路径，hover 显示外链小箭头 `↗`。
- 右侧：
  - `Search` 图标（先不实现搜索逻辑，hover tooltip "Coming soon"）
  - `Wallet ↗`：直接 `<a href="https://omenx.app/wallet">`，外链箭头 + tooltip "Open in OmenX"
  - `Avatar ↗`：同上，跳 `omenx.app/account`
- ≤768：折叠成 OmenX·Stadium Neon 双 logo + 汉堡菜单（菜单里列品类 + Wallet/Account 跳转项）。

**关键设计原则**：所有跳出 sports 专区的链接统一用 `↗` 角标 + `text-muted-foreground` 处理，让"离开"是显式的而非偷偷跳走。

## Homepage 内容（赛事发现导向）

去掉 Leaderboard、Portfolio summary、个人统计这类账户类模块。结构：

```text
┌─ TopBar ─────────────────────────────────────────────┐
├─ Hero Strip ─────────────────────────────────────────┤
│ Kicker "STADIUM NEON · A SPORTS ZONE BY OMENX"       │
│ H1 "Predict the match, own the moment."              │
│ 副文案 + NeonRing 装饰                                │
│ 3 个 StatTile: 24h Sports Volume / Open Markets /    │
│                Live Now （都是全站级，不是个人）        │
├─ Featured Event ─────────────────────────────────────┤
│ EventHeader（最大牌的赛事）+ "Open market →" 跳 /sports/event/[id]  │
├─ Live Now ───────────────────────────────────────────┤
│ SectionHeader(kicker=LIVE, tabs=All/EPL/UCL/NBA)     │
│ MarketCard × 3                                       │
├─ Trending Markets ───────────────────────────────────┤
│ SectionHeader(kicker=TRENDING, action="View all →")  │
│ MarketCard × 6（2×3 网格）                            │
├─ Upcoming Fixtures ──────────────────────────────────┤
│ SectionHeader(kicker=UPCOMING)                       │
│ MatchCard × 4（点击进事件页）                          │
├─ Cross-link Strip ───────────────────────────────────┤
│ "Looking for your positions or settled bets?"        │
│ → Open Portfolio on OmenX ↗                          │
├─ Footer ─────────────────────────────────────────────┤
│ 极简：© OmenX · Sports zone · Terms ↗ · Help ↗       │
│ 隐藏的 dev 入口：/style-guide                          │
└──────────────────────────────────────────────────────┘
```

不放：Leaderboard、个人 P&L、推荐玩家、内容/编辑专题（用户选了"纯发现导向"）。

## 跳转 URL 约定

抽到 `src/lib/omenx.ts` 单一来源：

```ts
export const OMENX_BASE = "https://omenx.app";
export const omenxUrl = {
  home:      () => `${OMENX_BASE}/`,
  wallet:    () => `${OMENX_BASE}/wallet`,
  account:   () => `${OMENX_BASE}/account`,
  portfolio: () => `${OMENX_BASE}/portfolio`,
  history:   () => `${OMENX_BASE}/portfolio/history`,
  markets:   () => `${OMENX_BASE}/markets`,
  crypto:    () => `${OMENX_BASE}/crypto`,
  politics:  () => `${OMENX_BASE}/politics`,
};
```

部署形态变化时（变成子域或独立域），只改这一处 + 加 SSO/cookie 配置即可。

## 反向入口（OmenX → Sports）

文档化但不在本项目实现（在 OmenX 那侧的导航里加一个 `Sports` tab 指向 `/sports`）。Plan 里只确认 URL 契约：`/sports`、`/sports/event/[id]`、`/sports/markets`。

## 这次要做的文件


| 文件                                 | 动作                                        |
| ---------------------------------- | ----------------------------------------- |
| `src/lib/omenx.ts`                 | 新建，集中外链                                   |
| `src/components/sports/TopBar.tsx` | 新建，联合品牌 + 跳转                              |
| `src/components/sports/Footer.tsx` | 新建，极简                                     |
| `src/routes/index.tsx`             | 重写为 homepage                              |
| `src/routes/__root.tsx`            | 仅更新 `head()` 默认 title/desc 为 OmenX Sports |


mock 数据全部内联在 `index.tsx` 顶部常量里，方便后续替换为 OmenX API。

## 不在这次范围

- 真正的事件详情页 `/sports/event/[id]`（下一步）
- 搜索、筛选交互
- OmenX 那边的导航改动
- SSO / cookie / 余额数据共享（部署阶段再做）
- 移动端深度优化（保证 ≥768 不破版即可）