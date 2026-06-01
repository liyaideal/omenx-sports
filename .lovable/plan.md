## 改动

### 1. `RelatedMarketsBar.tsx` 标签改名

- 左侧 `Markets` → `Related Events`（小标题文案，不动组件名/props）

### 2. `event.$id.tsx` 位置调整

- 从 `EventDetailHeader` 下方移除当前的 `<RelatedMarketsBar … />` 块
- 放到底部 `<PositionsTable …/>` 上方（同一个 `<div className="px-6 pb-28 …">` 容器内，PositionsTable 之前，加点上下间距）

### 3. style-guide 同步

- `src/routes/style-guide.tsx` 里 RelatedMarketsBar 演示位置不动，仅文案 demo 自然跟着组件走（无需改）

## 文件

- `src/components/sports/event/RelatedMarketsBar.tsx`
- `src/routes/event.$id.tsx`