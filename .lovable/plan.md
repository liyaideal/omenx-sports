## 统一 section header 行盒高度

### 改动

1. **`src/components/sports/dashboard/FanZoneHeader.tsx`**
   - 外层容器加 `min-h-9`
   - 标题去掉 `leading-none`，改 `leading-9`

2. **`src/routes/index.tsx` 内的 `SectionHeader`**
   - 外层 `flex-wrap` 容器加 `min-h-9`
   - `As` 标题加 `leading-9`

3. **`src/routes/style-guide.tsx` Section 17**
   - 追加一条规则：所有 section header 共用 `min-h-9 leading-9`，跨列基线对齐，禁止单独写 `leading-none`。

不动字号、stats meta、live 红点、wrap 行为。
