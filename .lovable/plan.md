## 目标
新增一套用户激活弹窗组件（3 种），在 `/style-guide` 提供可点击 demo。组件按现有 "Stadium Neon" 设计规范（`DESIGN.md`）实现：`font-pitch` 大写标题、`font-scoreboard` eyebrow、`bg-gradient-neon` 主 CTA + `shadow-glow`、单主题深色底、`rounded-3xl` 卡片、`border border-border`；移动端复用 `ShareDialog` 的 Dialog↔Sheet(bottom) 切换模式。

## 组件

新文件 `src/components/sports/activation/ActivationDialog.tsx`：

- `<ActivationDialog open onOpenChange variant title subtitle ctaLabel onCta />`
- `variant`: `"reward-pool" | "voucher" | "deposit-match"` 决定主题 icon + 装饰渐晕：
  - `reward-pool`: `Trophy` 图标 · 洋红-金色 halo · 大字 "3M" 副强调 · 副标题下方额外一行 pill 展示 `NEW USERS · 10 – 560 U`
  - `voucher`: `Ticket` 图标 · 24h 倒计时 pill (`Clock` + `Claim within 24 hours` 高亮橙)
  - `deposit-match`: `Wallet` 图标 · `+1×` 折角标签 · 副标题下 pill `500 / DAY`
- 顶部：60px 圆形 icon well (`bg-gradient-neon shadow-glow`) 居中；标题 `font-pitch text-2xl uppercase text-white`；副标题 `text-sm text-zinc-400`
- CTA：`w-full h-12 rounded-2xl bg-gradient-neon text-primary-foreground font-pitch uppercase tracking-widest shadow-glow`；下方一行 `text-[10px] font-mono text-muted-foreground` 的次要 `Maybe later` ghost 按钮
- Mobile：< md 用 `Sheet side="bottom"`（`rounded-t-3xl`），desktop 用 `Dialog`（`max-w-sm`, `rounded-3xl`）。`useIsMobile()`。
- 关闭按钮内置右上 `X`；`DialogTitle/Description` 走 `sr-only` + 视觉标题独立渲染，便于自定义排版。

新文件 `src/components/sports/activation/index.ts` 汇出组件与 variant 类型。

新文件 `src/components/sports/activation/presets.tsx`：三个便捷预设 `<RewardPoolLiveDialog />` / `<VoucherReadyDialog />` / `<DepositMatchDialog />`，把三段固定文案 + `onCta` 默认行为封装好：

- RewardPool → `onCta` 默认调用 `props.onRegister?.()`（页面接入时打开 OmenX 注册弹窗；注册完成后由调用方 `navigate({ to: "/promo/world-cup" })`）
- Voucher → 默认 `window.location.href = "https://omenx.lovable.app/vouchers"`（可 `onCta` 覆盖）
- DepositMatch → `onCta` 默认调用 `props.onDeposit?.()`（页面接入时打开 OmenX 充值弹窗；完成后由调用方跳到 `/promo/world-cup`）

## Style-guide demo

在 `src/routes/style-guide.tsx`：

1. `SECTIONS` 新增 `["activation", "Activation Dialogs"]`（紧邻 `share`）。
2. 新增 `<Section id="activation" title="Activation Dialogs" kicker="30 — Activation">`：
   - 三张并排 preview 卡片（inline 静态样式，非弹窗形态，用来看排版）。
   - 三个 launcher button 单独触发真实弹窗（`useState` 控制 open）。
   - 说明段：本组件仅负责 UI + `onCta` 回调；注册/充值弹窗由 OmenX 主项目提供，页面接入时用 `onRegister` / `onDeposit` 打开对应 OmenX 组件，完成后再 `navigate({ to: "/promo/world-cup" })`；仓位券入口直接跳 `https://omenx.lovable.app/vouchers`。

## 涉及文件

- 新增 `src/components/sports/activation/ActivationDialog.tsx`
- 新增 `src/components/sports/activation/presets.tsx`
- 新增 `src/components/sports/activation/index.ts`
- 修改 `src/routes/style-guide.tsx`（加 section + demo）
- 更新 `mem://index.md` Core：新增记忆条目 `mem://design/activation-dialogs`（弹窗尺寸/主题化 icon/CTA 契约/移动端 bottom sheet）

## 不改动

- `DESIGN.md`（现有 tokens 已覆盖，无需新加规则）
- 任何业务页面：本次仅做组件 + playground，接入激活流程留给后续 PR
- 数据/API/后端
