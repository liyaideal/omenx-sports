## 目标

Season Events 区块在多联赛数据下左列变得很长，右侧 Spotlight 被拉伸出现大片空白。重排版让左列以 2 列卡片网格铺开，右侧 Spotlight 不再被拉伸而是 sticky 跟随。

## 改动

### `src/routes/index.tsx` — Season section（约第 177-194 行）

把内层 `<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">` 改为：

- 外层网格仍是 `lg:grid-cols-[minmax(0,1fr)_320px]`（右栏缩到 320 给左栏更多呼吸空间，仍能容纳现有 Spotlight 视觉）。
- 左列容器从 `flex flex-col gap-5` 改为 `grid gap-5 xl:grid-cols-2`，并把 `SEASON_LEAGUE_GROUPS.map` 的每个 group 拍平成两个独立 card（不再 group 嵌套），按 Winner、Top scorer、Winner、Top scorer… 顺序写入网格。
  - 在 `< xl`（含当前 1021px 视口）保持单列堆叠，外观与现状一致但 Spotlight 不再拉伸。
  - 在 `≥ xl (1280)` 自动变成 2 列，6 张卡 = 3 行，整体高度砍掉 50%。
- 右列 `<PlayerPropsSpotlight ...>` 包一层 `<div className="lg:sticky lg:top-4 lg:self-start">`，让 Spotlight 跟随滚动且不被左列高度拉伸。

### `src/components/sports/dashboard/PlayerPropsSpotlight.tsx`

`<section className="... h-full ...">` 改为 `h-fit`（或去掉 `h-full`）。h-full 让组件吃满父容器高度，是当前空白的根因；改成自适应自身内容高度后，sticky + self-start 才能正确生效。

### `DESIGN.md`

§5 Layout Principles 末尾新增 1 条规则：

> Side-rail panels (Spotlight, sticky filters) must use `self-start` + intrinsic height, never `h-full`. 长内容栏要么 wrap 成多列网格 (≥xl 2 col)，要么用 tab/分页收敛高度，避免侧栏被拉出空白。

§7 Do's and Don'ts 加 1 条 Don't：

> Don't put a tall single-column list next to a stretching `h-full` side panel — the side panel will leak whitespace. Wrap the list in a `xl:grid-cols-2` grid and switch the side panel to `self-start`.

### `mem://design/section-side-rail`

新增 memory 记录：sticky 侧栏必须 self-start + h-fit；多卡 season 列表 ≥ xl 转 2 列。

### 不动
- LeagueWinnerMarketCard / TopScorerMarketCard 内部样式。
- 数据层 SEASON_LEAGUE_GROUPS。
- 左侧 Fans zone、上方 Live & upcoming、底部 OmenX bridge。
- /style-guide（本次仅 layout 规则，不新增组件 demo）。

## 验证
- 1021px 视口：左列保持单列，Spotlight 不再拉伸到底，下方空白消失。
- 1280+ 视口：左列变 2 列，6 张卡均匀分布；右侧 Spotlight 仍 sticky 在顶部。
- 滚动时 Spotlight 跟随到 `top-4` 后吸顶。