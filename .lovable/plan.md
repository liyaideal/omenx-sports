## 问题
1. 当前 `TradeOutcomePicker` 的 pill 太大（py-2、`text-lg` 价格、两行布局），抽屉上半部分体量明显超过下面真正下单的表单，重心倒挂。
2. 现有网格在 outcome ≥4 时（player props、top scorer、多车手 F1 等）会强行换多行，越多越糟。

## 改动（仅 `src/components/sports/trade/TradeOutcomePicker.tsx`）

### A. 压扁 pill，把视觉重量降一半
- Pill 改为单行横排：左侧 short code（小号 mono uppercase），右侧价格 cents（`font-display text-sm tabular-nums`，不再 `text-lg`）。
- padding 收到 `px-2.5 py-1.5`，圆角 `rounded-lg`。
- Section label 下间距 `mb-1.5`，整体 `space-y-2`。
- "Pick side" 块同样横排单行 pill。

目标：选择器整体高度从 ~220px 降到 ~110px，让下方 BUY/SELL + 表单成为视觉重心。

### B. 多 outcome 一律横向滚动
不再用 grid，统一改为单行横向滚动：
- 容器：`flex gap-2 overflow-x-auto snap-x scrollbar-none`，外加左右负 margin + padding 让边缘对齐。
- Pill 固定 `min-w-[112px]`，`snap-start`。
- 选项 ≤3 时也用 flex（每个 pill `flex-1`，铺满不出现滚动条），≥4 时自动溢出可滑。
- 选中态自动 `scrollIntoView({ inline: 'nearest' })`。
- 右侧加 8px 渐隐遮罩（`mask-image`）暗示可滚。

这样 2、3、4、10+ 选项都用同一套布局，永远单行，高度恒定。

### C. Side 选择器
触发条件不变（`outcomes.length >= 3`），同样改为压扁后的横排两个 pill，`grid-cols-2`（仅两项不需要滚动）。

## 不动
- `TradeDrawer` / `event.$id.tsx` 的调用方代码不变（props 接口不动）。
- `deriveTradeFormProps` 逻辑不动。
- TradeForm 不动。

## Style guide 同步
`/style-guide` 里 TradeOutcomePicker 的 demo 增加一个"7 个 outcome（玩家进球 props）"的示例，验证横向滚动的视觉。
