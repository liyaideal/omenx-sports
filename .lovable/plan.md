## OrderBook header 精简

**改动 `src/components/sports/OrderBook.tsx` 的头部区域：**

1. 删除右上角的 `MARK 22¢  SPREAD 2¢` 整块（每个 side 的 `LAST · SPREAD` 分隔条仍保留，信息不会丢）。
2. 删除副标题 `Two opposite sides of the same market`。
3. 重排头部为单行两列：
   - 左：`ORDER BOOK`
   - 右：`PRICE · SIZE · TOTAL`（列标题）
   两者垂直对齐在同一行。

**同步更新 `src/routes/style-guide.tsx`** 中 OrderBook 演示位下的 caption（如果还引用了被删的文案就一并清理）。

不动数据、配色、orderbook 行渲染逻辑。
