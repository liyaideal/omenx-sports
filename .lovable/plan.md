## 问题

价格胶囊（"51.7¢"）和命中闪烁格（"1.00x" hit-flash）都锚定在 NOW 线附近的同一行：

- 价格胶囊位于 `tipY = yFor(currentPrice)` —— 始终对齐当前价格行
- Hit-flash 位于 `yFor(round(currentPrice))` —— K 线刚穿过的那行，几乎总是和价格行重合

每次格子到期时（每秒一次），它们就撞在一起，俩都看不清。

## 修复方案（仅 `src/features/pinpoint/Grid.tsx`）

**动态避让**：当有 hit-flash 活跃时，把价格胶囊从 tipY 临时上移/下移一个行距（`PITCH_Y`），并画一条 1px 引线从 tip 圆点连到胶囊，保持两者的视觉关联。

### 具体改动

1. **检测冲突**：在画价格胶囊之前，遍历 `hitFlashRef.current`，看是否存在 `Math.round(currentPrice)` 行的活跃 hit-flash（`age < HIT_FLASH_MS`）。

2. **垂直避让**：若冲突，pill 的 `pillY` 从 `tipY - pillH/2` 改为：
   - 优先向上 `tipY - PITCH_Y - pillH/2`
   - 若上移后会超出画布顶部（`< 2px`），改为向下 `tipY + PITCH_Y - pillH/2`
   - 同时把 pill 水平再往左推 6px，让它彻底脱离 NOW 线那一列的 hit-flash 高亮范围

3. **加引线**：从 `(HISTORY_W, tipY)` 画一段虚线（2px on / 3px off）到 pill 右边缘中点，颜色用 `stroke`（涨跌色），让用户一眼看出 pill 仍代表当前价。

4. **平滑过渡（可选，简单实现）**：用 `currentPillOffsetRef` 记录上一帧的 y 偏移，每帧朝目标偏移 lerp 30%，避免 hit-flash 出现/消失瞬间 pill 弹跳。

### 不会改动

- Hit-flash 自身（保留它在 NOW 线的卡带高亮，毕竟这是"K 线刚刚到达"的关键反馈）
- 业务逻辑、下注、倍数颜色
- pill 的样式（前一轮已经修好了可读性）

### 验证

Playwright 截 `/pinpoint`，等到 hit-flash 出现的那 650ms 内截图，确认 pill 已经避让到上/下一行且引线清晰可见，hit-flash 的 "1.00x" 完全可读。
