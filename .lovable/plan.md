## 目标

左侧整列从「为了塞下而压缩」改成「自然舒展，填满一屏」。当前 sidebar 卡片 padding=10px、间距 gap=8px、字号 8–10px，挤在 780px 高度上但底部还留白；要利用这部分空间放松节奏，同时不引入新功能。

## 调整内容（仅 UI / 排版）

### 1. Sidebar 容器（`src/features/pinpoint/Sidebar.tsx`）
- 宽度 `260px → 288px`
- 容器 `gap-2 p-3` → `gap-3 p-4`
- 卡片 padding：所有 `p-2.5` → `p-3.5`
- 卡片头部行与正文之间 `mb-1.5 / mt-1.5` → `mb-2.5 / mt-2.5`
- 标题字号 `text-[10px] → text-[11px]`，副标签 `text-[8px] → text-[9px]`
- 数值行字号：BET SIZE / LEVERAGE 顶部数字 `text-sm → text-base`
- 选项 chip：BET / LEVERAGE / MARKET 的 `py-1.5` → `py-2.5`，字号 `text-[9px/10px]` → `text-[11px]`
- LEVERAGE 卡片 row 3 / row 4 的 `text-[8px]` → `text-[10px]`，`mt-1.5 / mt-1` → `mt-2.5 / mt-2`
- STOP 按钮 `py-2.5 text-xs` → `py-3 text-sm`

### 2. AccountBlock（`src/features/pinpoint/AccountBlock.tsx`）
- 整体 padding 与内部间距放大一档（与上面同比例）
- 头像 / LV / XP 行高度增加约 8px，让 P1 牌与 LV 数字不再贴边
- 战绩行 W/L/BEST 字号上调，让 trophy 排在更舒展的网格里
- BALANCE / SESSION P/L / MARGIN 三段之间 divider 加 `mt-3 / pt-3`

### 3. EventSelector（`src/features/pinpoint/EventSelector.tsx`）
- 卡片改为两行布局：第 1 行 LIVE 标签 + 比赛时钟，第 2 行队名缩写与比分；当前是单行被截断成 `USA 1-…`
- padding 同步放大

### 4. 整体右侧网格不动
Grid 自身已经按容器自适应高度，sidebar 变宽 28px 后 grid 列数仍按容器自适应；不调整 Grid 内部参数。

### 5. 主页根容器（`src/routes/pinpoint.tsx`）
- 仅调整左右两栏间距 `gap` 与外层 padding（如有挤压），保证 1280×800 视口下整屏铺满、底部不再有大块空白。

## 不做的事
- 不动业务逻辑、hooks、Grid 渲染、音效、动效
- 不引入新组件 / 不删除现有模块
- 不改顶部 header 的 PlayerCard / utility 按钮组成

## 验收
- 1280×800 与 1024×780 两个视口下，左栏自然占满高度，没有明显空白条
- LEVERAGE 卡片标签在 1× / 2× / 3× 切换时都不再贴边或换行
- EventSelector 第 2 行能完整显示「USA 1-0」之类的赛况，不再被 `…` 截断