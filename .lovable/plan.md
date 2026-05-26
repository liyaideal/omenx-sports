## 目标

将 sports/markets 风格指南里的所有组件对齐 OmenX 真实交易模型：

- 不存在 long/short；所有 market 都是 Yes/No 二元（底层是 Buy Yes long / Buy No long 两条独立多头）。
- 队伍对战 = 同一个 Yes/No market，通过 `sideLabels: { yes, no }` 给两端起队名别名。
- 价格永远互补：`p(No) = 100 − p(Yes)`，`delta24h(No) = −delta24h(Yes)`。
- 颜色按 outcome（Yes=绿，No=红），不按 side（long/short）。

## 决策（已确认）

- Q1（OrderBook）：**A** — 保留双栏 YES Book / NO Book 视图，但加一行 hint："NO book 是 YES book 的镜像（price = 100 − yes_price）"。
- Q2（MarketCard delta）：**强制单一真相** — props 只接收 `yesDelta24h`，No 端 UI 自动渲染 `-yesDelta24h`。

## 文件改动

### 1. `src/components/sports/MarketCard.tsx`
- Props 改为：`{ yes: { team, probability, delta24h }, no: { team } }`（删除 no.probability / no.delta24h）。
- 内部计算 `noProbability = 100 − yes.probability`，`noDelta = −yes.delta24h`。
- 两侧 OutcomePill 沿用绿/红 outcome 配色。

### 2. `src/components/sports/SentimentCard.tsx`
- `longNotional` / `shortNotional` → `yesNotional` / `noNotional`。
- 文案 "Long / Short" → "Yes / No"。
- RatioBar 标签同步改为 "Yes $X / No $Y"。

### 3. `src/components/sports/PositionsTable.tsx`
- 删除 `side: "long" | "short"` 列与 SideTag。
- 新增 / 复用 "Outcome" 列，渲染 Yes / No 或 team 别名，颜色按 outcome（绿/红）。
- entry / mark / PnL 计算保持，仅展示口径调整。

### 4. `src/components/sports/TradeForm.tsx`
- 主按钮文案：`Long Real Madrid 10×` → `Buy Real Madrid 10×`（无别名时回退 `Buy YES` / `Buy NO`）。
- 移除任何 long/short 切换；仅保留 Yes / No 选择。

### 5. `src/components/sports/LiquidationBar.tsx`
- 描述文案从 "yes → long; no → short" 改为纯 Yes/No 说明。

### 6. `src/components/sports/OrderBook.tsx`
- 保留 YES Book / NO Book 双栏布局（决策 A）。
- 顶部加一行小字 hint：`NO book mirrors YES book · price = 100 − yes_price`。
- 内部用单一 YES book 数据源，NO 栏由镜像计算渲染，保证两侧一致。

### 7. `src/components/sports/StatTile.tsx`（及调用方）
- 副标 "2 long · 1 short" → "2 Yes · 1 No"。

### 8. `src/components/sports/Formulas.tsx`
- 删除 "PnL (short YES)" 公式。
- 只保留：`PnL = (mark − entry) / 100 × notional`，并注明 No 端价格 = 100 − Yes 价格自动镜像。

### 9. `src/routes/style-guide.tsx`
- 更新 MarketCard demo 数据：只传 yes.probability + yes.delta24h。
- 更新所有受影响组件 demo（SentimentCard / PositionsTable / OrderBook / StatTile / Formulas / TradeForm / LiquidationBar）。
- 顶部说明段落改写为："All markets are Yes/No binaries. Team-vs-team events alias the two sides via `sideLabels: { yes, no }`. Prices and 24h deltas are always mirrored: `p(No) = 100 − p(Yes)`."

## 不动的部分

- TeamCrest / OutcomePill / OutcomeSelector 的视觉规范（abbr + tooltip + 真实 logo 方形 object-contain）保持上一轮成果。
- 不引入新依赖、不改动路由、不动后端。

## 验收

- style-guide 全页搜索不再出现 `long` / `short` 作为方向语义（保留 "shortName" 等无关词）。
- MarketCard 两端概率相加恒为 100，delta 互为相反数。
- OrderBook 双栏价格满足 `yes + no = 100`。
- PositionsTable 不再有 side 列；Outcome 颜色 Yes=绿 / No=红。
