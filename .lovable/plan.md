## 目标

`/promo/world-cup?tab=combo` 的 MatchCard 当前只把 SPREAD/TOTAL 当作底部的 "REFERENCE" 文本展示。改为 Polymarket 风格：三个分区（Moneyline / Spread / Total）每行都是可选 combo 腿，且 Spread/Total 提供多档盘口可切换。同场多腿允许，受 4 腿上限约束。

## 改动概览

### 1. 数据模型 (`src/data/world-cup-carnival.ts`)

- 把 `SPREAD` / `TOTAL` 改为 `combo_eligible: true`、移除 `displayOnly`。
- 每个 SPREAD/TOTAL 市场新增 `lines: WCLine[]`，每档线包含 `line` 数值与对应两侧 `outcomes`（如 `Over 2.5 / Under 2.5`，或 `BRA -1.5 / JPN +1.5`），各自带 `probability`；保留一个 `defaultLineIndex` 字段。
- helper 重写：
  - `total(lines: Array<{ line: number; over: number }>)` 生成完整一组档线。
  - `spread(homeCode, awayCode, lines: Array<{ line: number; homeProb: number }>)` 生成对应两侧。
- 给所有 fixture（GROUP / R32 / R16 / QF / SF / FINAL）补上一组合理的 spread 与 total 档线（mock 数据，3–5 档，围绕原有那条线扩展，e.g. `2.5` → `[0.5, 1.5, 2.5, 3.5, 4.5]`）。
- 新增 `MarketId` 字符串（`<matchId>:ML` / `:SP` / `:TT`），用于唯一标识每个市场。
- 新增 `marketId` 字段到 `WCMarket`。

### 2. Combo 状态机 (`src/components/sports/promo/combo/useComboState.ts`)

- `SelectedLeg` 增加 `marketId`、`marketType`（`MONEYLINE | SPREAD | TOTAL`）、`lineLabel?`（如 "O 2.5" / "BRA -1.5"）。
- 唯一性 key 从 `matchId` 改为 `marketId`：同一 `marketId` 内再次点击新选项 = 替换；不同 marketId（即便同场）允许并存，直到 4 腿上限。
- `removeLeg(matchId)` 改为 `removeLegByMarket(marketId)`。
- 提交时同场多腿照旧汇入相同 ticket，赔率仍是各腿概率之积的倒数。
- `mockApi` 调用签名保持不变（依旧传 `{ matchId, outcomeId, probability }` 列表，新增 `marketId`）。

### 3. MatchCard 重构 (`ComboChallengeSection.tsx`)

```text
┌ Header (stage chip · kickoff · home vs away · locked badge) ┐
├ Moneyline ─────────────────────────── (3 buttons grid)     ┤
├ Spread     line slider [0.5 1.5 ●1.5 2.5 3.5]              ┤
│             (2 buttons, HOME -line / AWAY +line)            ┤
├ Total      line slider [0.5 1.5 ●2.5 3.5 4.5]              ┤
│             (2 buttons, Over / Under)                       ┤
└────────────────────────────────────────────────────────────┘
```

- 新增子组件 `MarketSection`：接收 `title`、`market`、`selectedLegs`、`onSelect`；负责渲染小标题行和按钮组。
- 新增 `LineStepper`：横向的档线选择条（左右箭头 + 当前档高亮，仿截图）。`useState` 存储该卡片该市场当前 `lineIndex`；切换时不影响已选中的腿，但只渲染当前档对应的两个按钮。
- 已选中腿的按钮高亮（金色边框）与现有 Moneyline 行一致。
- 三个分区都用同一个 `OutcomeButton` 样式（label + 百分比），Spread/Total 的 label 直接用 outcome.label（如 `Over 2.5`）。
- 移除底部 `REFERENCE` 行与 `DisplayOnlyChip` 组件。

### 4. Builder 侧（右栏） 

- `LegSlot` 显示 `teamLabel`；为 Spread/Total 腿在副标题处增加 `marketType · lineLabel`（如 `TOTAL · Over 2.5`），让用户区分多腿。
- 4 腿上限提示文案不变。

### 5. Style-guide 同步

`src/routes/style-guide.tsx` 的 `world-cup-carnival` 区块已直接嵌入 `ComboChallengeSection`，无需额外改动；只需手动验证一下新 MatchCard 渲染正常。

## 技术细节

- `combo_eligible` 字段保留但全部为 true；后续若要黑名单某些市场仍可用。
- `DisplayOnlyChip` 组件删除，相应 import 一起清。
- 概率合法性：spread/total 两侧 `p_over + p_under = 1`，spread 同理（mock 数据手工对齐）。
- 同场多腿赔率不再"独立"，但作为 demo 数据展示，先按概率乘积处理；不增加 PRD 之外的相关性约束。
- 没有跨腿数学验证（mock）；TicketStatusList 的 seed 数据保持仅用 MONEYLINE 腿，无需迁移。

## 不在范围内

- 不改动 `mockApi.ts` 的赔率/quote 算法。
- 不动 Filter、Hero、TicketStatusList、提交/requote 流程。
- 不引入新的图标或字体。
