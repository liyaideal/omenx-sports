## 目标

首页（desktop home `/`）整体换成世界杯 2026 主题：
1. 中间"Live & upcoming Events"网格里展示的卡片改为 WC 比赛（含 1 个 live-stream）。
2. 左侧 Fans zone 的"add teams"模块（FanZoneHeader 推荐 chips + 已关注队伍 + 关联帖子 + Live activity feed）都换成国家队。

## 改动

### 1. `src/data/sports-mock.ts`

- `FOLLOWED_TEAMS`：`[chelsea, manCity]` → `[usa, mexico]`
- `SUGGESTED_TEAMS`：俱乐部 5 支 → 国家队 5 支：`[brazil-缺，先用 koreaRep, canada, czechia, bosnia, paraguay]`（TEAMS 里已有的 WC 国家中挑 5 个非 followed 的）
- `FAN_POST`：标题改为 `"USA back in the World Cup spotlight"`，作者/头像保留，image 换成体育场/国旗类无版权图（继续用 Unsplash）。
- `LIVE_TRADES`：8 条 mock 全部改写为 WC 比赛/国家队 outcome（USA, Mexico, KoreaRep, Canada, Paraguay 等），league 字段改 `"WC"`，eventTitle 用真实的 WC 对局，eventTeams 用 TeamKey。

### 2. `src/data/sports-markets.ts`

- 把 4 个 WC 1X2 组赛 (`wc26-mex-rsa`, `wc26-kor-cze`, `wc26-can-bih`, `wc26-usa-par`) 在 `MATCH_MARKETS` 数组里**移到最前**，让首页网格优先渲染它们。
- 给其中 **2 个**加 `isLiveStream: true` + `livePoster` + `liveScore` + `liveClock`（例如 USA-PAR 和 MEX-RSA）。
- 把原来的 `mci-ars`、`rma-bar` 上的 `isLiveStream / livePoster / liveScore / liveClock` 字段**移除**，避免它们再抢占 live 卡位（仍保留为普通赛事卡，供 EPL/La Liga hub 使用）。
- 调整这 4 场 WC 比赛的 `dayOffset`：`0 / 0 / 1 / 1`（today/today/tomorrow/tomorrow），让 DayStripCalendar 的"today"也命中它们。
- `FEATURED_MATCH`（Chelsea vs PSG）→ 改写为 WC 对局（如 USA vs Mexico 友谊性质的演示），id 保留为 `che-psg-2025-ucl`（不动以免破坏 ALL_MARKETS 注册和外部链接）— **保留 id，只改业务字段**：title/league/endsLabel/fixture/outcomes/volume/participants 全部 WC 化。

不动的地方：
- 其它 club 赛事条目继续存在（EPL/La Liga/UCL 联赛 hub 仍需要它们渲染）。
- `LEAGUE_WINNER_MARKET` / `TOP_SCORER_MARKET` 不改（不在首页主网格，且是 EPL futures）。
- 数据结构、组件、Provider 全部不动。

## 受影响页面

- `/` 首页：中间 events 网格 + 左侧 fans zone 全部 WC 化 ✅。
- `/events` 移动列表：因为共用 MATCH_MARKETS，顶部也会变成 WC（顺带受益，与"主题化"一致）。
- 联赛 hub `/league/<slug>`：不受影响（仍按 league.short 过滤）。

## 不在范围

- Mobile 首页 (`/events`) 单独主题化（共享数据后已自然 WC 化）。
- 调整 `MATCH_MARKETS` 之外的次级数据集（standings/top scorers/spotlight player 不在首页主网格里）。
- 新增/删除 sports-markets entries — 只重排序 + 字段微改。
