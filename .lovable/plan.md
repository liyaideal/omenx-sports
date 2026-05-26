## 方案：限高 + "Show more"，默认 1 行

### 折叠阈值（按断点取整 = 1 行）
- xl (≥1280px) 3 列 → `COLLAPSED_COUNT = 3`
- md (≥768px) 2 列 → `COLLAPSED_COUNT = 2`
- 移动 1 列 → `COLLAPSED_COUNT = 1`

用 Tailwind 响应式 `hidden` 类直接控制第 2-N 张卡的显隐，比 JS 测窗口更稳：
- 第 1 张：始终显示
- 第 2 张：`hidden md:block`（md 起出现）
- 第 3 张：`hidden xl:block`（xl 起出现）
- 第 4 张及以后：`hidden`，仅在 `expanded` 时变为 `block`

### 改动点

1. **`src/routes/index.tsx`**
   - 新增 `const [expanded, setExpanded] = useState(false)`
   - `selectedOffset` 变化时 `useEffect` reset `expanded = false`
   - 网格 map 时给每张卡加 `className`：
     - idx 0 → 无隐藏
     - idx 1 → `expanded ? "" : "hidden md:block"`
     - idx 2 → `expanded ? "" : "hidden xl:block"`
     - idx ≥3 → `expanded ? "" : "hidden"`
   - 计算 `hiddenCount`（响应式不好精确算，统一用 `visibleMarkets.length - 1` 作为"展开后还能多看 N 个"的提示文案，简化为 `Show all {total} events`）
   - 网格下方条件渲染 `ShowMoreEventsButton`：当 `visibleMarkets.length > 1 && !expanded` 时显示

2. **新组件 `src/components/sports/dashboard/ShowMoreEventsButton.tsx`**
   - 全宽 dashed ghost 按钮，和 empty state 同款视觉
   - 折叠态：`Show all {total} events  ↓`
   - 展开态：`Show less  ↑`
   - 样式：`w-full rounded-2xl border border-dashed border-border bg-surface/40 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface/70 transition inline-flex items-center justify-center gap-2`

3. **`src/data/sports-markets.ts`**
   - 当前 7 张已足够演示折叠（折叠后桌面只剩 3 张，下方 4 张被收起），不再加数据

4. **`src/routes/style-guide.tsx`**
   - Section 17 追加 "Default collapsed = 1 row" 规则、断点对照表、按钮两态文案

### 不动
DayStripCalendar、卡片本身、Fans zone、Season markets、空状态文案保持不变。
