
## 问题诊断

底部 tab 已经常驻 Home / Events / Fans / Me，但目前三个页面内容大量重复：

| 模块 | Home (mobile) | Events | Fans |
|---|---|---|---|
| MobileLiveHero（直播） | ✓ | ✓ | – |
| Today's events 3 张卡 | ✓ | ✓（全量） | – |
| FanZoneHeader | ✓（teaser） | – | ✓ |
| Season markets / Spotlight | ✓ | – | – |
| Live trades / Fan post | – | – | ✓ |

Home 几乎是 Events + Fans 的拼接预览，意义不大。

## 重新分工原则

底部 nav 已经是跳转入口，**home 不再需要做 "目录页"**。三个 tab 各自承担一类完整内容，零重叠：

- **Events** = 所有"市场/赛事"相关（即时 + 未来）
- **Fans** = 所有"社交/关注"相关
- **Home** = 个人首屏（账户 + 一句话 live 状态 + 一个明显 CTA），短小精悍

## 新内容结构（mobile）

### `/` Home — 个人化首屏（短）
1. 顶部问候 + 头像：`Hi, Jeremy` + 账户 chip（available equity）
2. **Account snapshot 卡**（移动版 BridgeStrip）：Open positions / P&L today / To claim → 链接到 OmenX portfolio
3. **Live now 状态条**：如果当前有直播比赛，显示极简一行 "🔴 2 matches live · Tap to watch" → 整条点击跳 `/events`（不再渲染完整 LiveHero）
4. **Player Props Spotlight**（保留，作为"今日推荐"，Events 移除该模块）
5. 底部留白 + onboarding hint

→ 删除：MobileLiveHero、Today's events 3 张卡、FanZoneHeader teaser、Season markets、所有 SeeMore 卡

### `/events` Events — 完整市场页
1. **MobileLiveHero**（直播比赛大卡，唯一出现位置）
2. **Upcoming 区**：DayStripCalendar + 完整事件卡列表（当前已有）
3. **新增 Season 区**：LeagueWinnerMarketCard + TopScorerMarketCard（从 home 搬过来），作为 "Season futures" 子段

→ Spotlight 不放这里（避免与 home 重叠）

### `/fans` Fans — 完整社交页（基本保留）
1. FanZoneHeader（follow/suggested）
2. FOLLOWED 时：MatchMarketCard（关注队的下一场）+ FanPostCard
3. LiveActivityCard（实时 trades）
4. 未关注时：FansZoneEmpty

→ 这页基本不动，只需要确认无重复

## 文件改动

**编辑：**
- `src/routes/index.tsx` — 移动端 layout 完全重写为新 Home（保留 desktop 不动）
- `src/components/sports/mobile/MobileEventsSection.tsx` — 在 Upcoming 之后追加 "Season futures" 段（LeagueWinner + TopScorer）

**新建：**
- `src/components/sports/mobile/MobileAccountSnapshot.tsx` — 移动版 BridgeStrip（3 个数字 + 跳 portfolio）
- `src/components/sports/mobile/MobileLiveStatusBar.tsx` — 一行 live 状态条，点击跳 /events
- `src/components/sports/mobile/MobileHomeHero.tsx` — 顶部问候 + equity chip

**不动：**
- `MobileFansSection.tsx`、`/fans` 路由、`MobileBottomNav`、`MobileChrome`、desktop 全部布局、数据层、style-guide 之外的组件

## Style-guide 同步

按 core memory 规则，新建的 3 个 mobile-only 组件（HomeHero / AccountSnapshot / LiveStatusBar）需要在 `/style-guide` 加 demo section "Mobile Home modules"，并更新 Events demo 描述（增加 Season futures 段）。

## 技术要点

- 所有 mobile 模块用 `MobileChrome` 包裹（已有），保证 top bar / bottom nav / safe-area 一致
- Live 状态条数据源：复用 `MATCH_MARKETS.filter(m => m.isLiveStream)`，0 场时不渲染
- Account snapshot 三数字直接读 `ACCOUNT_STATS`，跳转用 `omenxUrl.portfolio()`（外链）
- 不动 SSR / route 配置；只改 component 内容
