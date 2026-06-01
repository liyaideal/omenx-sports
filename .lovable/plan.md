## 改动

`src/components/sports/event/LiveTape.tsx`：行内的 `{f.price}¢ × {f.size}` 改为只显示 `{f.price}¢`，去掉 `× size`，避免泄露成交量。

列宽相应收窄：grid 第 4 列从 `110px` 改到 `64px`，让右端整体更紧凑。

`Fill` 类型和数据生成里的 `size` 字段保留（不影响别处，也方便以后内部使用），仅 UI 不再展示。

## 文件

- `src/components/sports/event/LiveTape.tsx`
