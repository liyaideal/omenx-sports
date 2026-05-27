把队徽从底部三段市场条迁移到中间的比分条，给底部三段腾出充足的横向空间，确保三个赔率完整显示。

1. Scoreboard 比分条（poster 底部居中胶囊）
   - 在主队 short 左侧加主队 logo（h-4 w-4，圆形/object-contain）。
   - 在客队 short 右侧加客队 logo。
   - 胶囊整体保持现有圆角 + 背景模糊，仅增加两个小 logo。
   - Draw 没有 logo，不影响（比分条只展示主客两队）。

2. 底部 segmented market bar
   - 移除每个 segment 内的 `<img>` 队徽与 Draw 的 `X` 圆形占位。
   - 每段只剩：短 label（队名/DRAW）+ 价格。
   - segment 内部布局：`flex items-baseline justify-center gap-1.5`，label 用 `font-mono text-[10px] uppercase tracking-widest text-muted-foreground`，价格 `font-display text-sm font-semibold tabular-nums`。
   - 加 `min-w-0`，label 允许 `truncate`，price `shrink-0`，确保三段都能完整展示。
   - 保留段间 `border-r border-white/[0.06]` 分隔线和整条 hover 高亮。

3. 不改的内容
   - LIVE pill、联赛缩写、计时器、play 按钮、poster 图。
   - footer（Streaming now / 人数 / Vol）。
   - 卡片外框、圆角、阴影。

技术细节：只改 `src/components/sports/dashboard/LiveStreamCard.tsx`。增加 `fixture.home.logo` / `fixture.away.logo` 到 scoreboard 渲染；删除 outcomes map 内的 logo/占位 JSX；调整 segment className 实现安全收缩。