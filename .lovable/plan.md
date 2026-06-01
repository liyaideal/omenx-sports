## Markets 列表价格变化优化

文件：`src/components/sports/event/EventOutcomesPanel.tsx` (line 142–157)

### 改动
1. **加 ¢ 单位**：箭头数字后追加 `¢`，从 `▲2` → `▲2¢`，`▼2` → `▼2¢`
2. **0 变化展示横盘符号**：去掉 `delta !== 0 &&` 守卫，0 时渲染 `—0¢`（muted 色，与涨跌区分）
3. **对齐**：给 delta span 固定宽度 + 右对齐 `inline-block w-10 text-right tabular-nums`，让 ▲/▼/— 起始 x 一致，价格列整齐
4. 同步 `/style-guide` 里 EventOutcomesPanel 的展示（若有 0/正/负三种态的 mock 数据，确认覆盖到）

### 视觉
- `▲2¢` win 绿
- `▼2¢` loss 红
- `—0¢` muted（中性灰）

简单一个文件的改动，确认后执行。