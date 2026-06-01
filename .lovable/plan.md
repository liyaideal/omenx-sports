## 目标

让 `/style-guide` 重新跟当前产品对齐：删掉已下线的旧组件 demo、补齐新组件 demo、把已经过时的措辞（特别是 binary / Yes-No 那套老语言）更新成当前真实规则。

## 现状盘点

通过对比 `src/components/sports/**` 与 `src/routes/style-guide.tsx` 的 import 列表：

### A. 死代码组件（仓库里有文件，但没有任何 route/组件再引用，style-guide 也没展示）
- `src/components/sports/FanPulseCard.tsx`
- `src/components/sports/HeroMarketCard.tsx`
- `src/components/sports/LiquidationBar.tsx`
- `src/components/sports/LiveTicker.tsx`
- `src/components/sports/MiniEventCard.tsx`
- `src/components/sports/PlayerSpotlightHero.tsx`
- `src/components/sports/TopMoverCard.tsx`
- `src/components/sports/TopTradersCard.tsx`
- `src/components/sports/TopBar.tsx`

### B. 已在生产页用、但 style-guide 还没收录的组件（需要补 demo）
Dashboard 层：
- `AppShell` · `AppTopBar` · `BridgeStrip` · `DayStripCalendar`
- `FanPostCard` · `FanZoneHeader` · `FansZoneEmpty` · `FollowTeamsCompact` · `FollowTeamsPanel` · `TeamPickerSheet`
- `LeagueTableCard` · `LeagueWinnerMarketCard` · `MatchMarketCard` · `UpcomingEventCard`
- `LiveActivityCard` · `PageSectionHeader` · `ShowMoreEventsButton`
- `PlayerPropsSpotlight` · `PlayerScorerCard` · `TopScorerMarketCard`
- `dashboard/PlayerSpotlightCard`（注意与根目录 `PlayerSpotlightCard` 同名，需要在 demo 标题区分）

Mobile 层：
- `MobileChrome` · `MobileEventsSection` · `MobileFansSection` · `MobileSeeMoreCard`

Live / Trade 层：
- `live/FullscreenStreamOverlay` · `live/GlobalStreamMiniPlayer`
- `trade/TradeDrawer`（目前只 demo 了 provider，没有 drawer 内部样式独立 demo；可在现有 "Sticky Trade Drawer" 章节里补一个内嵌静态预览）

Event 层：
- `event/CombinedPriceChart`（被 `EventOutcomesPanel` 复用，需要在交易详情页章节展示一次）

### C. 措辞 / 规则严重过时的章节
1. **Section 11 "Single-Market Binary"** 与 Section 12 "Multi-Market Event"：通篇说"每个 market 就是 Yes/No"，与最新的 `event = 问题、market = 选项；binary event 不再嵌套 YES/NO；多选项 event 才有 per-outcome YES/NO` 完全冲突。需要：
   - 把章节标题改成 "Binary Event (2 outcomes)" / "Multi-Outcome Event (3+ outcomes)"
   - 重写描述，引用 `mem://rules/binary-event` 的规则：binary = 两个 outcome 各一个 Trade 按钮 + 一个共享 OrderBook；multi-outcome = 每个 outcome 自带 YES/NO + 独立 OrderBook
   - 删除 "Every market is a single Yes/No binary. p(No) = 100 − p(Yes)" 这类已经不成立的总结
2. **Section 14 "Trading Language"** 里 "Yes/No literal text · color = side" 的表格行 + 列举条文需要按新规则改写（binary event 不再叫 Yes/No；只有 sideLabels alias / outcome label）。
3. **Section "Hub · Bracket"** 需要更新说明：BracketView 卡片只展示两支球队，但跳转的 `/event/<matchup>` 是 1X2（home/draw/away）三选项 market —— 这是这次刚改的规则，必须写进 demo 文案，否则别人会以为还是 binary。
4. **EventOutcomesPanel demo 文案**（已经基本正确）核对一遍，确认与代码现状匹配；如果有微调（例如 `selectedIdx + tradeSide` 文案）顺手修。
5. **DESIGN.md** §7 "Do's and Don'ts" 追加两条：
   - Don't: 把 binary event 再渲染成 per-outcome Yes/No。
   - Don't: 在 BracketView 卡片里加 Draw 行（Draw 只在详情页的 1X2 outcomes 面板出现）。

## 执行步骤

1. **删除 A 组死代码组件文件**（共 9 个）。先 `rg` 二次确认无引用后再删，避免误删。
2. **更新 Section 11/12/14 文案与示例**（不动数据来源，只改 copy + 删除已经不适用的 demo 卡片）。
3. **更新 Section "Hub · Bracket"** 说明，加一句 "卡片只展示两队；交易详情页是 1X2 三选项 market（含 Draw）"。
4. **在 style-guide 末尾新增章节**承载 B 组未收录的组件 demo。建议按归属分组而不是 22 个独立小节：
   - 新章节 `dashboard-shell`：AppShell · AppTopBar · BridgeStrip · DayStripCalendar · PageSectionHeader · ShowMoreEventsButton
   - 新章节 `dashboard-cards`：MatchMarketCard · UpcomingEventCard · LeagueTableCard · LeagueWinnerMarketCard · TopScorerMarketCard · PlayerScorerCard · PlayerPropsSpotlight · dashboard/PlayerSpotlightCard · LiveActivityCard
   - 在已有 `fans` 章节内补：FanZoneHeader · FanPostCard · FansZoneEmpty · FollowTeamsCompact · FollowTeamsPanel · TeamPickerSheet
   - 在已有 `mobile-shell` 章节内补：MobileChrome · MobileEventsSection · MobileFansSection · MobileSeeMoreCard
   - 在已有 `trade-drawer` / event 相关章节内补：TradeDrawer 内部样式预览 · CombinedPriceChart · live/FullscreenStreamOverlay · live/GlobalStreamMiniPlayer
   - `SECTIONS` 顶部目录数组同步增加新条目，让侧栏 / 跳转锚点可用
5. **DESIGN.md** §7 追加上述两条 Don't。
6. **本地校验**：`bun run` 走 typecheck/build；浏览器打开 `/style-guide` 滚一遍，确认新增 demo 都能渲染、文案与产品一致。

## 不做的事

- 不重写整个 style-guide 的视觉/排版，只补漏 + 修过时文案。
- 不动任何业务页面（`/`、`/event/$id`、`/league/$slug`、`/fans`、`/events`）的实际行为。
- 不调整 design tokens / styles.css。
