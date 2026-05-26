## 问题

1. 三列布局下左栏 ~320px，`Fans zone you` 标题换行，右侧 `Following · 2 teams` pill 被挤成两行。
2. 标题尾部的斜体 "you" 语法不通，纯装饰，去掉。

## 改动

### 1. `src/components/sports/dashboard/FanZoneHeader.tsx`

- 移除标题末尾的 `<span> you</span>` 装饰，标题就是 `Fans zone`。
- 标题降一档：`text-2xl` → `text-xl`，`leading-none`，`truncate`。
- 容器 `flex items-center justify-between gap-3`，标题块 `min-w-0`，pill `shrink-0 whitespace-nowrap`。
- Pill 文案简化：`Following · 2 teams` → `2 teams`（语义由 `Users` 图标承担）；`followingCount === 0` 时显示 `Add team`。
- Pill padding 收紧到 `px-2.5 py-1`，字号维持 `text-[10px]`。

### 2. `src/routes/style-guide.tsx` 第 16 节 Personalized Zone

更新 Hard rules：

```
Fans zone header is single-line at every column width.
- Title is "Fans zone" only — no decorative suffix.
- Title shrinks to text-xl; never wraps.
- Following pill collapses to "N teams" + Users icon; never wraps.
- Empty state pill shows "Add team".
```

并加一个 ~320px 宽度的窄列预览容器，演示紧凑形态用于回归。

## 不动

- 颜色 token、字体、pill 圆角与 ring。
- 下方 trade → poll → post 堆叠顺序与空态逻辑。
- 中/右两栏内容。
