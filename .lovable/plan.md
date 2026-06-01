## 目标
PRO 模块只保留 TP/SL 输入及其 PnL 预览，移除 Cross/Iso 切换和 Liq 区块；并默认收起（开关 off）。

## 改动
**`src/components/sports/TradeForm.tsx`**
- PRO 副标题由 `Cross/Iso · TP/SL · Liq` 改为 `TP/SL`
- `{pro && (...)}` 内只保留：TP/SL 两个输入（323–348 行）+ If TP/If SL PnL 预览（350–365 行）
- 删除：Cross/Isolated 切换块（298–321 行）、Liquidation 区块（367–393 行）
- `pro` 默认值保持 `false`（收起）
- 不动 leverage 滑块（仍在 PRO 之外）和计算逻辑；`liq`/`LiquidationBar` 引用如不再使用则一并清理 import
