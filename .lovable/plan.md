## 问题

弹窗底部 3 个按钮：
1. Share my combo — amber 实色描边 + 内填，自带右上箭头 chip
2. View my ticket — amber 描边，前置 eye 图标
3. Build another combo — zinc 描边，尾部 refresh chip

三种不同的边框色 / 内填 / icon 位置 / 高度，规范完全不统一；而且三个等宽全宽按钮堆叠，视觉上又长又笨。

## 方案

改成 **1 个主 CTA + 1 行 2 列次级操作** 的 2 行布局。

```text
┌─────────────────────────────────────────┐
│         SHARE MY COMBO              ↗   │   ← 主 CTA（保留 ShareTrigger wide 形态）
├──────────────────┬──────────────────────┤
│ 👁  VIEW TICKET  │  ↻  BUILD ANOTHER   │   ← 次级，2 列等宽，同款 outline
└──────────────────┴──────────────────────┘
```

### 1. `TicketAcceptedModal`（`src/components/sports/promo/ComboChallengeSection.tsx`）

`<div className="space-y-2 border-t border-zinc-800 p-4">` 内重写底部：

- 第 1 行：`ShareTrigger`（不变，仍是主 CTA）。
- 第 2 行：`grid grid-cols-2 gap-2`，两个 `<button>` 用同一套 token：
  - 容器：`flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/60 py-3 transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-900 active:scale-[0.98]`
  - 图标：`h-3.5 w-3.5 text-zinc-300`（`Eye` / `RefreshCw`，统一尺寸与位置——都在文字左侧，去掉原 Build another 的右侧 chip）
  - 文案：`font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-300`
  - 文案缩短：`VIEW TICKET` / `BUILD ANOTHER`（去掉冗余 "my" / "combo"，避免 2 列里换行）
- `capReached` 分支：仍渲染那条说明文字，但布局换成单独占满 2 列（`col-span-2`）的禁用态"BUILD ANOTHER" 按钮 + 下方小字说明，保持 2 行结构不塌。

### 2. 删除原来不一致的样式

- 移除 Share 上的 `border-2 border-amber-400 bg-amber-400/10` 强调（`ShareTrigger` `variant="wide"` 自身已经是主样式；不再额外加 amber 描边，避免 amber/zinc 双系统打架）。

  > 如果实际渲染下去 wide 变体太弱，仅做退路：用 `className="border border-amber-400/60"`（注意是 1px 不是 2px），保持与下方次级按钮的描边粗细一致。

- View 按钮的 amber 描边去掉，改为与 Build another 完全相同的 zinc outline——三者建立明确层级：amber=主，zinc=次，而不是"两种 amber + 一种 zinc"。

### 3. style-guide 同步

`src/routes/style-guide.tsx` §"Post-submit ticket reveal" 那条 bullet 末尾追加：

> 弹窗底部固定 2 行：第 1 行 Share my combo 主 CTA；第 2 行 2 列等宽次级按钮（View Ticket / Build Another），共享同一套 zinc outline token。`capReached` 时第 2 行折叠为 col-span-2 的禁用 Build Another + 说明。

### 4. DESIGN.md

如果根目录有 `DESIGN.md` 就读 §4 Component Stylings；新增/补充一条 Modal footer 规约：

> 任何 ResponsiveModal 的 footer：最多 1 个 amber 主 CTA + 1 行 2 列 zinc outline 次级操作；禁止 3 个全宽按钮堆叠；禁止次级按钮混用 amber/zinc 描边。

不存在就跳过这一步，不主动新建。

## 不在范围

- 不改弹窗其它部分（Trophy / 标题 / Locked odds & Pays 数据区）
- 不改 ShareTrigger 组件本体
- 不动滚动 / 高亮 ticket 的行为（上一个版本刚加的）

## 验证

Playwright 桌面 + 移动各跑一次：4 腿 → 下注 → 截图弹窗底部，确认：
- 2 行布局；2 个次级按钮等宽对齐
- 边框粗细、圆角、字号、字间距、图标尺寸完全一致
- amber 仅用于主 CTA
