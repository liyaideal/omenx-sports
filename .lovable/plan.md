## 任务卡状态 + CTA 跳转修复

### 问题
1. 现在任务卡只有 3 个状态（`todo` / `in-progress` / `done`），缺少**已达成但未领取**的状态。Welcome pack 的所有奖励都需要用户**主动点击领取**，不会自动发放，前端如果按现有模型实现会做错。
2. T-02 `Deposit now` 和 T-03 `Open events` 现在点击只弹 toast，没有真实跳转。

### 改动

#### 1. `src/data/world-cup-carnival.ts` — 扩展状态机为 4 态

```ts
status: "locked" | "in-progress" | "claimable" | "claimed"
```

| 状态 | 含义 | CTA 示例 |
|---|---|---|
| `locked` | 前置条件未满足（如要先完成 T-01） | `Locked` 禁用 |
| `in-progress` | 用户在做但还没达成阈值 | `Deposit now` / `Open events` 等行动按钮 |
| `claimable` | **已达成阈值，等待用户点击领取**（新增） | `Claim 20 U` 高亮按钮 |
| `claimed` | 已领取 | `Claimed` 禁用 + ✓ |

为每个任务新增 `ctaHref` 真实链接（同时支持 `external: boolean` 以便区分 OmenX 主站新窗口 vs 同站内跳转）：

- T-01 register: `claimed` (示例数据保持)
- T-02 first-deposit: 拆成两条示例数据用于 demo（实际 mock 设为 `in-progress` + `Deposit now` → `omenxUrl.wallet()` external）
- T-03 first-trade: `in-progress` + `Open events` → `/league/world-cup-2026?view=games` internal
- T-04 invite: `in-progress` + `Copy invite link`（保持现行复制逻辑）

#### 2. `src/components/sports/promo/NewbieRewardsSection.tsx`

- `StatusPill` 增加 `claimable` 状态（绿色脉动 `READY TO CLAIM`），`locked` 状态保留。
- `TaskCard` 按钮逻辑：
  - `claimed` → 禁用灰色 `Claimed`
  - `claimable` → 实心绿色高亮 `Claim {reward}`，点击 → toast 模拟领取
  - `in-progress` → 边框绿色，按 `ctaHref` + `external` 决定：
    - external（如 wallet） → `<a href target="_blank" rel="noopener noreferrer">`
    - internal（如 `/league/...`） → TanStack `<Link to=...>`
  - `locked` → 禁用，按钮文案 `Locked`
- 底部进度条颜色按状态：`claimed`/`claimable` 满绿，`in-progress` 半绿，`locked` 灰。

#### 3. `/style-guide` 新增 Playground

在 `src/routes/style-guide.tsx` 的 carnival 区块下新增 "Newbie Task Card — 4 状态" 演示组：把同一张 T-02 卡片以 `locked` / `in-progress` / `claimable` / `claimed` 四种 mock 数据并排展示，并附说明：
> 所有奖励都必须用户点击 `Claim` 按钮才会发放，达成阈值 ≠ 自动入账。

#### 4. `DESIGN.md` §7 Don'ts 新增一条
> Welcome / quest 任务卡不允许"达成即自动发放"。完成阈值后必须进入 `claimable` 中间态等待用户点击 `Claim`，避免后端漏发或用户误以为没拿到。

### 不动
- `omenxUrl` 配置文件（已有 wallet）
- 真实任务进度数据、`useComboState`、`/league/world-cup-2026` 路由本身
- T-04 复制邀请链接逻辑（已是手动行为）
