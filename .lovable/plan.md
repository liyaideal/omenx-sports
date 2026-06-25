# Cross Margin 改造

把"单仓爆仓"换成"账户级强平"。

## 经济模型

| 项 | 公式 |
|---|---|
| 入场 | 扣 `stake`（保证金，不变） |
| 单仓赢 | 收 `stake × mult × lev` |
| 单仓输（正常到期） | 已扣 stake，无额外（不变） |
| **实时 equity** | `balance + Σ(开仓中：当前价在格子内 ? stake × mult × lev : 0)` |
| **维持保证金阈值** | `maintenance = 0.15 × Σ(开仓 stake)` |
| **强平触发** | `equity ≤ maintenance`（连续 2 帧成立才触发，防抖） |
| 强平时 | 全部 open 仓按"当前价是否在格子内"二元结算；不在格内的全部判 `liquidated`、亏 stake；在格内的判 `won`、按 mult×lev 赔付；之后弹"LIQUIDATED"模态 |

这样 cross 的张力来自：你的余额被多笔大下注掏空、同时这些仓位都不在格子里 → equity 撑不住维持线 → 一起爆。杠杆通过放大 stake×mult×lev 的潜在收益让 in-cell 仓位救场能力更强，但 out-cell 时对 equity 毫无贡献，等于"你押得越大越激进，越快爆"。

## 代码改动

### 1. `hooks/useStrikezoneSession.ts`

- 移除 `liqDistance` / `liquidatedAt` / `notional` 字段（不再需要单仓爆仓信息）。`liqDistanceFor` 和 `LIQ_BASE` 删除。
- 保留 `status: "liquidated"`，含义改为"被账户强平"。
- 新增 selector / helper `computeEquity(state, livePricesByOutcome)`：
  - 入参：state + 每个 outcomeId 当前价（Grid 在用同一个 ticker，传 map 即可，也可只传 `activeOutcomeId → price` 用于当前事件；其它事件的开仓按上次已知价处理，先简化为只看当前事件）。
  - 简化版：组件层算好 equity 后直接传入 hook 的 `liquidateAll(price, predicate)` action。
- 新增 action `liquidateAll(currentPriceByOutcome)`：遍历所有 open 仓位，按当前价格 in-cell/out-cell 分别结算 won / liquidated，调用现有 settle 逻辑。
- 持久化 key 不变（上一轮迁移已经把旧 open 清掉了）。

### 2. `Grid.tsx`

- **删除**：per-position 实时距离检测（`liquidatedLocalRef`）、`onLiquidate` prop、红色 LIQ 虚线、`drawLiquidateBurst` 调用（函数本身可保留用于全局爆仓特效）。
- 全局强平由父组件统一触发，Grid 收到 effects 后只负责画结算特效（已有 win burst / lose fade / 现在也接 liquidate kind 当作"红色 lose"渲染）。

### 3. `routes/strikezone.tsx`

- 每个 ticker 帧（已有 `useEffect` on `tickSec`）里：
  1. 先做正常到期结算（不变）。
  2. 算 `equity = balance + Σ in-cell ? stake×mult×lev : 0`（只对当前事件的 open 仓位；多事件先简化）。
  3. 算 `maintenance = 0.15 × Σ stake(open)`。
  4. 如果 `equity ≤ maintenance` **且** 上一帧也成立（用 `liqArmedRef`）→ 触发 `liquidateAll`，弹 `showLiquidated` 模态。
- 移除 Grid `onLiquidate` 回调。
- 新模态 `<LiquidatedModal>`：红色大字 "LIQUIDATED · ACCOUNT WIPED"、列出 N 个仓位的亏损总额、按钮 `RESET ACCOUNT`（调 `reset()`）/ `CONTINUE`（仅关闭模态，balance 还有就继续）。

### 4. `Sidebar.tsx`

- 杠杆卡片副文案改为不再提单仓 LIQ ±X¢：
  - 1×：`NO LEVERAGE · SAFE`
  - 2×：`2× PAYOUT · CROSS RISK`
  - 3×：`⚠ 3× PAYOUT · HIGH CROSS RISK`
- 在 BALANCE 卡下方新增一行 "MARGIN HEALTH" 进度条：
  - 比例 = `min(1, max(0, (equity - maintenance) / (initial - maintenance)))`
  - 颜色：>60% 青绿、30–60% 琥珀、<30% 红色脉动
  - 数字显示 `EQUITY $X / MAINT $Y`
- equity 由父组件每帧算好传进来（新 prop `equity`、`maintenance`）。

### 5. 视觉与文案

- 全局强平触发时：屏幕轻微红色震动 80ms（在 `sz-root` 上加临时 class），所有 Grid 的下注格子瞬间变红淡出（复用现有 `drawLiquidateBurst`）。
- toast 不弹（被模态替代）。

## 不在本次范围

- 多事件持仓的 equity 聚合（当前只统计 active event 的仓位；多事件持仓的 mark 仍按"上次见到的价"处理，先简化为"非当前事件仓位按入场价 in-cell 估值"——实际就是 +stake×mult×lev 当成中性贡献。如果用户后续拉多事件玩再补）。
- 维持保证金率 0.15 的调参，先固定。
- 部分爆仓（一次只平到 equity 回升到维持线以上）——直接全平。

## 测试

build mode 后浏览器跑一遍：
1. 1× 杠杆连下 100 笔 $100 → balance 用完后，下一笔被余额检查拦截，不会触发爆仓
2. 3× 杠杆把 balance 大部分压在远离当前价的格子 → 一旦 K 线远离这些格子且未命中，equity ≤ maintenance → 全平、弹模态
3. equity 接近维持线时 health bar 变红脉动
4. 中途有一笔进入格子内时 equity 回升、模态不触发
