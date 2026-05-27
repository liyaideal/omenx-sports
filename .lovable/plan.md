# Event 交易页 + PRO 模式完善 Plan

style-guide §13 已经把骨架（EventHeader / OutcomeSelector / PriceChart / OrderBook / TradeForm / PositionsTable / LiquidationBar）做完了；这次把它装成真路由，并把 `TradeForm` 里 PRO 模式（TP/SL、Liq）从展示态升级成可用逻辑。Isolated 保持 "soon"，本期只动 Cross。

---

## Part A — 路由 & 数据装配

### 1. 新路由 `src/routes/event.$id.tsx`

URL `/event/$id`，结构：

```text
AppTopBar
← Back to dashboard
EventHeader (league / 队伍 / kickoff / volume / liquidity / endsIn)
┌──────────────────────────────┬──────────────────────┐
│ OutcomeSelector              │ TradeForm (sticky)   │
│ PriceChart (tone 跟选中)     │ 360px 列             │
│ OrderBook                    │                      │
└──────────────────────────────┴──────────────────────┘
PositionsTable
```

- `loader`：调 `getMarketById(params.id)`，找不到 `throw notFound()`。
- `head()`：用 market.title 设置 title / og:title / og:description。
- `errorComponent` + `notFoundComponent`：按 tanstack-errors-notfound 模板。
- 选中 outcome 用 `useState`，切换时同步 PriceChart tone 和 TradeForm。
- `≤1024px` 单列堆叠（TradeForm 放最下面，先不做 drawer）。

### 2. 数据聚合

`src/data/sports-markets.ts`：

```ts
export const ALL_MARKETS: SportsMarket[] = [
  FEATURED_MATCH, ...MATCH_MARKETS, ...LEAGUE_WINNERS, ...PLAYER_PROPS, …
];
export const getMarketById = (id: string) => ALL_MARKETS.find(m => m.id === id);
```

把所有 `tradeHref: omenxUrl.markets()` 替换为 `` `/event/${id}` ``。

### 3. 跳转改内部链接

- `MatchMarketCard` "View on OmenX" 改 "Open event"，用 `<Link to="/event/$id">`。
- `PlayerPropsSpotlight` Share：复制 `window.location.origin + tradeHref`。
- 整张卡的外层链接改为内部 `<Link>`。

---

## Part B — TradeForm PRO 模式完善（仅 Cross）

### 4. Margin mode 仍是 Cross/Iso 二选一 UI，Iso 保持 disabled

- 维持现有 "soon" 徽章和 disabled 状态，不动结构。
- Liq 计算只走 Cross 公式：`buffer ≈ (balance * 0.9) / (notional / 100)`，溢出 clamp 到 1..99。
- Summary 加一行 `Margin mode: Cross`（明示当前模式，便于以后接 Iso）。

### 5. TP / SL 真校验 + 收益预览

- 输入支持 0–100 的数字（¢）；超出范围 / 反向即时标红 + 错误文案。
- 校验规则：
  - YES 仓：TP 必须 `> px`；SL 必须 `< px` 且 `> liq`
  - NO 仓：方向相反
- PRO 区下方新增 mini 预览：
  - "If TP hits → +X.XX USDC"
  - "If SL hits → −X.XX USDC"
  - 公式：`pnl = (target/100 − px/100) * notional * sign − fee`
- 校验失败时 CTA disabled，并在按钮上显示原因（"Fix TP/SL"）。

### 6. Liq 可视化升级（`LiquidationBar`）

- 加入 TP / SL marker（绿色 / 黄色），位置 = `pct(tpValue)` / `pct(slValue)`，仅在数值有效时显示。
- `min/max` 扩展到包含 tp/sl，避免溢出。
- marker hover tooltip："Take profit 78¢ · +120 USDC"。
- 底部加 0¢ / 50¢ / 100¢ 刻度。
- 当前价 marker 加 `animate-pulse`。

### 7. 下单提交

- CTA `onClick`：把状态拼成 mock order，`toast.success("Order placed · " + ctaLabel)`，不连后端。
- 校验未通过 → `toast.error`。

---

## Part C — 不动 & 不做

- 不连 OmenX 后端、不写真实交易服务。
- 不实现 Isolated margin（保持 "soon"）。
- 不动 AppTopBar / FansZone / Spotlight 已完成的交互。
- PositionsTable 沿用现有 mock。
- 不引入新依赖（toast 已是 sonner）。

---

## 文件清单

- 新建：`src/routes/event.$id.tsx`
- 改：`src/data/sports-markets.ts`（聚合 + 内部 tradeHref）
- 改：`src/components/sports/TradeForm.tsx`（TP/SL 校验、预览、Cross liq 公式、提交 toast）
- 改：`src/components/sports/LiquidationBar.tsx`（TP/SL marker、刻度、tooltip）
- 改：`src/components/sports/dashboard/MatchMarketCard.tsx`（内部 Link、菜单文案）
- 改：`src/components/sports/dashboard/PlayerPropsSpotlight.tsx`（Share origin 拼接）

确认后我开工。
