## 目标
让用户不必下注就能分享 combo：在「选完 picks 但未下单」和「已生成赔率预览但未提交」两个环节都暴露分享入口，便于 KOL 在不消耗参与名额的前提下传播不同的赔率组合。

## 修改点

### 1. 统一海报：draft 与已提交 ticket 视觉不分家
不再创建单独 draft 海报。
- 把 `ShareCardPreview({ ticket })` 改为基于通用字段的 `ShareComboPoster({ legs, stakeU, odds, grossPayoutU?, ticketId?, status? })`。
- 参数不足时优雅降级：
  - 无 `odds` → 赔率区显示 `ODDS PENDING`。
  - 无 `grossPayoutU` → reward 区显示 `TBD` 或隐藏具体数字，但排版与完整版完全一致。
- 海报上不再出现「Ticket #xxx」或 `SUBMITTED` 等明显区分状态的文字（除非已提交）；顶部标题统一用 `MY COMBO`，底部 referral ticket 始终保留。
- 已提交 ticket 的 `SuccessModal` 与 `TicketRow` 改用同一 `ShareComboPoster` 渲染，视觉无差异。

### 2. 新增 draft share target
在 `src/components/sports/share/share-targets.ts` 新增 `shareComboDraft({ legs, quote?, poster })`：
- `kindLabel`: `"COMBO DRAFT"`（成功提交后仍走 `shareCombo` = `"COMBO TICKET"`，状态可区分）。
- `title`:
  - 有 quote → `My ${odds}× 4-leg combo`
  - 无 quote → `My 4-leg World Cup combo`
- `subtitle`: 各 leg `teamLabel` 用 `·` 连接。
- `url`: `/promo/world-cup?tab=combo`（纯传播落地页）。
- `tweet`: 与 title 一致，结尾 `on OMENX ↘`。
- `poster`: 调用方传入 `ShareComboPoster`。

### 3. ComboBuilder：选完 picks 即可分享
在 `BuilderCTA` 上方（仅当 `filled === COMBO_MAX_PICKS`）加一行分享触发：
- 使用 `ShareTrigger variant="chip"` 或简洁的 inline 行。
- 左侧文案改为：`Share this combo`
- target: `shareComboDraft({ legs: ctrl.selectedLegs, quote: ctrl.quote ?? undefined, poster: <ShareComboPoster legs={...} /> })`。
- 不影响 CTA 主操作。

### 4. QuotePreviewPanel：odds 锁定后强化分享
当 `quote` 存在且 `pageState !== "REQUOTE_REQUIRED"`（PREVIEW_READY / SUBMITTING / PREVIEW_EXPIRED）时，在底部说明文字下方追加 `ShareTrigger variant="wide"`：
- label: `Share this combo`
- target: `shareComboDraft({ legs, quote, poster: <ShareComboPoster ... /> })`
- 使用 amber ghost 描边样式，与 Place 10U CTA 同色系但不抢主操作。

### 5. 已提交 ticket 复用同一海报
- `SuccessModal` 和 `TicketRow` 的 `ShareCardPreview` 替换为 `ShareComboPoster`，入参由 ticket 字段映射而来。
- 若已有 `ticketId`，海报底部仍可带 ticket code（如有），但视觉上与 draft 保持一致，不让用户一眼看出是 draft。

### 6. 同步 style-guide
在 `src/routes/style-guide.tsx` 现有 share preview 处新增 combo poster 的两态展示（无 odds / 有 odds），保持 playground 与产品同步。

## 不在范围
- 不改 `SuccessModal` 的 trophy / title / 数字行文案。
- 不改 `ShareTrigger` 自身样式或 share provider 逻辑。
- 不持久化 draft（链接里不包含 leg 数据，海报本身即为分享内容）。