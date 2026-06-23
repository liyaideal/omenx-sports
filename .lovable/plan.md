## 问题（移动端 390×779）

参考截图，`LegendRevealOverlay` 在移动端有几处叠加 / 溢出 bug：

1. 顶部 `ROUND 01 · REVEALING…` 状态条与第 1 条 clue (POSITION) 重叠 —— stage 没有给 top bar 预留空间。
2. 底部 helper 文案 `REPLAY · NO REWARD CHANGE · ESC TO SKIP` 与结果 banner 重叠。
3. 结果 banner 是 `flex` 单行，移动端被强行换行，绿色 `Patrick Vieira` 挤到右侧并断行；icon / 主文案 / 副文案没有正确堆叠。
4. Candidate 卡片在移动端仍是 `grid-cols-2`（图片 3:4），4 张卡片占满高度后把 banner 推到底部 helper 上。
5. LED 边框 `inset-4` + 内部 `px-6` 在窄屏过于紧贴，clue 行右侧 ARSENAL/EURO 2000 等长值贴边。

## 改动范围

仅改 `src/components/sports/promo/LegendRevealOverlay.tsx`，纯展示层，不动时序、不动数据、不动 reveal queue。

### 1. 容器：移动端用滚动 + 安全区
- 外层 `flex items-center justify-center` 在移动端改成 `items-start` + `overflow-y-auto`，桌面端保持居中：
  `flex items-start justify-center overflow-y-auto sm:items-center sm:overflow-hidden`
- Stage 容器 `mx-auto w-full max-w-4xl px-6` → `px-4 sm:px-6`，并加 `pt-16 pb-20 sm:pt-0 sm:pb-0`，给 top bar / bottom helper 让出空间。

### 2. Top bar
- `px-6 py-4` → `px-4 py-3 sm:px-6 sm:py-4`
- ROUND 状态文案在移动端字号收到 `text-[10px]`，并加 `truncate min-w-0`，按钮组 `shrink-0`，避免遮挡。

### 3. Clue 行
- `px-4 py-3` → `px-3 py-2.5 sm:px-4 sm:py-3`
- 右侧 value 容器加 `min-w-0 text-right`，文案 `truncate`，防止 `EURO 2000` 等贴边。

### 4. Candidate grid
- 移动端从 `grid-cols-2` 改成 `grid-cols-4`（与桌面一致），保持 4 张并排 —— 这样 4 张缩略卡更小，能在一屏内放下，不再把 banner 挤到底部 helper 上。卡片下方名字字号收到 `text-[10px] sm:text-[12px]`。
- 间距 `gap-3` → `gap-2 sm:gap-3`。

### 5. 结果 banner
- 当前是单行 flex，移动端文案太长。改成移动端纵向堆叠：
  - 外层 `flex-col sm:flex-row items-center gap-1.5 sm:gap-3`
  - icon + 主文案一行（`flex items-center gap-2`），副文案（球员名）独立一行，居中显示。
- `mt-8` → `mt-6 sm:mt-8`，`px-5 py-3` → `px-4 py-2.5 sm:px-5 sm:py-3`
- 主文案 `text-sm` → `text-[12px] sm:text-sm`，副文案 `text-[10px] sm:text-[11px]`。

### 6. Bottom helper
- 在移动端因为外层改成 `overflow-y-auto items-start`，bottom helper 仍是 `absolute bottom-4`，会再次和滚动内容打架。改成移动端进入文档流：
  - 把 helper 从 `absolute inset-x-0 bottom-4` 改成 `mt-6 mb-4 text-center sm:absolute sm:inset-x-0 sm:bottom-4 sm:mt-0 sm:mb-0`，并移到 stage 容器内部底端（紧跟 reward callout 之后），保证移动端自然位于内容底部，桌面端保持绝对定位不变。

### 7. LED 边框
- `inset-4` → `inset-2 sm:inset-4`，在窄屏避免边框压住 top bar。

## 验证

- 在 390×779 视口下重新触发揭示动画，确认：
  - 顶部 ROUND 行不再压住 POSITION clue
  - 4 张候选卡一排显示，不再挤压 banner
  - banner 主文案 + 球员名两行清晰显示，绿色 ✓ / Patrick Vieira 不再断行
  - 底部 helper 单独一行，不与 banner 叠
- 桌面 (≥sm) 视觉与现在一致（所有改动都是 mobile-first + `sm:` 还原）。
- `/style-guide` 的 `LegendRevealOverlay` 预览同步验证 hit / miss / no-pick 三种 banner 在移动端布局正确。

## 不改

- 时序常量 `T` / `FULL_DURATION_MS` / `REDUCED_DURATION_MS`
- `useLegendRevealQueue`、`GuessTheLegendTab`、数据层
- 桌面端外观
