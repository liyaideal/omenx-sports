# Strikezone — Bettle 风格体育网格博彩

完全独立的新页面 `/strikezone`，不动任何现有 trading / event 代码。

## 1. 核心玩法

每个 market 的 **YES 价格曲线（0–100¢）** 实时滚动；右侧网格代表"未来 60s × 当前价 ±N¢"的预测格子。点击任意格 = 用当前 BET SIZE 押"价格线会在 T 秒时穿过这个 1¢ × 1s 的小格"。命中 → 立刻结算 `押注 × 倍率`；未命中 → 输掉。

- **格子**：纵 1¢ / 横 1s
- **窗口**：未来 60s（60 列 × 21 行，纵向 ±10¢）
- **倍率曲线（B 均衡）**：`mult = 1.5 × (1 + 0.6 × distance¢) × (1 + 0.4 × seconds_ahead/10)`，最远格 ~50×。每格倍率印在格子里
- **判定**：价格线瞬时穿过格子矩形即命中（同一格只算一次）
- **开放时机**：只在 `live` 比赛中开网格，pre-match / closed 显示"网格仅在比赛进行中开放"的暗色提示卡 + 跳转回事件页按钮

## 2. 布局

桌面（≥md）：

```text
┌─────────────────────────────────────────────────┐
│ Topbar: ← Back · STRIKEZONE · Balance · P/L · ⓘ │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Market header (CAN vs BIH · LIVE 23'│
│ 280px    │   · CAN YES 53¢ ▲)                   │
│          │                                      │
│ [Live]   │  ┌────────────────────────────────┐  │
│ ─────    │  │  Grid 60s × 21 rows            │  │
│ MARKETS  │  │  ← scrolling left              │  │
│ • Main   │  │  price line traces through     │  │
│   Winner │  │  multiplier in each cell       │  │
│ • O/U2.5 │  └────────────────────────────────┘  │
│ • BTTS   │                                      │
│ ─────    │  BET SIZE: [10][25][100][500][1k]   │
│ Positions│  Hotkeys: A/D ←→ · Z undo · Esc stop│
│ (open)   │                                      │
│ [STOP]   │                                      │
└──────────┴──────────────────────────────────────┘
```

移动（<md）：顶部 sticky 条（balance + P/L + market picker），网格全屏，底部 sticky BET SIZE 条 + Positions pill → 底部 sheet。

## 3. 路由 & 文件

新建（全部不影响现有代码）：

```
src/routes/strikezone.tsx                          # 独立路由 + head()
src/features/strikezone/
  StrikezoneShell.tsx                              # 桌面/移动布局壳
  MarketSidebar.tsx                                # 左栏 market 列表
  GridCanvas.tsx                                   # 网格 + 价格线（canvas 渲染）
  PriceLineLayer.tsx                               # SVG/canvas 价格线 + trail
  CellGrid.tsx                                     # 倍率格子 hover/click
  BetSizeBar.tsx                                   # 底/侧 BET SIZE 芯片
  PositionsPanel.tsx                               # 进行中 + 已结算
  HitFlashLayer.tsx                                # 命中爆闪 + 飘字
  UndoToast.tsx                                    # 5s 撤销
  MarketStatusGate.tsx                             # 非 live 提示卡
  hooks/
    useStrikezoneSession.ts                        # balance/P/L/positions（localStorage）
    useLiveTicker.ts                               # 1s tick 价格游走（mock，复用 sports-markets.ts 当前价做种子）
    useGridHitDetection.ts                         # 价格线 vs 格子穿越判定
    useHotkeys.ts                                  # A/D/Z/Esc/数字
  lib/
    multiplier.ts                                  # 倍率公式 + 格式化
    storage.ts                                     # localStorage 持久化
  styles.css                                       # 网格 LED 风格变量
src/routes/style-guide.tsx                         # 新增 Strikezone section（grid demo / 倍率热力图 / hit flash）
```

不动：`event.$id.tsx`、`TradeDrawer`、`TradeForm`、`sports-markets.ts`（只读）。

## 4. 数据 & 状态

- **Market 列表**：从 `sports-markets.ts` 筛 `status === 'live'` 的事件，展开所有 markets，左栏分组（按 event）
- **价格 tick**：`useLiveTicker` 每 1000ms 用随机游走 ±0.8¢ 推进当前 market 的 YES 价（NO = 100 - YES），保留近 60s 历史画轨迹
- **会话状态** `useStrikezoneSession`（localStorage key `omenx.strikezone.v1`）：
  - `balance`（默认 $10,000）
  - `betSize`（10/25/100/500/1000/5000）
  - `positions: { id, marketId, side: 'YES'|'NO', priceCenter, secondsAhead, stake, mult, placedAt, status: 'open'|'won'|'lost' }`
  - `sessionPL`、`history`
- **判定**：每 tick 后遍历 open positions，若价格线在当前 second 落入该格的价格区间 → won；若 secondsAhead 倒计时归零未命中 → lost
- **STOP**：confirm 后清空所有 open positions（按"取消，本金原路退回"处理）

## 5. 视觉

- 暗色 LED 主题，复用项目现有 token；网格底色 `oklch(0.18 0.02 240)`，格线 `oklch(0.28 0.03 240)`
- YES 色 emerald-400，NO 色 rose-400，价格线 1.5px 发光轨
- 命中：格子 0.4s 白→YES 色闪烁 + 倍率向上飘字 + 数字音效（可选关）
- 字体：标题 Orbitron（项目已用），数字 JetBrains Mono
- 倍率热力：远格颜色更暖（emerald → amber → rose），明示风险

## 6. 交互细节

- 单击格子 = 立即下单（无确认弹窗），账户立刻扣款，格子边框加亮 + 显示已押筹码
- 同格多次点击 = 加仓（叠加 stake，倍率不变）
- A/D 或 ←/→ 切 BET SIZE，1/2/5/0 直选 10/25/100/1k，Z 撤销最近 5s 内下单（退款），Esc 触发 STOP
- 鼠标 hover 格子：显示 `押 $X → 赢 $Y（mult ×N）`
- 价格线触达屏幕右边缘时画面整体左移（time scroll）

## 7. 边界

- market closed / 比赛结束 → 网格暗化 + "结算中"覆盖层，所有 open positions 按本金退款
- 进球等价格瞬跳 → 按瞬时穿越判定（穿过的所有格子都触发命中）
- 切换 market → 当前 positions 不消失，仍在后台 tick 与判定，sidebar 显示数量徽标

## 8. 不做

- 不做真实撮合、不接 Cloud、不做跨设备同步
- 不做 STOP 之外的提前平仓 / TP / SL
- 不做排行榜、不做音效开关（先默认开）
- 不加任何入口（导航/首页卡片）—— 用户手动访问 `/strikezone` 体验

## 9. 验证

1. 直接访问 `/strikezone`，左栏看到至少一场 live 比赛的 markets
2. 选中 main winner YES，右侧 60s 网格滚动、价格线左移
3. BET SIZE = $100，点击近格 → 余额 -100、格子高亮、5s 内 Z 可撤
4. 等价格穿过 → 命中爆闪、余额 += 押注×倍率、Positions 出现 won 记录
5. A/D 切档、Esc 触发 STOP 确认
6. 刷新 → balance/positions/history 全部恢复
7. 切到 `pre-match` 比赛 → 显示"仅 live 开放"提示
8. 移动视口（375px）→ 顶/底条切换正常，格子可触达
9. `/style-guide` 新增 Strikezone section 显示 grid demo + 倍率热力 + hit flash 动画
