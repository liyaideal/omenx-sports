## 组件与 OmenX 合约逻辑一致性审计 + 修复方案

按 OmenX 核心原则（价格=概率，YES+NO=1，永续合约带杠杆/保证金/TP-SL/强平，用户↔用户撮合，无赌博话术）逐个体检。

---

### ❌ 需要修复

**1. `OutcomePill` — `×payout` 是赌博赔率话术**
- 现状：右下角 `×(100/probability)`，等于 decimal odds。
- 改：删 `payout`；新增可选 `delta24h?: number`，显示 `+3¢` / `-1¢`（win/loss 配色），符合"价格"叙事。

**2. `MarketCard` — `participants` 字段口径**
- "X 人参与" 是赌博平台叙事。
- 改：字段重命名为 `openInterest`，icon 用 `Layers`，文案 `OI 1.2M`。

**3. `TradeForm` — 多处赌博词 + 杠杆语义不清**
- "Potential win" → 改为 **Est. PnL @ settle**，公式 `(1 - px/100) * notional - fee`（YES Long 视角，Short/NO 对称）。
- Buy/Sell tab 现在用 win/loss 绿红 → 越界。改为中性 outcome 色（YES = primary，NO = neon）。win/loss 只留给 PnL。
- 明确区分输入语义：用户输入是 **Margin (USDC)**，Notional = Margin × Leverage。summary 同时显示两者。
- CTA：普通模式 `Buy {Team} @ 28¢`；PRO 模式 `Long {Team} 5× @ 28¢` / `Short {Team} 5× @ 28¢`。
- 在 LiquidationBar 上方注释强平公式只是 mock。

**4. `OrderBook` — 保留两栏 spot 视图，但修正口径（D2 决策）**
- 保留 "YES 簿 / NO 簿" 并排（Polymarket spot 风），但：
  - 标题改为 `YES Book` / `NO Book`，左右对称都显示 Bid 侧（即"买入该方向"的挂单）
  - 列头 `Price · Size · Total` 不变
  - 配色保持 yes=primary / no=neon（这里属于 outcome 维度，合理）
  - 顶部加一行 **Spread** 与 **Mark price**，强调这是连续价格簿而非赔率板

**5. `PositionsTable` — 缺 OmenX 必要列**
- 新增：**Margin**、**Liq.**、**Mode**（Cross/Iso）、**ROE%**。
- "Side" 显示 `yes/no` → 改 `Long {Team}` / `Short {Team}`（用户视角的合约方向）。
- 列顺序：Market · Side · Size · Entry · Mark · Lev · Mode · Margin · Liq · PnL · ROE · 操作。

**6. `PredictionCard` + `VoteBar` → 改造为 `SentimentCard` + `RatioBar`（D1 决策 A）**
- `VoteBar` → 重命名 `RatioBar`，去掉 vote 语义，新增 `left/right` 双 tone（默认 win/loss 或 primary/neon），用于多空比 / 资金流向。
- `PredictionCard` → 重命名 `SentimentCard`：
  - 去掉社交计数（likes/comments/shares/flags）和 author 行
  - 保留 league + 两队 matchup
  - 中间放 **Long/Short Ratio**（来自持仓而非投票），下方两个数字：`Long: 1.2M USDC · 64%` / `Short: 680K USDC · 36%`
  - 底部一行 `OI 1.88M · 24h Δ +12%`
- 旧 `PredictionCard`/`VoteBar` 文件删除，引用点（style-guide）同步替换。

**7. `LiquidationBar` — 配色方向反直觉**
- 渐变改为：从 liq 端（红）→ current（accent），明确"距强平多远"。entry 标记保留灰色。

---

### ✅ 已经符合，无需改

`EventHeader` / `PriceChart` / `CountdownPill` / `StatTile` / `SectionHeader` / `OutcomeSelector` / `TeamCrest` / `LeagueBadge` / `NeonRing` / `StatChip` / `LeaderboardRow` / `MatchCard`、整体色板。

---

### 设计规范层（style-guide 新增一节）

**Trading Language Rules**：

- 词汇黑名单 → 替换为：
  - odds → price
  - bet / wager / stake → position / order
  - bookmaker / house → orderbook / counterparty
  - payout / win amount → settlement value / PnL
  - 中奖 / 输掉 → settle / liquidate
- 配色用途矩阵：
  - `primary`（lavender）= YES outcome only
  - `neon`（magenta）= NO outcome only
  - `win/loss` = PnL、ROE、强平、订单状态 only
  - `draw` = 中性 / pending
- 公式速查卡：Notional = Margin × Lev；PnL = (mark − entry)/100 × notional × side；ROE = PnL / Margin；Liq ≈ entry ∓ 100/lev（占位）。

---

### 改动清单

1. `src/components/sports/OutcomePill.tsx` — 删 payout，加 delta24h
2. `src/components/sports/MarketCard.tsx` — participants → openInterest
3. `src/components/sports/OrderBook.tsx` — 加 Spread/Mark 顶栏，标题改 YES Book/NO Book
4. `src/components/sports/TradeForm.tsx` — Margin/Notional 区分，文案/公式/CTA/配色重写
5. `src/components/sports/LiquidationBar.tsx` — 渐变方向调整
6. `src/components/sports/PositionsTable.tsx` — 新增列 + Side 改 Long/Short {Team}
7. **新增** `src/components/sports/SentimentCard.tsx` + `RatioBar.tsx`
8. **删除** `src/components/sports/PredictionCard.tsx` + `VoteBar.tsx`
9. `src/routes/style-guide.tsx` — 替换旧引用，新增 "Trading Language Rules" 章节
10. `.lovable/plan.md` — 归档本次审计

确认后我一次性改完。
