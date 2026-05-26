# 把 Leverage 从 PRO 折叠里拿出来

## 背景

当前 `TradeForm` 默认形态等同现货：只有 Buy/Sell + Amount + 百分比快捷键，Leverage 被藏在 "PRO · Leverage" 折叠开关里。但这是合约预测市场（永续/带杠杆的 binary perp），杠杆是核心心智，不是高级功能。需要把 Leverage 提到默认可见位置，PRO 只保留真正的"高级"项。

## 变更范围

仅前端 UI：`src/components/sports/TradeForm.tsx` + `src/routes/style-guide.tsx` 的交易区文字说明。无业务逻辑变化。

## TradeForm 新结构

```text
┌─ Buy / Sell ───────────────────────────┐
├─ Market / Limit          Bal 5,000 USDC┤
│                                         │
│  [Margin (USDC)        ............5000]│
│  [25%] [50%] [75%] [100%]               │
│                                         │
│  Leverage             1× ─────●──── 20× │   ← 始终可见
│  Notional = 5,000 × 3 = 15,000 USDC     │   ← 实时提示
│                                         │
│  ⚡ PRO    Cross/Iso · TP/SL · Liq  [○] │   ← 折叠
│  ┌─ (展开后) ─────────────────────────┐ │
│  │  [Cross | Isolated]                │ │
│  │  [TP ¢]  [SL ¢]                    │ │
│  │  Liquidation bar (当 lev>1)        │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Avg price / Margin / Notional /        │
│  Contracts / Fee / Est. PnL / Liq price │
│                                         │
│  [ SELL REAL MADRID 3× @ 62¢ ]          │
└─────────────────────────────────────────┘
```

## 关键决策

1. **Leverage slider 永久显示**，紧跟在 Amount 快捷键下方；范围 `1×–20×`，默认 `1×`。
2. **Amount 输入框统一改名 "Margin (USDC)"**（不再随 PRO 切换 label）。下方加一行小字提示：`Notional = Margin × Leverage = X,XXX USDC`，让用户对杠杆放大效应有直观感知。
3. **PRO 折叠保留这些"真·高级"项**：
   - Margin mode（Cross / Isolated）
   - TP / SL 输入
   - Liquidation bar + Liq price 估算说明
   - PRO label 文字从 "PRO · Leverage / Margin, TP/SL, Liq price" 改为 "PRO · Cross/Iso · TP/SL · Liq"
4. **Liq price 行**在 summary 区的展示规则不变：当 `leverage > 1` 时显示（无论 PRO 是否展开）。
5. **CTA 文案规则**：`leverage > 1` 时始终带 `{n}×`，例如 `SELL REAL MADRID 3× @ 62¢`；`1×` 时省略，避免噪音。
6. **Summary 行**：`Margin` 行改为始终显示（不再门控在 PRO 下），因为现在 Margin 是默认输入概念。

## 文案 / 设计规范同步

`src/routes/style-guide.tsx` 中 Trade Surface 章节：
- 更新示意截图描述：Leverage 列为默认控件，PRO 描述去掉 "Leverage" 字样。
- 在 Trading Language 加一条规则："Leverage 是合约预测市场的一等公民，默认可见；PRO 仅承载 Cross/Iso、TP/SL、Liq 可视化等高级项。"

## 不动的部分

- 颜色语义（green=YES / red=NO / outcome accent on CTA）不变
- `sideLabels` / `outcomeLabel` 团队别名规则不变
- LiquidationBar、SummaryRow、Field 等子组件 API 不变
- 真实下单 / 撮合 / 风控逻辑（本来就是 mock）不动
