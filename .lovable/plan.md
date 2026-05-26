## 问题

`Arsenal vs Spurs` 是一个二元 market，`sideLabels: { yes: "Arsenal", no: "Spurs" }`。Arsenal 就是 YES 这一侧本身，不是"YES 上的 Arsenal 仓位"。当前 `PositionsTable` 的 `OutcomeTag` 同时渲染了 `YES` 徽章 + `Arsenal` 文本，对用户来说是冗余的重复信息。

## 规则（与 OmenX 一致）

- **有别名（团队赛/有 sideLabels）**：只显示别名（如 `Arsenal`、`Lakers`），用绿/红颜色承担 yes/no 语义。
- **无别名（纯中性市场，如 "Will it rain?"）**：显示 `Yes` / `No` 文本，配绿/红色。
- 列名保持 `Outcome`，不再叫 Side。

## 改动

### 1. `src/components/sports/PositionsTable.tsx`

- 数据模型同时保留 `outcome: "yes" | "no"`（决定颜色）和 `outcomeLabel: string`（决定显示文本）。
- `OutcomeTag` 简化为：
  - 只渲染一段文本 = `outcomeLabel`（如果与 "Yes"/"No" 大小写无关相同则显示首字母大写的 `Yes` / `No`）。
  - 颜色：`outcome === "yes"` → 绿；`"no"` → 红。
  - 不再渲染 `YES` / `NO` 前缀徽章。
- 默认 demo 数据保留现有的 `Arsenal` / `Lakers` / `Liverpool` / `Barcelona` / `Man City` 等别名；额外加 1 条纯中性 market 行（如 `Will it rain at kickoff? → Yes`）来展示无别名场景，方便在 style-guide 验证两种状态都正确。

### 2. `src/components/sports/TradeForm.tsx`（顺手）

CTA 文案目前是 `Buy {outcomeLabel} @ 62¢`。当 `outcomeLabel` 就是别名（Arsenal / Real Madrid）时，符合预期；当上层没传别名直接传了 `YES` / `NO` 时也合理。**不改动逻辑**，仅在注释里补一句"label 应优先传别名；只有无 sideLabels 时才传 Yes/No"。

### 3. `src/routes/style-guide.tsx`

`PositionsTable` 的 demo 数据：把 `Lakers vs Celtics` 那一行的 `outcomeLabel` 从 `Lakers` 改成更直观的、清晰区分两种情况：保留团队赛行（显示别名），新增一行 `Will it snow at tip-off? → outcome: yes, outcomeLabel: "Yes"` 演示中性 market。

## 验收

- 团队赛行：标签只有 `Arsenal`（绿）、`Lakers`（红），无 `YES` / `NO` 徽章。
- 中性 market 行：标签为 `Yes`（绿）或 `No`（红）。
- 颜色规则一致：绿 = YES 侧，红 = NO 侧；语义全部由颜色承担。
