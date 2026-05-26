## 三个问题的修复

### 1) `Sports` 文字右侧被裁切

斜体 + `bg-clip-text` + `drop-shadow` 在容器右沿会被裁。`SPORTS` lockup 外层 `<span>` 加 `pr-1.5` 内边距，并把 `tracking-tight` 改成 `tracking-normal`（斜体下不再挤压字距）。这样 S 的右上倾斜尾巴和外发光都不会被截。

### 2) Header 宽度与页面内容不一致

`AppShell` 已经去掉了 `max-w-7xl`，整页是全宽；但 `AppTopBar` 内层容器还套着 `mx-auto max-w-7xl`，导致 header 比下方内容窄。

修复：把 `AppTopBar` 内层容器的 `mx-auto max-w-7xl` 去掉，改成 `w-full`，padding 用 `px-6 md:px-8`（和 `PageHeader` / 主网格 `px-6 md:px-8` 完全对齐）。

### 3) `PageHeader` 里的 `Sports` H1 删掉

Header lockup 已经清楚标识"OmenX → Sports zone"，页面内再来一个 `<h1>Sports</h1>` 是重复信息，且和 header 标题撞车。

修复：
- 删除 `PageHeader` 里的 `<h1>{title}</h1>` 标题
- 但 PageHeader 那一行的右侧"Equity 胶囊 + 三个 icon 按钮"也已经和新 header 右侧的 `Equity + Avatar` 重复 → 整个 `PageHeader` 组件不再需要，从 `index.tsx` 移除
- SEO 用的 `<h1>` 改在第一个内容 section 里加一个语义 H1（例如 "Live & upcoming markets"），保留单 H1 + 关键字

可选简化：直接删 `PageHeader.tsx` 文件并清掉 `index.tsx` 里的引用与渲染。

### 受影响文件
- 编辑 `src/components/sports/dashboard/AppTopBar.tsx`（修 1 + 2）
- 编辑 `src/routes/index.tsx`（移除 PageHeader 用法，给现存某个 section 标题升级为 h1 以保 SEO）
- 删除 `src/components/sports/dashboard/PageHeader.tsx`
