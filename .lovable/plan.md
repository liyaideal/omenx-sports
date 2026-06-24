## 调整目标

补两件事：(1) 加入平台特有的**杠杆**机制；(2) 把 event 切换从 sidebar 抽出到**顶部 Event Tabs**，每个 event 仍带 3 个 market。

---

## 1. 顶部 Event Tabs

新增 `EventTabs.tsx`，渲染在 `/strikezone` 页面顶部、sidebar+grid 上方一条 56px 高的水平条：

```
┌──────────────────────────────────────────────────────────────────┐
│  ● LIVE  [ 🇺🇸 USA 1 – 0 PAR  · 67' ]  [ 🇲🇽 MEX 2 – 1 RSA · 23' ]│
└──────────────────────────────────────────────────────────────────┘
```

- 每个 tab 是一颗 chip：左侧两国旗、中间比分、右侧分钟数 + 跳动红点
- 当前选中 tab：cyan 描边 + 轻微 glow，其它 tab：低对比、hover 提亮
- 字体 Press Start 2P 用于队名缩写，Audiowide 用于比分
- 只列 `isLiveStream && liveScore` 的事件，最多 4 个，溢出可横向滚动
- 切换 tab 时：
  - 重置 grid 视图（清空 history、重新 seed 价格、保留 balance/session）
  - 默认选中该 event 的第一个 market（USA / MEX）
  - 已下未结的注**保留**，UI 给出"切换后未结算注仍在原事件计算"的小提示（chip 上 ●N 角标显示该事件未结注数）

Sidebar 改造：
- **删除**原 sidebar 顶部的 "USA-PAR / MEX-RSA" event 切换卡
- 只保留 3 颗 market chips（YES outcome 三选一 / 二选一），标题改为当前 event 名（如 `USA vs PAR · 67'`）

---

## 2. 全局杠杆 (1× / 2× / 5× / 10×)

Sidebar 在 **BET SIZE 卡和 STOP 按钮之间**插入新卡：

```
┌─────────── ⚡ LEVERAGE ───────────┐
│   [ 1× ]  [ 2× ]  [ 5× ]  [10×]   │
│   payout × lev  ·  loss × lev      │
└────────────────────────────────────┘
```

- 4 颗 chip，选中态 = 橙色实心（沿用 BET SIZE 选中样式）
- 默认 1×，hotkey `Q/E` 在档位间切换
- 卡片右上角小字 `Q/E` 提示
- 选中 5× / 10× 时，卡片整体描边变 amber 并加 `⚠ HIGH RISK` 字样

### 杠杆数学

Bet 创建时记录 `leverage`，结算时：
- **命中（HIT）**: `payout = stake × multiplier × leverage`
- **未命中（MISS）**: `loss = stake × leverage`（亏损放大），从 balance 扣 `stake × (leverage − 1)` 作为追加亏损（基础 stake 已在下注时扣过）

下注瞬间扣款仍按 `stake`（保证金概念），未命中时再扣 `stake × (leverage−1)`。

Grid 单元格显示的倍率改为 `mult × leverage`，例如最远格 50× 在 10× 杠杆下显示 **500×**（上限 cap 至 `999×` 防溢出）；颜色热度按 raw mult 计算（不被杠杆影响），避免视觉爆炸。

Positions 显示由 `$100 → $250` 升级为 `$100 ×5 → $1,250`（stake × lev → potential payout）。

---

## 3. 技术清单

- 新增 `src/features/strikezone/EventTabs.tsx`
- 改 `src/routes/strikezone.tsx`：顶部插入 EventTabs，state 提升 `currentEventId`，传给 Sidebar/Grid
- 改 `src/features/strikezone/Sidebar.tsx`：删 event 切换卡、加 LEVERAGE 卡、传 `leverage`/`setLeverage`
- 改 `src/features/strikezone/hooks/useStrikezoneSession.ts`：bet 模型加 `leverage: number`，结算逻辑按上述公式
- 改 `src/features/strikezone/Grid.tsx`：cell 倍率显示 `mult × leverage`，marker 浮字按杠杆放大
- 改 `src/features/strikezone/lib/multiplier.ts`：导出 `applyLeverage(mult, lev, cap=999)` 工具
- 新增 hotkeys：`Q`=降档，`E`=升档；`Tab`=event tabs 间循环

切换 event 时未结注**不强平**，继续在原 event 的价格流上判定；如需强平再讨论。

杠杆默认 1×，已存在的 localStorage session 兼容：`bet.leverage ?? 1`。