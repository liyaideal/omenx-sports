## 问题

冻结时 Sidebar 底部的红色按钮在 288px 宽度下折行成两段 ("SESSION FROZEN" / "· MMR 0%")，字号又是 `text-sm`，整体显得粗糙；而且网格里已经有一个大号 `SESSION FROZEN · MMR · NO NEW BETS` 红牌作为主提示，左下角再来一个大红块属于视觉冗余。

## 改动（只动 `src/features/pinpoint/Sidebar.tsx`，约 256–270 行）

把底部冻结指示器从「大红按钮」改成一条紧凑的状态条：
- 单行 `whitespace-nowrap`，保证不再折行。
- 字号降到 `text-[10px]`（stencil 字体），padding 收到 `px-3 py-2`。
- 视觉降级为「黑底 + 红色描边 + 红字」的告警条（与网格中央的大红牌形成主/次层级，而不是两个同等红块打架）。
- 左侧锁图标 `size-3`，右侧补一个小字 `NO NEW BETS` 与主标语并列，承担原来重复文案的提示功能。
- 不改条件渲染逻辑，仍只在 `frozen === true` 时出现。

不动：网格中央的 SESSION FROZEN 主红牌、Margin Health、Disclosure 等其它模块。
