# OrderBook: 每侧拆 Asks / Bids 双段

把现在"左 YES / 右 NO 镜像"的 OrderBook 升级成：**每一侧都是一份完整的单边 orderbook**——上半是 Asks（红），中间一条 Last/Spread 分隔线，下半是 Bids（绿）。整体仍然左右两列（左 YES、右 NO），保留镜像对照关系。

## 视觉结构（每一列）

```text
┌─ <SIDE> BOOK ───────────── PRICE · SIZE · TOTAL ─┐
│ Asks (累计自下而上)                                │
│   58¢   3,733   28,111                            │
│   57¢   14,405  25,946                            │
│   56¢   23,432  17,735                            │
│   55¢   8,388   4,613                             │
├── Last 54¢ · Spread 1¢ ───────────────────────────┤
│ Bids (累计自上而下)                                │
│   54¢   7,448   4,022                             │
│   53¢   11,979  10,370                            │
│   52¢   14,824  18,079                            │
│   51¢   9,754   23,053                            │
└───────────────────────────────────────────────────┘
```

- Asks 用 `oklch(0.7 0.22 25)`（现 NO 色 / 红），从最高价往下排到 best ask。
- Bids 用 `oklch(0.78 0.18 155)`（绿），从 best bid 往下排到最低价。
- 中间细分隔线显示 `Last <price>¢ · Spread <n>¢`（小号 mono caption）。
- 累计深度条仍然以 size 占该 side max 的百分比铺底色，但 Asks 用红、Bids 用绿——颜色由 side 决定，不再由 YES/NO 决定。
- 表头保留 `<TEAM> YES Book` / `<TEAM> NO Book`（沿用现有 `sideLabels`）。顶栏的 MARK / SPREAD 保留。

## NO 列怎么生成

继续保留"NO = 100 − YES"的镜像约定：
- YES asks @ price p → NO bids @ (100 − p)，size 一致
- YES bids @ price p → NO asks @ (100 − p)，size 一致

这样两列读起来仍然是 mirror，但每列内部都正确分出了 ask/bid。

顶部那行 `Right side mirrors left · price = 100 − left_price` 微调成 `NO book mirrors YES · ask↔bid swap`，让用户知道镜像同时翻转了买卖方向。

## 文件改动

1. **`src/components/sports/OrderBook.tsx`**（主要改动）
   - `Row` 增加（或新建）`yesAsks` 与 `yesBids` 两组数据；保留 `yesBook` 作为旧别名继续作为 bids 使用（向后兼容），新增 `yesAsks` 默认值。
   - `Side` 拆成 `<HalfSide tone="ask" rows=... />` / `<HalfSide tone="bid" rows=... />`，外加一个 `<SpreadDivider last spread />`。
   - 右列由 yesAsks/yesBids 通过 `100 − price` + 互换 ask/bid 生成。
   - `mark` 改成可选 `last`（保留 `mark` 旧 prop 作为别名，避免破坏调用方）；`spread = bestAsk − bestBid`。

2. **`src/data/style-guide-fixtures.ts`**（如果 OrderBook fixture 来自这里）
   - 给样例补上 asks 数据（比如 best ask 29¢ 起，4 档），保证 style-guide 里能直接看到新形态。
   - 如果 fixture 不在这里就在 OrderBook 内部 default 里补。

3. **`src/routes/style-guide.tsx`**
   - 在 OrderBook 演示位说明"每侧独立 asks/bids，NO 列由 YES 镜像并交换 ask/bid 生成"。
   - 确认 binary event 和 multi-outcome event 两种示例都展开看一眼。

4. 不动 `BinaryQuestionCard` / `TradeDrawer` / `EventOutcomesPanel` 的外层布局——只是 OrderBook 内部结构升级，调用方不改 prop（除新增可选 `yesAsks`）。

## 验收

- `/event/wc26-usa-par` 展开 United States market：左 YES 列上半红色 asks、下半绿色 bids，中间显示 Last/Spread；右 NO 列对应反过来（最佳 NO ask = 100 − 最佳 YES bid）。
- `/style-guide` OrderBook section 同步更新可见。
- 不破坏现有 sideLabels（队名替换 YES/NO Book）。

