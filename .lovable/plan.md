## 问题

`Grid.tsx` 的格子尺寸是写死的（`ROW_H=50`、`COL_W=78`、`ROWS=11`，总高 600px）。结果：
- **小屏 / 低高度**（如 1024×780）：sidebar 那列拉高后，Grid 上方 header 把可用高度挤掉，但 600 是常量，没办法收缩 → 看起来拥挤、底部仍有间隙。
- **大屏 / 高分辨率**：Grid 高度永远 600，上下出现明显黑色空白带；列宽 78 也固定，宽屏只是多塞几列而不是把格子放大。

## 目标

让 Grid 在不同视口下整体等比缩放，始终占满 `<main>` 里 header 与帮助行之间的可用空间，行高/列宽随之联动，时间维度（每秒一列、撞击瞬间）保持不变。

## 改动

### 1. `src/features/pinpoint/Grid.tsx` — 动态尺寸

把布局常量从 module-scope 升级成由容器尺寸推导的运行时值：

- `ResizeObserver` 同时观察容器的 `width` 与 `height`（之前只用 width）。
- 新增推导：
  ```ts
  const availH = containerH;            // 实际可用高度
  const rowGap = availH < 520 ? 4 : 5;
  const rowH   = clamp(Math.floor((availH - (ROWS-1)*rowGap) / ROWS), 36, 64);
  const colW   = clamp(Math.round(rowH * 1.55), 60, 104);
  const colGap = rowH < 44 ? 4 : 6;
  const pitchX = colW + colGap;
  const pitchY = rowH + rowGap;
  const totalH = ROWS*rowH + (ROWS-1)*rowGap;
  ```
- 用 `useRef` 把 `{rowH,colW,colGap,rowGap,pitchX,pitchY,totalH}` 暴露给 RAF loop（RAF 读取 ref，避免重建 loop）。
- `PX_PER_MS = pitchX / 1000`：保持「1 秒推一列」的时间语义不变，只是每一列在画面上变宽/变窄。
- 单元格内字体（`mult` 字号、bet stake、payout）从 `rowH` 推导：
  ```ts
  const fontMain = Math.max(11, Math.round(rowH * 0.26));
  const fontSub  = Math.max(8,  Math.round(rowH * 0.18));
  ```
- canvas 的 CSS `height` 由 `totalH` 决定，DPR 缩放逻辑不动。

### 2. `src/routes/pinpoint.tsx` — 让 main 真正给出可用高度

当前 `<div className="relative z-10 flex gap-3 px-3 pb-4">` 没有限定整屏高度，`<main>` 用 `flex-1` 但父级没有约束 → Grid 容器拿到的是「内容自然撑出来的高度」，不是「屏幕剩余高度」。

- 给整个布局容器加 `min-h-[calc(100vh-56px)]`（56 是 header 大致高度，用同样的 token），同时给 `<main>` 加 `min-h-0`。
- Grid 外层 wrapper 改为 `flex-1 min-h-0`，让 ResizeObserver 测到的是「header + 帮助行去掉之后」剩下的高度。

### 3. 不动的地方

- `ROWS = 11`、HISTORY_FRAC = 0.34、时间常量（DYING_MS、HIT_FLASH_MS、SETTLE_MS）、price 撞击逻辑、星星/Pop 动画。
- 业务逻辑、`usePinpointSession`、sidebar、AccountBlock、EventSelector。

## 验收

- 1280×800：grid 完全填满 header 与帮助行之间，没有黑色空白带；rowH ≈ 56、colW ≈ 86，整体放大但不顶到边。
- 1024×780：grid 收缩到 rowH ≈ 44、colW ≈ 68，仍能完整显示 11 行 + 部分右侧列；底部不再出现盈余空间。
- 1920×1080：rowH 命中上限 64、colW 命中 100；不再是「小格子+大量空白」。
- 价格线在 NOW 边界的撞击、列消失/星星动画、点击命中检测在三种分辨率下都对齐（pitchX 改了，但 RAF 已经按 ref 读最新值）。