# 三处补全 — 改动计划

## 1. FanPostCard 删除 + 替代方案建议

**结论建议：先删，后面用"编辑精选 / 站内热门"补位**，不要走第三方社交 API。

第三方 post 拉取的几种选项对比：

| 来源 | 优点 | 风险 |
|---|---|---|
| Twitter/X 实时搜索 | 时效性最强 | 内容审核 + API 收费 + 账号封禁风险 |
| Reddit r/soccer 等 hot posts | 免费、API 稳定 | 仍需审核、英文为主、UGC 法律风险 |
| RSS（BBC Sport / ESPN / The Athletic 头条） | 完全合规、零审核 | 不是"球迷"内容，调性更像新闻 |
| **站内自营** — 后台编辑发"今日看点" | 100% 可控、调性贴合 Stadium Neon | 需要内容运营，但每天 1–2 条即可 |
| **站内 UGC** — 用户在 event 页发的高赞短评 | 来自交易者本身，最贴场景 | 需要先有评论功能 |

我的推荐：**这一版直接删除 `FanPostCard`**，Fans zone 只留：关注的队 + 该队精选 event（`MatchMarketCard`）+ `LiveActivityCard`。下一期再用"编辑精选"或"用户高赞短评"回填同一个槽位 —— 卡片骨架还能复用。

**改动**：
- `src/routes/index.tsx`：移除 `FanPostCard` import + `<FanPostCard {...FAN_POST} />`
- `src/components/sports/mobile/MobileFansSection.tsx`：同步移除（即使先不动 mobile 也要保留可编译）
- `src/routes/style-guide-homepage.tsx`：如有引用同步删
- `src/components/sports/dashboard/FanPostCard.tsx`：删文件
- `src/data/sports-mock.ts`：删 `FAN_POST` 常量
- `mem://glossary/...` 不动

## 2. PositionsTable — Close / Cancel 接 onClick

`PositionsTable` 暴露两个新回调；事件页 `event.$id.tsx` 把它们 wire 到现有 `positions` / `orders` state（含 seed）。

**`src/components/sports/PositionsTable.tsx`**
- props 增加：`onClosePosition?: (index: number) => void`、`onCancelOrder?: (index: number) => void`
- `PositionTable` 把 index 传给行；Close 按钮：`onClick={() => onClosePosition?.(i)}`、加 `disabled` 态当回调缺失
- `OrderTable` 同理 wire Cancel
- 点击后用 `sonner` toast 反馈（"Position closed at MM¢ · +/−X.XX USDC" / "Order cancelled"）

**`src/routes/event.$id.tsx`**
- 把 `seedPositions / seedOrders` 从 `useState` 改为 mutable state（移除 `[]` 解构里的"只读"形式）
- 实现两个 handler：
  - `handleClosePosition(i)`：从合并后的列表里删第 i 行，按 outcome / size / mark 推一条 `history` row（action `close`，pnl 来自当前 mark）
  - `handleCancelOrder(i)`：从合并后的列表里删第 i 行
- 注意：`livePositions` / `allOrders` 当前是 `positions + seedPositions` 合并的派生数组，关闭索引要正确映射回源数组。改法：让 seed 与 user-placed 合并发生在 state 初始化，之后只维护单一 `positions` / `orders` state 数组。`history` 也变 state。

## 3. LeagueWinnerMarketCard / TopScorerMarketCard 行带 outcome 跳转

**问题**：现在每行 `<Link to="/event/$id" params={{ id: market.id }}>`，5 行都跳到同一个落地页，没有预选行所代表的候选。

**改法**：保留 `<Link>`（保留可右键 / 新标签），增加 `search={{ outcome: o.id }}`。event 页 `useEffect` 已经读 `?outcome=` 并 `setSelectedIdx`，无需改 event 页。

**改动**：
- `src/components/sports/dashboard/LeagueWinnerMarketCard.tsx:30`：`<Link ... search={{ outcome: o.id }}>`
- `src/components/sports/dashboard/TopScorerMarketCard.tsx:48`：同
- `src/routes/event.$id.tsx`：`validateSearch` 当前没加，需要补 `validateSearch: (raw) => ({ outcome: typeof raw.outcome === 'string' ? raw.outcome : undefined })`，否则 TS 不让 `search={{ outcome }}` 通过。然后 `Route.useSearch()` 拿值替代当前的 `window.location.search` 读法（保留兼容旧链接的话两者都留也行；推荐切到 `useSearch`）。

## 4. /style-guide 同步

- 删除 style-guide 里所有 `FanPostCard` 用例（如有）
- Positions/Orders 表格 demo 段加一句"行内 Close / Cancel 现在会调用回调（demo 中用 toast 反馈）"
- LeagueWinnerMarketCard / TopScorerMarketCard demo 段加一句"每行跳 /event/$id?outcome=…"

## 涉及文件

- 删：`src/components/sports/dashboard/FanPostCard.tsx`
- 改：`src/routes/index.tsx`、`src/routes/event.$id.tsx`、`src/components/sports/PositionsTable.tsx`、`src/components/sports/dashboard/LeagueWinnerMarketCard.tsx`、`src/components/sports/dashboard/TopScorerMarketCard.tsx`、`src/components/sports/mobile/MobileFansSection.tsx`、`src/routes/style-guide-homepage.tsx`、`src/routes/style-guide.tsx`、`src/data/sports-mock.ts`

确认这个方向就开干。关于第 1 条 —— 你倾向直接删（推荐），还是想先保留卡片骨架、内容换成"编辑精选"占位（mock 一条来自 `@OmenX Editorial` 的卡片），下一期接 CMS？
