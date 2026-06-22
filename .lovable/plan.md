## 背景

当前 Combo 活动有两个硬上限：
- `COMBO_MAX_ODDS = 50×`
- 对应封顶赔付 = `50 × 10U = 500U`

`previewQuote` 已经计算了 `rawComboOdds`（未封顶的原始赔率）并暴露了 `oddsCapApplied` 标志。但前端目前的展示只在 Quote Preview 面板里给了一个很轻的小字：
> "Capped at 50× max"

当用户挑了 4 条腿、心算出来明显大于 50×（例如 177×）时，看到屏幕上只显示 50× / 500U，会困惑并可能投诉。需要在触发封顶时，把"原始赔率 → 封顶后赔率"和"为什么被封顶"清楚地讲出来。

注意：这是一个纯展示层优化，不动 mock API、不动 state machine、不动状态机常量。

## 改动范围

只改 `src/components/sports/promo/ComboChallengeSection.tsx`（以及 `/style-guide` 同步），不动业务逻辑。

### 1. Quote Preview 面板（封顶生效时的强提示）

当 `quote.oddsCapApplied === true` 时，把现在的小字升级成"明显可见的解释卡片"：

- **Activity odds 区块**：在 `50.00×` 下方加一行删除线展示原始赔率，例如 `~177.71× raw`，并保留 `CAPPED` 徽章（amber 边框 + 小盾形图标），让用户一眼看出"系统识别到了你的真实赔率，但被活动规则封顶了"。
- **All correct pays 区块**：同样在 `500.00 U` 下加灰色删除线 `~1,777 U raw`。
- **面板底部新增一行解释带**（替换/补充现有的 "Odds lock only after a successful submission."）：
  > "Activity caps payout at 50× / 500U per combo. Your selection's fair odds were 177.71× — see Rules for details."
  其中 "see Rules" 是个 `<Link to="/promo/world-cup" search={{ tab: "rules" }}>`，跳到规则 tab。

### 2. PLACE 按钮（封顶生效时的副文案）

PLACE 按钮目前显示 `PLACE 10U · 17.71× → 177U`。当封顶生效时：
- 按钮主文案仍然显示封顶后的数值：`PLACE 10U · 50.00× → 500U`
- 在按钮上方加一行 12px amber/zinc 小字：`Activity cap applied · fair odds 177.71×`
- 这样按钮自身保持可点击 CTA 的简洁，又不会让用户以为系统算错。

### 3. 空态预览（未生成 quote 时的预防性说明）

现有空态已经有 "Max activity odds 50× · payout caps at 500 U"。把它调整成两行更清楚的版本，作为用户在挑腿之前的预期管理：
- 第一行（amber）：`Activity cap · 50× max odds · 500U max payout`
- 第二行（zinc-500）：`Fair odds above 50× are shown for reference but settle at 50×.`

### 4. MyCombo Footer 的实时预估（如果存在）

需要在实现时检查 `MyCombo` 内部是否在选满 4 条腿后用原始概率自行算了一个"预估赔率"显示（用户截图里 PLACE 按钮上写的 17.71× 是 quote 数据，不是本地估算）。如果存在本地估算逻辑，按相同规则展示封顶提示；如果只是来自 `quote`，则无需额外改动。

### 5. /style-guide 同步

在 `world-cup-carnival` 区块的 ComboChallengeSection 演示里追加一个"Cap applied 状态"示例（mock 一个 `oddsCapApplied: true, rawComboOdds: 177.71` 的 quote 喂给 `QuotePreviewPanel`），并加一句说明：
> "When fair odds exceed 50×, payout is capped. Show the raw value struck through so the user understands the cap, not a bug."

## 技术细节

- 不修改 `mockApi.ts`：`rawComboOdds` 和 `oddsCapApplied` 已经在 `PreviewQuote` 接口里，前端直接消费即可。
- 不修改 `world-cup-carnival.ts`：常量保持 `COMBO_MAX_ODDS = 50`、`COMBO_STAKE_MAX = 10`。
- 文案使用 `toFixed(2)` + `×`/`U`，与现有格式保持一致。
- 删除线样式使用 `line-through text-zinc-600`，避免和 amber 主色抢眼。
- Rules 链接使用 TanStack `<Link to="/promo/world-cup" search={{ tab: "rules" }}>`，与其它入口一致。
- 移动端不新增弹窗（遵守 core memory），所有解释都内联在 QuotePreviewPanel 和 PLACE 按钮上下方。

## 不在本次范围

- 不调整 `COMBO_MAX_ODDS` 或 `COMBO_STAKE_MAX` 数值。
- 不改 Rules tab 的正文内容（已包含赔率上限说明）。
- 不改 submit/requote 流程：requote 仍按 `activityOdds`（已封顶值）做漂移。
- 不改交付文档 `world-cup-carnival-spec.md`；如确认实现后再补一段"§3.x 封顶展示规则"。
