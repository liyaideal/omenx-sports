# Season Events 卡片行内对齐

## 问题

当前 `LeagueWinnerMarketCard` 和 `TopScorerMarketCard` 都是按内容自适应高度：

- Winner 一般 3–4 个 outcome
- Top scorer 通常只有 2 个

放在 `xl:grid-cols-2` 网格的同一行，两张卡高度不同 → footer（Settles / Vol）一上一下，看起来乱。

## 方案

让每张卡填满 grid row 的高度，footer 用 `mt-auto` 钉到底部。Header + body 在顶部，footer 在底部，同行卡片的 footer 自然对齐。

### `src/components/sports/dashboard/LeagueWinnerMarketCard.tsx`
- `<section>` className 加 `flex h-full flex-col`
- outcomes 列表外层 `<div className="flex flex-col divide-y ...">` 加 `flex-1`（占满剩余空间，footer 被推到底）
- footer 不变（`mt-3` 即可，已经在 flex 列尾）

### `src/components/sports/dashboard/TopScorerMarketCard.tsx`
- 同样：`<section>` 加 `flex h-full flex-col`
- 列表外层加 `flex-1`

### `src/routes/index.tsx`
- Season 左列 grid 加 `items-stretch`（grid 默认就是 stretch，但显式写出来防止以后被覆盖）；无需其它改动

## 效果

- 1280px+：同一行两张卡顶对齐 + 底（Settles/Vol）对齐
- 1021px 单列：每张卡仍按内容收缩（h-full 在 grid item 里只在多列时才"撑高"，单列模式由 grid row 决定）

## 不动的地方

- 卡片内 row spacing、字体、PricePill、header 结构
- Spotlight 侧栏（已 sticky + h-fit）
- 数据源、排序、链接逻辑
