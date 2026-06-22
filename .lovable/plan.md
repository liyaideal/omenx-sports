目标：移除 "Calculate odds" 这一步。用户凑齐 4 腿后自动出 odds 与 payout，单按钮即可下单。

实施：

1. `src/components/sports/promo/combo/useComboState.ts`
   - 新增 effect：当 `filled === COMBO_MAX_PICKS` 且 `pageState === "READY"` 时，自动调用 `requestPreview()`。
   - 同样在 `pageState === "PREVIEW_EXPIRED"` 时自动重新 preview，让倒计时过期后自然续期。
   - leg 列表变更（替换/删除）现有逻辑已经把 pageState 回到 READY 并清空 quote，所以会自动触发上面的 effect，重新拿 quote。
   - 用 250ms debounce 包住自动 preview 调用，避免快速连点造成多次请求。

2. `src/components/sports/promo/ComboChallengeSection.tsx`
   - `BuilderCTA`（桌面侧栏）状态机改为：
     • filled < 4 → "Add N more pick(s)"，disabled
     • PREVIEW_LOADING → "Locking odds…"，disabled
     • PREVIEW_READY / PREVIEW_EXPIRED → "Place 10U · {odds}× → {payout}U"，启用，onClick = onConfirm
     • SUBMITTING → "Submitting…"，disabled
     • REQUOTE_REQUIRED → "Review new odds"，启用
   - 删除 onCalculate 分支文案；保留 onConfirm 行为不变。
   - `MobileStickyBar` 文案同步：去掉 "Calculate odds"，直接显示 "Place 10U"。
   - `QuotePreviewPanel` 空态文案改为 "Pick 4 outcomes — odds lock in automatically."；其他视觉不变。

不动：
- stake 固定 10U、4 腿上限、requote 弹窗、ticket 渲染、style-guide。
- previewQuote / submitTicket mock 接口、quote 倒计时显示。