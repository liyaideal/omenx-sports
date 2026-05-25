## 调研结论：体育预测交易页通常包含什么

参考 Polymarket / SX Bet / Overtime Markets 的体育详情页，核心信息块基本固定：

1. **赛事头**：联赛 + 两队 logo + 比分/开赛时间 + 状态（Live/Upcoming/Final）+ Vol / Liquidity / Ends in
2. **二元选择**：YES / NO 两个大色块按钮，显示当前概率 %（= 价格 ¢）和"赔付倍数"
3. **价格走势图**：百分比折线（1H/6H/1D/1W/ALL）
4. **订单簿 / 最近成交**（Polymarket 简化、SX Bet 完整）
5. **下单面板**：Buy/Sell tab + 数量 + 限价/市价 + 预估收益
6. **持仓 & 订单**：当前持仓、挂单、历史
7. **规则 / 上下文 / 评论**

OmenX 的差异点在于"**合约杠杆**"：除了现货式买 YES/NO 份额，还能开多/开空 + 杠杆 + 保证金模式 + TP/SL + 强平价。

## 融合方案

把 Polymarket 风的「YES/NO 概率买卖」当成默认皮，把 OmenX 的「杠杆 / 保证金 / 强平价」叠加成一个"PRO 模式"开关在下单面板里。视觉上保持 Stadium Neon 的卡片语言。

YES/NO 的视觉表达：**用两队的队名/队徽直接替换 Yes/No 字样**（例：上海申花 / 山东鲁能），文字下方小字标注 YES 25¢ · payout 4.0x。中性问题（"会进决赛吗？"）才退回 YES/NO 字面。

---

## 要新增的组件（src/components/sports/）

### 一、Home/列表层
- **OutcomePill** — 单个 YES/NO 选项胶囊：队名 + 概率% + 赔付。两种 tone：`yes`(薰衣草) / `no`(品红)。是后面所有市场卡的原子。
- **MarketCard** — 体育预测市场卡：联赛徽 + 问题（"德比大战谁会是冠军？"）+ 两个 OutcomePill 横排 + Volume / Ends in / 参与人数。这是 Home 主体。
- **CountdownPill** — `2d 14h 32m` 倒计时，等宽数字，带圆点呼吸动效。
- **StatTile** — 余额 / 持仓 / 今日 PnL 的数据格子（Home 顶部状态条用 3-4 个并排）。
- **SectionHeader** — 「Trending Markets」标题 + 右侧 See all 链接 + 可选 tabs。

### 二、Trade 详情层
- **EventHeader** — 大版赛事头：联赛 chip + 两队 TeamCrest + VS + 开赛时间 + 状态 badge + 右侧 Vol / Liquidity / Ends。
- **OutcomeSelector** — 大尺寸 YES/NO 二选一（队名版），选中态有 neon ring + 渐变填充。
- **PriceChart** — 占位走势图（recharts AreaChart，纯静态 mock，主题色 = 当前选中 outcome 的色调）+ 时间区间 tabs（1H/6H/1D/1W/ALL）。
- **OrderBook** — 两列对照（YES bids / NO bids），价格 ¢、数量、累计。极简 12 行版即可。
- **TradeForm** — 下单面板，含：
  - Buy/Sell tab
  - Limit/Market tab
  - 数量输入 + Slider（25/50/75/Max）
  - **PRO 模式开关**（默认关）→ 打开后展开：杠杆 Slider (1×–20×) + 保证金类型（Cross/Isolated）+ TP/SL 输入 + 强平价显示
  - 摘要栏：Avg Price · Total Cost · Fee · Potential Win · Liq. Price（PRO 时）
  - CTA：`Buy YES @ 28¢`（颜色随 outcome）
- **PositionRow / OrderRow** — 持仓行 / 挂单行（mock 数据，含 PnL、ROE、平仓 / 撤单按钮）。
- **PositionsTable** — 包裹上面两个 Row 的 Tabs：Positions / Open Orders / History。
- **LiquidationBar** — 杠杆模式下用：入场价 / 当前价 / 强平价的水平刻度条。

### 三、对话/弹层（轻量包装现有 shadcn）
- **ConfirmTradeDialog** — 复用 `dialog`，下单确认。
- **DepositDialog** — 充值占位（仅 UI）。

> 现有 `MatchCard / PredictionCard / PlayerSpotlightCard / LeaderboardRow / StatChip` 保留，作为 Home 的二级模块（赛程、社区预测、球员聚光、积分榜）。

---

## /style-guide 更新

新增三段：
- **8. Market Primitives** — OutcomePill / CountdownPill / StatTile / SectionHeader
- **9. Market Card** — MarketCard 三种样态（队名二元 / 中性 Yes-No / Live 进行中）
- **10. Trade Surface** — EventHeader + OutcomeSelector + PriceChart + OrderBook + TradeForm（普通态 / PRO 杠杆态）+ PositionsTable

每段右侧给一句使用说明，让后续搭页面时直接复用。

---

## 技术清单

- 安装 `recharts`（PriceChart 占位）
- 在 `styles.css` 增加 outcome tone 工具类：`--yes`（复用 primary 薰衣草）、`--no`（复用 neon 品红），导出 `bg-yes/10`、`text-yes`、`ring-yes` 等
- 新增文件：`src/components/sports/{OutcomePill,MarketCard,CountdownPill,StatTile,SectionHeader,EventHeader,OutcomeSelector,PriceChart,OrderBook,TradeForm,PositionRow,OrderRow,PositionsTable,LiquidationBar}.tsx`
- 更新：`src/routes/style-guide.tsx`（新增三段 + 锚点目录）
- **不动**：Home/Trade 实际页面这轮不做，等组件确认后再搭

---

## 不在本轮

- 真实数据 / Web3 / 钱包
- 移动端响应式
- 评论、规则、社区 tab 这些非交易核心模块

确认后我开始写。
