## 目标

把 style-guide 里 single-market binary 与 multi-market(bundled binaries) event 两种事件结构清晰拆开，并修掉所有"上下文混着喊 yes/no 与 team alias"的不一致。

## 三条铁则（写进 Trading Language）

1. **Yes/No 只是底层技术 label**；当 market 提供 `sideLabels: { yes, no }` 时，用户文案永远使用别名（team 名）。
2. **绿 = YES 侧，红 = NO 侧** 是唯一承担 yes/no 语义的视觉信号；不再用 YES/NO 文字作为用户标签。
3. 同一个 market 内的所有展示（pill / 比例条 / 订单簿列头 / 仓位标签 / PnL 行）必须用同一套别名。

## 组件改动

### 1. `src/components/sports/SentimentCard.tsx`
- 新增可选 `sideLabels?: { yes: string; no: string }`。
- `RatioBar` 标签：有别名 → `Chelsea $1.24M / PSG $680K`；无别名 → `Yes $… / No $…`。
- 顶部 vs 区域已经渲染了 home/away 的 TeamCrest，保持。

### 2. `src/components/sports/OrderBook.tsx`
- 新增可选 `sideLabels?: { yes: string; no: string }`。
- 双栏列头：有别名 → `CHELSEA BOOK / PSG BOOK`；无别名 → `YES BOOK / NO BOOK`。
- 颜色规则保持（YES 侧绿/primary，NO 侧红/neon）。
- 顶部"NO mirrors YES"提示文案保留，但措辞改为通用："right side mirrors left · price = 100 − left_price"。

### 3. `src/components/sports/PositionsTable.tsx`
- 已经吃 `outcomeLabel`，无需大改；只在 demo 数据里区分 team alias 行 vs neutral 行（已做）。

### 4. 不动：MarketCard / OutcomePill / OutcomeSelector / TradeForm / MatchCard / EventHeader / LiquidationBar（这些已经按 team-first 模型工作）。

## Style-guide 章节重组

把原来"Market Card (11)" + "Trade Surface (12)"两个段落改成下列三段，演示三种事件结构并排出现，规则一眼可见：

### Section 11 — Binary Market · Single Market（单一市场二元）

**11a. Team-vs-team (aliased)** — 三列演示：
- `MarketCard` 用 `yes: { team: Chelsea, probability: 65, delta24h: +4 }, no: { team: PSG }`
- `SentimentCard` 传 `sideLabels: { yes: "Chelsea", no: "PSG" }`，比例条显示 `Chelsea $1.24M / PSG $680K`
- 迷你 `OrderBook` 列头 `CHELSEA BOOK / PSG BOOK`
- 段尾红色提醒条："YES / NO 不在用户视野出现 —— 颜色就是语义"

**11b. Neutral (no alias)** — 同样三列：
- `MarketCard` "Will it rain at kickoff?" yes/no
- `SentimentCard` 不传 sideLabels，比例条回退为 `Yes $… / No $…`
- 迷你 `OrderBook` 列头 `YES BOOK / NO BOOK`
- 段尾说明："只有当 market 没有 sideLabels 时，才会真的看到 Yes/No 字样"

### Section 12 — Multi-Market Event（事件聚合，B 模型）

演示一个 "UCL Final Night" 事件聚合页：
- 顶部 `EventHeader`：UCL · Tonight 21:00 BST · Aggregate Volume $X · 4 markets
- 下方 4 张 `MarketCard` 网格，每张都是独立二元，例如：
  - "Man City reach final?" — yes: Man City, no: "—" (neutral no side)
  - "Real Madrid reach final?" — yes: Real Madrid, no: "—"
  - "Bayern reach final?" — yes: Bayern, no: "—"
  - "PSG reach final?" — yes: PSG, no: "—"
- 重点说明："这是 4 个独立的 binary market 被同一事件聚合，每张卡内部仍遵循 Section 11 的规则；价格不互斥（4 个概率不加总到 100）"。
- 不引入新组件，仅复用 MarketCard + EventHeader + 段落文案。

### Section 13 — Trade Surface（原 12 段保留）
不动 demo 内容，但 `OutcomeSelector` / `OrderBook` 上方加一行小字："This event has `sideLabels: { yes: Man City, no: Real Madrid }` — YES/NO never shown."；`OrderBook` demo 传 sideLabels 后列头就会变成 `MAN CITY BOOK / REAL MADRID BOOK`，作为活样本。

### Section 14 — Trading Language（原 13 段，扩写）
新增小节 "Event types"，对照表：

| Type | Markets | Prices sum to | UI rule |
|---|---|---|---|
| Single-market binary (aliased) | 1 | 100 across yes+no | Team names everywhere, color = side |
| Single-market binary (neutral) | 1 | 100 across yes+no | Yes/No literal text |
| Multi-market event (bundled) | N | each market independent | List of cards, each follows row above |

并把现有"Color usage"行的 "primary = YES outcome / neon = NO outcome" 改写为"primary = YES side (默认绿/win 也接受) / neon = NO side"，与组件保持一致。

## 验收

- 在 style-guide 全文搜索：所有 `Yes/No` 字面文案要么在 11b 的 neutral demo 里，要么在 Trading Language 解释里；team match 演示区出现的 yes/no 字样数量 = 0。
- `SentimentCard` 在 Chelsea vs PSG demo 中比例条显示 `Chelsea / PSG` 而非 `Yes / No`。
- `OrderBook` 在 team match demo 中列头显示 team 别名。
- Section 11a / 11b / 12 三个段落视觉上能让人一眼区分事件结构。
