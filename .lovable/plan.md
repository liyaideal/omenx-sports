# Positions / Orders / History 三项交互补全 — 计划

## 1. 三个 tab 的默认 seed 数据按"最新逻辑"重做

**问题**：当前 Market 列对 3-way 事件直接显示 `outcomeLabel`（"CAN" / "Draw"），只用绿/红色区分 yes/no；但产品现在的语义是"每个 outcome 都是独立 binary 子市场，下注语言是 `<队伍简写> YES/NO`"（见你发的第 2 张图：`CAN YES` 绿色胶囊）。binary 2-outcome 事件则不带 YES/NO 后缀（outcome 本身就是 side）。

**改动**：
- `PositionRowData` / `OrderRowData` / `HistoryRowData` 新增字段 `eventShape: "binary" | "multi"`（默认 `"binary"` 向后兼容）。
- `OutcomeTag` 在 `eventShape === "multi"` 时渲染 `${LABEL.toUpperCase()} YES|NO`，并按截图 2 调整为：font-mono、tracking-widest、绿/红双层（label 实色 + YES/NO 半透明），padding 收紧。binary 事件仍只显示 team 名/Yes/No 单词。
- `event.$id.tsx::buildSeed`：根据 `active.outcomes.length === 2` 给每行打 `eventShape`；3-way seed 改成更能展示新形态的组合：
  - Positions：row 1 = `CAN YES`（long YES, 带 TP/SL 见 §3）；row 2 = `BIH NO`（long NO）
  - Open Orders：row 1 = `CAN YES` limit 挂单；row 2 = `DRAW NO` limit 挂单
  - History：穿插 `DRAW YES fill` / `BIH NO close +pnl` / `CAN YES close −pnl`
- `handlePlaceOrder` / `handleClosePosition` 在生成新行时同样写入 `eventShape`。

## 2. Close / Cancel 改成二次确认

**改动**：用 shadcn `AlertDialog`（已在 `src/components/ui/alert-dialog.tsx`）包裹两个按钮，弹窗显示该行的上下文摘要后再确认。

- **Close confirmation**（每行 Close 按钮）
  - Title：`Close position?`
  - Body（mono 小卡）：Event 标题 · Market 胶囊 · `Size 90` · `Entry 29¢ → Mark 27.7¢` · `Est. PnL +0.36 USDC (+1.3%)`（用当前 jitter 后的 mark）
  - Footer：`Keep open`（次要）/ `Close at 27.7¢`（主操作，PnL 负时主操作按钮换 loss 调，正时换 win 调）
  - 确认后才调用现有 `onClosePosition(i)`。

- **Cancel confirmation**（每行 Cancel 按钮）
  - Title：`Cancel this order?`
  - Body：Event · Market 胶囊 · `Limit 55¢` · `Size 200` · `Filled 40%`（已部分成交时副标提醒"已成交部分不会回滚"）
  - Footer：`Keep order` / `Cancel order`（loss 调）
  - 确认后才调用 `onCancelOrder(i)`。

实现位置在 `PositionsTable.tsx` 内：每行的 Close/Cancel 改成 `<AlertDialogTrigger>`，行级 props 不变（仍由 `event.$id.tsx` 传 `onClosePosition` / `onCancelOrder`）。

## 3. TP/SL 展示 + 调整

**现状**：`TradeForm` 收集 `tp`/`sl` 进入 `PlacedOrder`，但 `handlePlaceOrder` 直接丢掉这两个字段，position 行没存、没展示，更不能改。

**改动**：

### 数据层
- `PositionRowData` 新增 `tp: number | null`、`sl: number | null`。
- `event.$id.tsx::handlePlaceOrder` 把 `order.tp` / `order.sl` 写入 position 行。
- `buildSeed` 至少给第 1 行预置 `tp: 40, sl: 20`（YES 方向：TP > entry, SL < entry > liq），第 2 行 `tp: null, sl: null`，让两种状态都可见。

### 展示
- Positions 表新增列 **`TP / SL`**，位于 `Liq` 与 `PnL` 之间。单元格：
  - 已设 → 两行小标签：`TP 40¢`（win 调）/ `SL 20¢`（loss 调），右侧加 pencil icon
  - 未设 → 灰色虚框小按钮 `+ TP/SL`
  - 整个单元格 clickable，点击打开调整 dialog
- Stage / 行下方不加任何额外 UI；列就是入口。

### 调整
- 新组件 `EditTpslDialog`（在 `PositionsTable.tsx` 内或同目录新文件 `EditTpslDialog.tsx`）：用 shadcn `Dialog`。
  - Header：`Adjust TP / SL` + 副标 `<Market pill> · entry 29¢ · mark 27.7¢ · liq 12¢`
  - 两个输入框 `TP (¢)` / `SL (¢)`，校验规则**复用** `TradeForm` 的逻辑（抽到 `lib/tpsl.ts`：`validateTpSl({ side, entry, liq, leverage, tp, sl })`，TradeForm 与 dialog 共用，避免两套规则飘移）
  - 实时 "If TP hits / If SL hits" PnL 预览（按 `margin × leverage × (target − entry)/100 × sign − fee` 与 TradeForm 一致）
  - Footer：`Remove`（两值清空保存）/ `Cancel` / `Save`
- 新回调 `onUpdateTpsl?: (index: number, next: { tp: number | null; sl: number | null }) => void`，由 `PositionsTable` 传给 `EditTpslDialog`。
- `event.$id.tsx::handleUpdateTpsl(idx, next)` 直接 setState；用 toast 反馈 `TP/SL updated` 或 `TP/SL removed`。

## 4. /style-guide 同步（项目规则：playground 跟产品同步）

- Positions 表新 Variant：
  - `with TP/SL set + edit dialog launcher`
  - `Multi-outcome row showing CAN YES / BIH NO pills`
- Confirm dialog Variant：单独示意 Close 确认弹窗 open 态（直接渲染 `AlertDialog` defaultOpen=true 进沙盒卡片里）
- 更新 Production Inventory `PositionsTable` 描述："Positions / Orders / History · TP/SL 列可点编辑 · Close/Cancel 二次确认"

## 涉及文件

- 改：`src/components/sports/PositionsTable.tsx`（新列 + 两个确认 dialog + Edit TP/SL dialog + 新回调）
- 改：`src/routes/event.$id.tsx`（seed 带 eventShape & tp/sl · handlePlaceOrder 写入 tp/sl · 新 handleUpdateTpsl · stamp eventShape）
- 新：`src/lib/tpsl.ts`（共享 TP/SL 校验 + PnL 预览，TradeForm 也切过来调用）
- 改：`src/components/sports/TradeForm.tsx`（改成调用 `validateTpSl` / `previewTpSlPnl`，行为不变）
- 改：`src/routes/style-guide.tsx`（新增 Variant + Inventory 描述更新）

## 备注

- 不动 mobile（按你之前说"mobile 后续重新规划"）
- 暂不接 backend，所有改动都在前端 state 内闭环；TODO 注释标出真实下单/改单接口插入点
