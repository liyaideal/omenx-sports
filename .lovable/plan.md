## 交付文档：Lucky Box 累积抽奖券模型

按 delivery-doc skill 骨架产出，写到 `/mnt/documents/lucky-box-tickets-spec.md`，然后以 artifact 交付。

### 文档骨架

```
# Lucky Box 抽奖券模型（Lucky Box Tickets）— 交付说明 v2

> 本次将 Lucky Box 从"每天限选一个 tier、机会当日清零"改为
> "达标即发券、券永不清零"的累积模型。前端本次仅落 UI + mock
> 状态，发券/持久化由后端在下一版接入。研发以本文档为准；v1
> 的"active / surpassed / locked 三态"和"每日单次 spin"逻辑
> 已废弃。

## 1. 功能目标
一句话产品定位 + 关键约束（每 tier 独立累积、跨天保留、只消耗券）。

## 2. 券的发放与消耗规则
表格：三列 tier / 门槛 / 发券条件；一段说明"跨门槛发券"示例
（1,100 U → T1+1、T2+1、T3+0）。

## 3. 状态与 UI 对照
表格对比 v1 → v2：
| 维度 | v1 | v2 |
| 抽奖资格 | 每日仅最高达标 tier | 各 tier 独立按券判定 |
| 券寿命 | 当日清零 | 永不清零 |
| 卡片状态 | active / surpassed / locked | hasTicket / noTicket |
| 按钮 | Open vault / Used today / Outgrown | Open vault ×N / Trade more… |
| 徽章 | YOUR TIER / CLEARED / NEXT UP+LOCKED | ×N TICKETS / +X U TO EARN |

## 4. 用户端流程
- 4.1 头卡（SEC-03）
  - Today's volume 数值
  - 新副标题文案（原文引用）
  - Ticket ledger 行：`TICKETS READY  T1 ×N  T2 ×N  T3 ×N`
  - 零券态：`NO TICKETS YET — REACH 100 U TODAY TO EARN YOUR FIRST`
- 4.2 Volume ladder
  - 节点点亮条件改为"volume ≥ 门槛 或 该 tier 券 ≥ 1"
  - Caption：有券 `Tickets ready · spend any time`；无券沿用旧文案
- 4.3 Tier 卡片
  - 两态渲染（列 hasTicket 与 noTicket 差异表）
  - 抽奖交互：点击 → spin 2.2s → toast + 券 -1；可连击直至清零
  - 已废弃 hasSpun 单次限制

## 5. 数据 / 状态（前端）
- `TicketMap = Record<tierId, number>`
- `deriveInitialTickets(volume)`：mock seeding（每个达标 tier 各发 1 张）
- 状态 owner：`LuckyBoxSection` 本地 useState，未接入 Cloud
- 说明：真实持久化 + 跨门槛计数由后端在 v3 落地

## 6. 已删除 / 已废弃（v1 → v2）
表格列出：`TierStatus` 三态、`computeActiveIndex`、`isFirstUnreached`
prop、`hasSpun` 状态、`CLEARED / NEXT UP / LOCKED` 徽章、"Used today
/ Outgrown · higher tier active" 按钮文案。

## 7. Style Guide
`/style-guide#lucky-box`：三条 fixture 已存在
（volumeOverride = 80 / 1240 / 6000），本次自动覆盖两态；无需新增。

## 8. 涉及文件
前端：
- `src/components/sports/promo/LuckyBoxSection.tsx`（唯一改动）

数据/后端：无。奖池数据 `src/data/world-cup-carnival.ts` 未动。

## 9. 未变更项
- 奖池奖品、概率、`LuckyBoxPrize/LuckyBoxTier` 类型、tier 门槛
- 抽奖动效、reel、toast、GUESS WHO'S NEXT 入口
- 按钮对齐、`flex-1` 奖品列布局
- 移动端 / 桌面端整体布局未变
```

### 交付
写完后用 `<presentation-artifact>` 挂出文件路径。
