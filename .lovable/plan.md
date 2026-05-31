## 背景

当前抽屉对所有市场用同一套逻辑：渲染所有 outcome 作为一排芯片，选中一个直接喂给 `TradeForm`。

- Binary 市场（LIV vs NEW、Yes/No 问题）：两个 outcome 互斥，LIV YES = NEW NO，本身就是一个市场 → 当前展示**正确**，无需改动。
- 多 outcome 市场（如 RMA / DRAW / BAR 1X2 三选）：实际上是**多个独立的二元子市场**，每个 outcome 都该有自己的 YES/NO。当前实现只能"买 Draw YES"，没法"买 Draw NO"，与 Polymarket 行为不一致。

## 目标

参考用户给的 Polymarket 截图，把抽屉做成两层选择：

```text
┌─ Header（不变）─────────────────────────┐
│ EPL · 23 AUG 4:30PM           [X]      │
│ Liverpool to beat Newcastle             │
│ Vol $1.18M · 2,604 traders  Full market│
├─ PICK OUTCOME ─────────────────────────┤
│ [ RMA 41¢ ]  [▣ DRAW 23¢ ]  [ BAR 36¢ ] │  ← 选哪个子市场
├─ PICK SIDE（仅多 outcome 时出现）──────┤
│ [▣ YES 23¢ ]   [  NO 77¢  ]            │  ← 选 YES / NO
├─ TradeForm ────────────────────────────│
│ Buy DRAW YES @ 23¢ …                    │
└─────────────────────────────────────────┘
```

## 改动范围

只改 `src/components/sports/trade/TradeDrawer.tsx`。数据结构、Provider、调用方都不动。

### 判定规则

- `market.outcomes.length === 2` **且** 两个 label 是 `YES`/`NO` → 走旧的"二选一即 YES/NO"分支，不显示第二层。
- `market.outcomes.length === 2` 且是两支队伍（LIV/NEW 这种）→ 同样不显示第二层（选 LIV 就是 LIV YES，等价于 NEW NO，符合用户原话"对应 yes 和 no"）。
- `market.outcomes.length >= 3` → 第一层选 outcome，**新增第二层** YES/NO 切换。

### YES/NO 价格

- YES 价 = 该 outcome 的 `price`（如 Draw 23¢）。
- NO 价 = `100 - YES`（23¢ → 77¢）。NO 没有真实订单簿，按互补价显示足够 mock。

### TradeForm 喂数

- 多选场景下：
  - `outcome` = 当前选中的 YES/NO（驱动主色：YES 走 primary，NO 走 neon）。
  - `outcomeLabel` = `${outcomeName} ${YES|NO}`，例如 `"Draw YES"`，CTA 自然显示 `Buy Draw YES @ 23¢`。
  - `price` = 上面算出的 YES/NO 价格。
- 二选场景下：维持现有逻辑（首 outcome → yes，第二 → no；label 用队名/Yes/No）。

### 第二层 UI

复用第一层芯片样式，但只有两格、固定 grid-cols-2；选中态同现有"foreground 反白"。`<key>` 加入 yes/no 维度，确保切换时 TradeForm 重新初始化（清零 margin/leverage）。

### Provider 是否要扩展？

不需要。YES/NO 选择是抽屉内部的瞬态 UI 状态，不参与全局 `TradeSelection`。调用方只传 `marketId` + 可选 `outcomeId`，默认 YES 即可。如果以后想从卡片直接打开"Draw NO"，再加 `side?: "yes"|"no"` 字段。

## 技术细节

- 在 `TradeDrawer` 内 `useState<"yes"|"no">("yes")`，并在 `selected.id` 变化时 `useEffect` 重置为 `"yes"`。
- `isYesNoMarket` 现有判定保留；新增 `needsSideToggle = market.outcomes.length >= 3`。
- 价格换算用整数：`yesCents = Math.round(o.price*100)`，`noCents = 100 - yesCents`。
- 不改任何 sports-markets / Provider / 调用点 / 样式 token。

## 不在范围

- 真实 NO 订单簿（mock 站用互补价就够）。
- 修改卡片侧的 openTrade 调用签名。
- 改 `/event/$id` 全页交易面板（那是另一个页面，不在本次抽屉整理内）。
