## 目标
下单摘要（快捷抽屉和事件详情页的下单区共用同一个 `TradeForm`）只保留：
- Margin
- Contracts
- Est. PnL @ settle

## 改动
**`src/components/sports/TradeForm.tsx`**（约 398–413 行的 `<dl>` 摘要区）
- 删除：`Avg price`、`Margin mode`、`Notional`、`Fee`、`Liq price` 这 5 行 `SummaryRow`
- 保留：`Margin`、`Contracts`、`Est. PnL @ settle` 共 3 行
- 不动计算逻辑（`notional` / `fee` / `liq` 等仍参与下单 toast 描述和后端字段），只是 UI 不再展示

因为 TradeDrawer 与事件详情页的下单区均渲染同一个 `TradeForm`，一次修改即可同步生效，无需再改其他文件。
