## 问题诊断

Pinpoint 的网格每一帧都在向左平移（`PX_PER_MS = PITCH_X / 1000`，每秒一列向 NOW 线移动）。当前点击逻辑：

- `Grid.tsx` 的 RAF 循环每帧用 `now = Date.now()` 重新计算所有 future cell 的矩形，写入 `futureCellsRef.current`。
- 用户点击 → 浏览器派发 `click` 事件 → `onClick` 直接用 `futureCellsRef.current` 做命中测试。

问题在于：用户看到的画面是上一帧绘制时刻（T_render）的位置；但点击事件被处理时，往往 RAF 已经又跑了一次，`futureCellsRef` 里的矩形已经整体左移了几像素到十几像素。结果用户瞄准的格子在“当前缓存”里位于光标的左边，而光标命中的是它**右边那个**格子——这与截图描述完全一致（尤其点离 NOW 线越近、移动得越明显，越容易点偏到右边）。

## 修复方案

让命中测试对齐"用户实际看到的那一帧"，而不是"`onClick` 触发那一刻刚好缓存的帧"。

### 改动文件
- `src/features/pinpoint/Grid.tsx`（仅 Grid 内部、纯 UI 逻辑，不动业务/下注规则）

### 具体步骤

1. **快照渲染帧**：在 RAF 循环里，除了写 `futureCellsRef.current`，再写一个 `lastRenderNowRef.current = now`（记录这一帧绘制使用的时间戳）。

2. **点击时回放偏移**：`onClick` 中：
   ```
   const clickNow = performance.now() 对应的 Date.now()
   const dx = (clickNow - lastRenderNowRef.current) * PX_PER_MS
   const xAdjusted = clickX + dx   // 反向补偿格子已经左移的距离
   ```
   然后用 `xAdjusted, y` 对 `futureCellsRef.current` 做矩形命中测试。这样命中的就是用户视觉上瞄准的那一格。

3. **悬停同步**：把同样的补偿逻辑用在 `hoverRef`（在 RAF 渲染高亮前对 hover.x 做同样的 dx 修正），确保黄色 hover 高亮也指在用户视觉光标下方的格子上，避免“看着高亮在左边，点了却进右边”的二次错位。

4. **同列已有持仓的取消**：保持原有逻辑（命中到一个已有 bet 的格子就调用 `onCancel`），只是现在命中正确了，取消/下注都不会再错位。

### 不会改动
- 下注金额/杠杆/倍数计算（`multiplier.ts`）
- `usePinpointSession` 业务逻辑
- 任何视觉/主题样式

### 验证
- 启动 dev，用 Playwright 在 `/pinpoint` 点击最左侧（最快到期）那一列的中央格子，截图确认黄色边框落在被点的格子而不是右边那格。
- 快速连点 5 次同一目标格，确认全部注单都落在同一列（之前会随机漂到右边一列）。
