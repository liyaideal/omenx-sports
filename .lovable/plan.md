# Strikezone 杠杆模型重构：保证金 + 强平

## 经济模型

下注时：
- **stake = 保证金**（用户支付的本金）
- **名义价值 = stake × leverage**
- 入场扣 stake（和现在一致）

结算：
| 情况 | 触发条件 | 资金变化 |
|---|---|---|
| 赢 | K 线在结算时落在格子内 | 收回 stake × mult × lev |
| 平仓亏 | 结算时未命中且未爆仓 | 亏 stake |
| **强平爆仓** | 结算前 K 线偏离格中心超过强平距离 | 亏 stake，立即结算 |
| 退款 | 用户取消 / stopAll | 退还 stake |

**关键差异 vs. 现状**：现在「输」会扣 stake × lev；新模型「输」只扣 stake（保证金封顶），但加强平机制让高杠杆有真实风险。

## 杠杆档位调整

把档位从 `[1, 2, 5, 10]` 改成 `[1, 2, 3]`，最大 3x。

## 强平距离公式

```
liqDistance = LIQ_BASE / leverage   （从格中心算，单位 ¢）
LIQ_BASE = 4.5
```

| 杠杆 | 强平距离 | 直观感受 |
|---|---|---|
| 1x | ±4.5¢ | 基本不会爆，等于无杠杆 |
| 2x | ±2.25¢ | 偏离 ~2 行就爆，需要稍微贴近 |
| 3x | ±1.5¢ | 偏离 1.5 行就爆，明显紧张 |

3x 仍有真实强平压力但不会"开局秒爆"，体感平衡。

## 代码改动

### 1. `hooks/useStrikezoneSession.ts`

- `LEVERAGES = [1, 2, 3] as const`
- `StrikezonePosition` 加字段：`notional`、`liqDistance`、`liquidatedAt?`；`status` 多一种 `"liquidated"`
- `placeBet` 计算并存 `notional = stake * leverage`、`liqDistance = LIQ_BASE / leverage`
- `settlePosition` 重写：
  - `won`: `payout = stake * mult * lev`、`pl = payout - stake`
  - `lost` / `liquidated`: `payout = 0`、`pl = -stake`（去掉 extraLoss、去掉 `* lev`）
  - `refunded`: 不变
- 通过 `settlePosition(id, "liquidated", price)` 触发爆仓
- **迁移**：hydrate 后，把所有 `status === "open"` 的旧仓位退款 + 标 `refunded`，写 `migrationV: 2` 防重复

### 2. `Grid.tsx`

- `placeBet` 调用处传入新字段
- 每帧检查所有 open 仓位：`|priceRef.current - p.cellCenter| > p.liqDistance` → 触发强平
- 强平视觉：
  - 红色冲击波（复用 `HitFlashCell`，红色 + "LIQ" 文字）
  - 下注格子立即 `DyingCell` 红色快速淡出（120ms）
  - 弹红色 `-$stake LIQUIDATED` pop
- 渲染期间，每个 open 仓位在格中心 ± `liqDistance` 处画两条**强平虚线**（红 50% 透明）。高杠杆下贴近格子边缘，肉眼可见危险区
- `drawIdleCell` 在下注格子上画小 `⚠` 标记（仅 lev > 1）

### 3. `Sidebar.tsx`

杠杆卡片改为三档，副文案：
- 1x: `NO LEVERAGE · SAFE`
- 2x: `2× PAYOUT · LIQ ±2.25¢`
- 3x: `⚠ 3× PAYOUT · LIQ ±1.5¢`

`highRisk` 阈值改成 `leverage >= 3`。下注按钮副标显示「Margin $X · Notional $(X×lev)」。

### 4. `lib/multiplier.ts`

不动。

### 5. 历史/账单 UI

grep `status ===` 与 `"lost"` 使用点，给 `"liquidated"` 加红色 `LIQ` 徽章区分普通 `LOST`。

## 不在本次改动范围

- 强平阈值进一步调参（先用 `LIQ_BASE = 4.5`）
- 部分爆仓 / 维持保证金率等复杂机制
- /style-guide 同步（无新通用组件）

## 测试

实施后浏览器验证：
1. 1x 下注 → 行为不变
2. 3x 下注偏远格 → K 线偏出 1.5¢ 触发强平，亏 stake（不是 stake×3）
3. 3x 下注命中 → 收 stake × mult × 3
4. 刷新 → 旧 open 仓位被退款清空
