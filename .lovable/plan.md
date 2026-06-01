## 改动

### 1. Draw 用统一 icon（`EventOutcomesPanel.tsx`）

`Glyph` 现在对 Draw 走 fallback —— 显示字母 "D"。改为：在 `outcome.team` 缺失时调用 `isDrawOutcome(outcome)`，若为真则渲染 `DrawIcon`（`Equal`，已在 `src/components/sports/draw.tsx` 定义，与 `EventMarketTileCard` 用法一致），其它中性 outcome 才 fallback 到字母。视觉外圈保持原来的 ring/glow，只换图标本身。

### 2. Live tape 右侧对齐（`event/LiveTape.tsx`）

当前 grid 是 `1fr_auto_auto_auto_auto`，导致 BUY/SELL 徽章、outcome 名、价格、时间四列宽度随内容浮动，所以每行右端"歪"。

改成固定列宽 + 右对齐：
- grid 改为 `1fr 56px 96px 110px 32px`（user / side / market / `px × size` / ago）
- side 徽章 `w-full text-center`（不再 `inline` 自适应）
- market 名 `text-right truncate`，宽度固定 96px
- `px × size` 单元右对齐，`tabular-nums` 保证数字位宽一致
- ago `text-right`

结果：所有行右端形成一条清晰的对齐线。

### 3. "Outcome" 文案改 "Market"

按照项目术语：**event** = 问题本身，**market** = 其中某个选项。这是显示给用户的文案，不动 `outcomeId` / `outcome` 这些代码字段名（改了会牵连数据层）。

- `EventOutcomesPanel.tsx` 头部 `Outcomes` → `Markets`；`{n} options` → `{n} markets`
- `trade/TradeOutcomePicker.tsx`：`Pick outcome` → `Pick market`；`Pick side · X` 保持（"side" 是 yes/no 维度，不是 market）

不动 `PositionsTable` 表头里的 `Market` —— 它本来就叫 Market，正是这次术语的目标用法。

### 4. 去掉 Positions 表的 Mode 列（`PositionsTable.tsx`）

只在 positions 表（`PositionTable`）里删除：
- `<Th className="text-right">Mode</Th>`
- 对应 `<Td>{r.mode}</Td>`
- 类型 `PositionRowData.mode` 保留（mock 数据仍带这个字段也不影响），仅 UI 不再显示

Open Orders 和 History 表本来就没有 Mode 列，不动。

## 文件

- `src/components/sports/event/EventOutcomesPanel.tsx`
- `src/components/sports/event/LiveTape.tsx`
- `src/components/sports/trade/TradeOutcomePicker.tsx`
- `src/components/sports/PositionsTable.tsx`
