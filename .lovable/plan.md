## 目标
PRO 现在只剩 TP/SL，"PRO" 这层包装多余。直接把它改名为 `TP/SL`，去掉 Zap 图标和「PRO」概念。

## 改动
**`src/components/sports/TradeForm.tsx`**
- 折叠开关那一行：
  - 主标题 `PRO` → `TP/SL`
  - 副标题 `TP/SL` → `Take profit · Stop loss`（一句说明）
  - 移除 `Zap` 图标及其 import
- 内部状态变量 `pro` / `setPro` 重命名为 `tpslOpen` / `setTpslOpen`，默认仍为 `false`（收起）
- `{pro && (...)}` 渲染条件同步改名

逻辑、字段、计算保持不变。
