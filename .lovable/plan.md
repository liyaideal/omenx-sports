## 结论

你的理解是对的：如果 Pinpoint 子账户本身就是 cross margin / 联合保证金池，那么爆仓不应该只没收 open positions 的 stake，而应该把整个 Pinpoint 子账户可用余额也一起归零。

现在的实现是“保证金下注账户”：开仓时只扣 `stake + fee`，爆仓时只把 open positions 的 `stake` 记为亏损，剩余 `balance` 保留。这和我们现在想表达的“Pinpoint 子账户 = 一个独立 cross-margin 风险池”不一致。

## 要改成的产品语义

- 主站 OmenX wallet 不受影响。
- Pinpoint balance 是用户主动转入的独立风险池。
- 只要进入 Pinpoint cross-margin 交易，所有 Pinpoint balance 都是这一池的 equity buffer。
- 触发 liquidation 时：
  - 所有 open positions 被强平。
  - Pinpoint balance 归 0。
  - session P/L 增加一笔“account wipe loss”，使 P/L 和余额对得上。
  - session 状态保持 `frozen`，因为账户已经没钱，必须从主钱包重新 transfer/top up 后才能继续。

## 实施计划

### 1. 修正底层会计逻辑

文件：`src/features/pinpoint/hooks/usePinpointSession.ts`

- 修改 `liquidateAll()`：
  - 继续把所有 open positions 标成 `liquidated`、`payout = 0`。
  - 计算 liquidation 总损失：
    - open position margin loss：所有 open positions 的 `stake`。
    - remaining balance wipe：当前 `s.balance`。
  - 返回 state 时设置：
    - `balance: 0`
    - `sessionPL: s.sessionPL - openStakeLoss - s.balance`
    - `sessionStatus: "frozen"`
    - `frozenMmr / frozenAt` 保留用于 UI。
- 保持 `deposit()` 逻辑：充值后自动 `sessionStatus: "active"`，余额恢复后才能继续下注。

### 2. 修正弹窗金额展示

文件：`src/routes/pinpoint.tsx`

- `setShowLiquidated` 增加 `balanceWiped` 或 `accountWiped` 字段，用来展示这次爆仓不只是 margin lost。
- 弹窗从：
  - `MARGIN LOST . -$x`
  - `PINPOINT BAL $4677`
- 改成类似：
  ```text
  POSITIONS .... 03
  MARGIN LOST .. -$x
  BALANCE WIPED  -$y
  PINPOINT BAL .. $0
  ```
- 文案强调：
  - `PINPOINT ACCOUNT WIPED`
  - `MAIN OMENX WALLET WAS NOT TOUCHED`

### 3. 修正左侧 AccountBlock 展示

文件：`src/features/pinpoint/AccountBlock.tsx`

- frozen 时：
  - balance 必须显示 `$0`（由底层 state 驱动）。
  - MARGIN 行继续显示 `LIQUIDATED`。
  - 下方 `TAP + FUND TO RESUME →` 保留。
- 保留刚刚已做的换行修复，不再显示 `MMR 0%`。

### 4. 检查所有 frozen 门禁是否符合语义

文件：`src/features/pinpoint/Sidebar.tsx`、`src/routes/pinpoint.tsx`、`Grid.tsx`

- 保留 frozen 禁止新下注逻辑。
- 保留 frozen alert / grid overlay。
- 确认只有 `deposit()` 能解除 frozen。

## 验收标准

- 触发 liquidation 后，Pinpoint BAL 立即变成 `$0`。
- SESSION P/L 反映整个 Pinpoint 子账户被 wipe 的损失。
- Grid 和 Sidebar 仍显示 frozen，不能继续下注。
- 点击 `+ FUND` / `TAP + FUND TO RESUME` 打开充值面板；充值后恢复 active，可以继续交易。
- 主站 wallet 不被 liquidation 扣款，只在用户主动 transfer 到 Pinpoint 时扣款。