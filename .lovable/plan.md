## 目标

Lucky Box 从"每天单选一 tier、机会当日清零"改成"累积抽奖券"模型：

- 每笔交易累计当天 volume。今日 volume 首次跨过某 tier 门槛（100 / 1,000 / 5,000 U），对应 tier +1 张券。
- 三个 tier 各自独立，例：今天做到 1,100 U → T1 +1、T2 +1、T3 0。
- 券永久保留，跨天不清零；只减不加（除非再次达标）。
- 抽奖只消耗券，不再校验"当天是否仍达标"。

## UI 变化

### 1. 头卡文案微调
副标题改为：`Every time your daily volume crosses a tier threshold, you earn 1 ticket for that vault. Tickets never expire — spend them any time.`（去掉旧的 "one spin per day"）

### 2. Volume ladder
- 保留梯子、today's volume token。
- 节点点亮规则改为"是否曾解锁过（今日达标 或 券数 ≥1）"，不再区分 active/surpassed。
- 下方 caption 改为：
  - 有券可抽：`Tickets ready · spend any time`
  - 无券且未达标：保留 "Reach 100 U to earn your first ticket"

### 3. Tier 卡片（券信息集中放这里，不做顶部账簿条）
- 状态简化为两态：`hasTicket`（点亮） / `noTicket`（暗）。移除 active/surpassed/locked 三态互斥蒙层。
- 右上角徽章：
  - 有券：`× N TICKETS` 徽章，用该 tier accent 色实底。
  - 无券但今日已达标（券刚用完）：不显示徽章。
  - 无券且未达标：`+X U to earn` 虚线徽章。
- 奖池标题旁的 `100 U POOL` 保留。
- 进度条区域文案：
  - 有券或今日达标：`Ticket earned at {threshold} U volume` + 100% 满条（accent 色）。
  - 未达标：`+X U to earn a ticket` + 进度百分比（现状）。
- 按钮：
  - 有券：`OPEN VAULT ×N`（N 券数，实底 accent）
  - 无券：`+X U to earn a ticket`（或达标但已用完则 `Come back tomorrow to earn more`）
  - 抽奖中：`Spinning…`
- 每次点击消耗 1 张券；可连续点直到该 tier 券数归零。移除 `hasSpun` 单次限制。

## 数据 / 状态

仅改 `src/components/sports/promo/LuckyBoxSection.tsx`；`world-cup-carnival.ts` 不动。

```ts
type TicketMap = { basic: number; premium: number; grand: number };
const [tickets, setTickets] = useState<TicketMap>(() =>
  deriveInitialTickets(todayVolume) // 首屏按 today's volume 一次性发放
);
```

- `deriveInitialTickets(vol)`：对每个 tier，`vol >= tier.volumeUnlock ? 1 : 0`（前端 mock 语义）。
- 抽奖成功回调：`setTickets(t => ({ ...t, [tierId]: t[tierId] - 1 }))`。
- `spin()` 条件改为 `tickets[tier.id] > 0 && !spinning`。

真实"跨门槛发券 + 跨天保留"由后端实现，前端本次只保证模型和 UI 表达正确。

## Style-guide 同步
`src/routes/style-guide-homepage.tsx` 中 Lucky Box 段落新增两条 fixture：`tickets = {2,1,0}` 与 `tickets = {0,0,0}, volume=0`，覆盖两态。

## 不改动
奖品/概率、抽奖动效、GUESS WHO'S NEXT 入口、按钮对齐、`world-cup-carnival.ts` 类型与阈值。
