
# Homepage 改造方案：从"品牌站"变成"想下单"

方向定：**A 为主 + 关键紧迫信号**。不在 Featured 内嵌交易；砍掉全站 StatTile。所有改动只在 frontend。

## 核心策略

把首屏第一个 viewport（~777px）从「品牌叙事 + 全站数字」改成「品牌叙事 + 一个真实在动的市场」，让用户 1 秒内看见价格、概率、涨跌。后面的卡片网格通过 sparkline + live 脉冲传达"市场在动"。

## 改动一：Hero 重组（最关键）

当前：左侧大标题 + 右侧 NeonRing 装饰 + 下方 3 个 StatTile。
新版：

```text
┌─ Hero (≤520px 高) ────────────────────────────────────┐
│  Kicker                          │                    │
│  H1 + italic 副标题（压缩字号）   │  LIVE MARKET CARD  │
│  副文案（更短）                   │  （真实可点）       │
│  CTA: [Trade now →]              │                    │
│        Open positions ↗          │                    │
└──────────────────────────────────────────────────────┘
（删除 StatTile 行）
```

右侧 `LIVE MARKET CARD` 设计：
- 是 Featured 那场 RMA vs MCI 的浓缩交易卡（不是装饰）
- 顶部：UCL badge + 红色脉冲 LIVE dot + 倒计时 `47m`
- 中间：队徽 + 当前比分（mock `1 – 0`，体育感来源）+ 实时分钟 `67'`
- 价格行：`RMA 58¢  +4.2%`（涨绿色高亮 1.5s 周期脉冲）/ `MCI 42¢  -4.2%`
- 一条小 sparkline（24h），用 `PriceChart` 或新建轻量 inline SVG
- 底部 2 个按钮 `Buy YES 58¢` / `Buy NO 42¢` → 跳事件页（带预选 side）

这一张卡同时完成三件事：① 首屏给出价格 ② 给出体育感（比分/进行分钟）③ 给出紧迫感（脉冲 + 倒计时）。

NeonRing 装饰删除（已被市场卡取代）。

## 改动二：MarketCard 升级（视觉密度 + 动量）

不动 props 类型，只在卡片视觉上加：
1. **mini sparkline**：卡片底部"Vol / OI"那行之上，插入 24px 高的 24h 概率折线（绿/红跟随 delta24h 颜色）。数据 mock 内联，6–8 个点。
2. **live 脉冲**：`status="live"` 时，倒计时 pill 前面加一个 6px 红点 + `animate-pulse`。
3. **delta 高亮**：delta24h 绝对值 ≥3 时，OutcomePill 上的 delta 文本背景上一层 8% 透明同色块（绿/红），让"动得猛"的市场一眼能识别。
4. **悬停**：hover 时已经有 `-translate-y-0.5`，再叠加底部一条 1px 渐变线（`bg-gradient-neon`），暗示"可点击交易"。

改动文件：`src/components/sports/MarketCard.tsx`（约 +30 行）。这是组件级改动，会同时影响 style-guide 的展示和 homepage 的所有卡片网格——是改造的杠杆点。

## 改动三：Live now 和 Trending 视觉分层

当前两组卡视觉一模一样，用户分不清优先级。
- **Live now** 区背景换成 `bg-surface/40 + ring-1 ring-neon/10` 的浅色 strip 包裹（让它"亮"出来），SectionHeader 的 kicker `LIVE` 加红色脉冲点。
- **Trending** 区维持现状，但 SectionHeader 加 `+24h Volume Δ` 排序提示。
- Tabs（All/EPL/UCL/NBA）保留但暂时无交互。

## 改动四：Featured Event 区瘦身

当前的"Why it matters"段落文案信息密度低。改成：
- 左侧 EventHeader 保留（已经够好）
- 右侧"Why it matters"卡换成**3 个衍生市场的迷你列表**：
  ```
  Moneyline       RMA 58¢ · MCI 42¢      [Trade →]
  Total goals     Over 64¢ · Under 36¢   [Trade →]
  First scorer    Mbappé 22¢ · ...       [Trade →]
  ```
  每行一个 mini-row（高 56px），点击跳具体市场。让 Featured 从"宣传位"变"市场入口"。

不内嵌完整 TradeForm（用户决定）。

## 改动五：CTA 强化

Hero 主 CTA 文案：`Browse live markets` → `Trade tonight's match`（指向 Featured Event 的 #event-featured 锚，更具体）。
保留 `Open positions ↗`。

## 不改动

- `EventHeader`、`SectionHeader`、`MatchCard`、`TopBar`、`Footer`
- Trade Surface / OrderBook / TradeForm
- styles.css 设计令牌
- 数据结构 / 任何 prop 类型（只改视觉层）
- ticker 滚动条（用户没选 B，先不加；后续视觉密度不够再补）

## 影响范围

| 文件 | 改动 |
|---|---|
| `src/routes/index.tsx` | Hero 重写、删 StatTile、Featured 右侧改 3 行 mini-row、Live now strip 包裹 |
| `src/components/sports/MarketCard.tsx` | 加 sparkline、live 脉冲、delta 高亮、hover 底线 |
| `src/components/sports/HeroMarketCard.tsx` | **新建**：Hero 右侧那张实时市场卡（比分 + 实时分钟 + 价格 + sparkline + 双 Buy 按钮） |

style-guide 里展示 MarketCard 的地方会自动跟着升级，无需改 style-guide。

## 验收

改完后再截一次 full_page，对比：
1. 首屏（无滚动）是否能看见至少一个价格和一个"Buy"按钮
2. Live now 和 Trending 是否一眼能分层
3. MarketCard 整体是否有"在动"的感觉（sparkline + 脉冲）
