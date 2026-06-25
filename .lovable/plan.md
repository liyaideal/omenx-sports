# Pinpoint v3 对齐 · 实施计划

## 范围
- **P0 经济骨架**：AMM 定价 / 名义×数量×差价盈亏 / 持续盯市 / MMR 强平 / 触发即冻结
- **P0' 修订**：杠杆 1–3x 账户级单一杠杆、撤单回归 + 锁定窗口、canceled 态（**不做同格加注合并**，保持「一格一注」）
- **P1 披露与预警**：三数披露、Trading Fee 显式化、MMR 预警动效

## 一、参数 `src/features/pinpoint/constants.ts`（新增，全部集中）
- `LEVERAGE_OPTIONS = [1, 2, 3]`（账户级单一杠杆）
- `MM_RATE = 0.05`、`LIQ_TRIGGER_MMR = 1.0`
- `ODDS_CAP = 100`（→ `p_min = 0.01`）
- `VIG = 0.04`（庄家边际，内嵌于 p）
- `TRADING_FEE_RATE = 0.02`（按名义计，Opening Premium）
- `CANCEL_LOCK_MS = 1500`（最后 1.5s 不可撤）
- `LIQUIDATION_FEE_RATE = 0.0075`（仅记账，不展示）

## 二、AMM 定价 `src/features/pinpoint/amm.ts`（新增）
- `pFair(cell, currentPrice, ttlMs)`：截断高斯近似，`σ = baseSigma * sqrt(t)`，算价格线落入该带的概率。
- `pQuote = clamp(pFair + VIG/cellCount, 0.01, 0.99)`。
- `odds = 1 / pQuote`，封顶 `ODDS_CAP`。
- 导出 `quoteCell(cell, ctx) → { p, odds }`，纯函数，每帧调用。

## 三、会话/账户 `hooks/usePinpointSession.ts` 重写

### State
- `accountLeverage: 1|2|3`（替换 per-bet leverage）
- `positions[i]`: `{ id, cellId, m, L, N, p_entry, q, odds, openedAt, expireAt, feePaid, status: 'open'|'won'|'lost'|'canceled' }`
- `sessionStatus: 'active' | 'frozen'`

### `placeBet(cell)`
- 拒绝：frozen / 该 cell 已有 open 仓 / 余额不足。
- `{p, odds} = quoteCell(...)`；`N = m*L`；`q = N/p`；`fee = N*TRADING_FEE_RATE`；`balance -= (m + fee)`。

### `cancelPosition(id)`
- 仅当 `now < expireAt - CANCEL_LOCK_MS` 允许；退 `m`（fee 不退）；status=`canceled`。

### 持续盯市（rAF/200ms）
- `unrealized_i = clamp(q_i * (p_t - p_entry_i), -m_i, +∞)`
- `equity = balance + Σ unrealized`；`ΣMM = Σ N_i * MM_RATE`；`mmr = ΣMM / max(equity, ε)`。

### 结算
- 命中：`payout = m + q*(1 - p_entry)` 回款；`won`。
- 未命中：`lost`，无回款。

### 冻结
- `mmr >= 1` → `frozen`；剩余 open 腿走 lost 出清；阻断 placeBet。

## 四、UI

### `Sidebar.tsx`
- 杠杆改 3 段 toggle（1x/2x/3x），账户级，注「只对新单生效」。
- BET SIZE 下方新增 **三数披露条**：`Margin $m · Notional $N · Win if hit +$payout`，含 `Fee $f`。
- Margin Health 用新 mmr；颜色阶梯 `<0.6 绿 / 0.6–0.85 黄 / >0.85 红+脉冲`。
- 冻结态整块禁用，按钮 `SESSION FROZEN`。

### `Grid.tsx` (canvas)
- 每格大字 `1/p`（×N.NN）+ 小字 `p%`。
- 已下注格：`m / +win`。
- 临近判定（≤1500ms）的已下注格：锁图标 + 灰罩，点击无响应 + tip。
- 冻结：全屏红脉冲遮罩 + `SESSION FROZEN · LIQUIDATING`，不响应点击。
- `mmr > 0.85` 网格四边红光脉冲。

### `routes/pinpoint.tsx`
- 旧 GAME OVER modal 文案改成「会话已冻结/清算中」；「重开」按钮置灰，提示「需先划入资金（下期上线）」。

## 五、DESIGN.md + /style-guide 同步（必做）
- `DESIGN.md` §4 Component Stylings 新增 **Pinpoint** 小节：
  - 杠杆 segmented toggle（1/2/3x）
  - 三数披露条样式与排版
  - Margin Health bar 颜色阶梯 + 阈值
  - 单元格内字号层级（odds 大 / p% 小 / 锁定灰罩）
  - 冻结遮罩规格（颜色、脉冲频率、字体）
- `DESIGN.md` §7 Do's & Don'ts 新增：
  - Don't：在 Pinpoint 中暴露 vig / 强平费 / funding 给用户
  - Don't：临近判定窗口内允许撤单
  - Do：盈亏始终按 `q × (p_t − p_entry)` 口径盯市
- `src/routes/style-guide.tsx` 新增 **Pinpoint Tokens** 演示区：
  - 杠杆 toggle 三态
  - 三数披露条范例（含 fee 行）
  - Margin Health bar 四种状态（safe/warn/danger/frozen）
  - 单元格状态卡片（idle / open / locked / won / lost / canceled）
  - 冻结遮罩缩略示意
- `mem://design/pinpoint-economics-ui` 记一条 Core 提醒：Pinpoint 永远显示 Margin/Notional/Win 三数；冻结 = 不可继续操作。

## 六、不动
- 现有 canvas 管线 / hit 动效 / 星星 / 列消失 / 音效 / PlayerHUD / AccountBlock / EventSelector 保留。
- 一格一注、无加注合并保留。
- 子账户划转 / 保险基金记账 / 强平费 UI 本期不做。

## 七、文件清单
- 新增：`src/features/pinpoint/constants.ts`、`src/features/pinpoint/amm.ts`
- 改：`src/features/pinpoint/hooks/usePinpointSession.ts`（核心重写）
- 改：`src/features/pinpoint/Grid.tsx`（p/odds、锁定窗、冻结遮罩、MMR 红光）
- 改：`src/features/pinpoint/Sidebar.tsx`（杠杆 toggle、三数披露、冻结禁用、MMR 颜色）
- 改：`src/routes/pinpoint.tsx`（modal 文案/按钮）
- 改：`DESIGN.md`（新增 Pinpoint 组件规则与 Don'ts）
- 改：`src/routes/style-guide.tsx`（新增 Pinpoint Tokens 演示区）
- 新增 memory：`mem://design/pinpoint-economics-ui`

## 八、验收
1. 远端格赔率 ≤100x，贴近现价 ≈1x；UI 同显示 `1/p` 与 `p%`。
2. $100 / 3x 单注：三数显示 `Margin $100 / Notional $300 / Win +$X(=q*(1-p))`。
3. 持续亏损 Margin Health 涨；到 100% 立刻冻结、无法再下注、modal 文案为「会话已冻结/清算中」。
4. 判定 >1.5s 的下注格可撤退 m；≤1.5s 的格子点击无效。
5. 杠杆 toggle 仅影响后续新单，已开腿 L 不变。
6. `/style-guide` 的 Pinpoint Tokens 演示与产品页样式完全一致。

确认无误后切 build 模式开干。
