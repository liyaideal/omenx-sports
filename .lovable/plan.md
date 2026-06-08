# 方案 A：对称漏斗 Bracket（desktop 全宽不横滑）

## 目标
把 `BracketView` 改成左右对称的漏斗结构（决赛居中），并在常见 desktop 宽度（≥1000px）下**完全装下，不出现横向滚动**。移动端继续走横向滚动 fallback（不在本次范围内做 tab 切换，保持改动聚焦）。

## 可行性核算
当前数据：R32(16) → R16(8) → QF(4) → SF(2) → F(1)，共 5 轮。
对称化后实际列数 = 4 + 1 + 4 = **9 列**（外侧 R32/R16/QF/SF 各拆成左右两半，决赛 1 列居中）。

在 1000px 可用宽度内（content area，已扣 padding）9 列要装下，单列必须显著瘦身。当前 240px 是为"球队全名 + 价格"留的，对称化后我们把外侧瘦窄、内侧略宽（视觉上的漏斗收口）：

```text
左 R32  左 R16  左 QF  左 SF   F    右 SF  右 QF  右 R16  右 R32
 96      104    112    120   132    120    112    104     96     = 996px
        gap 4px × 8 = 32px   →   总 ≈ 1028px（容器 padding 缩到 12px 即可）
```

`min-w-0` + 内部 `truncate`，球队名超出用 short code（已有 `BracketTeam.short`）兜底。

## 改动范围
仅 `src/components/sports/league/BracketView.tsx` 和 `src/routes/style-guide.tsx`（playground 同步）。数据层、`tournament.ts`、路由都不动。

## 实现细节（技术）

1. **拆分轮次**
   - 在 `BracketView` 入口把每一轮的 `matchups` 切成上下两半：`top = matchups.slice(0, n/2)`，`bottom = matchups.slice(n/2)`。
   - 决赛（最后一轮、只有 1 场）单独取出居中。
   - 容器从单一 flex row 改成：`[左半区列们] [决赛列] [右半区列们]`，右半区列顺序反转（QF → R16 → R32），让漏斗对称收口。

2. **列宽 & gap**
   - 用 token 数组：`const WIDTHS = [96, 104, 112, 120]`（从外到内），决赛列 `132`。
   - 列与列 `gap-1`（4px），外层 `p-3`。
   - 不再用 240 固定宽，`RoundColumn` 接收 `width` prop。

3. **垂直对齐（视觉收口）**
   - 每一列 `flex flex-col justify-around`，让卡片在该列高度内等距分布；外列 8 张，内列 1 张，自动产生漏斗形。
   - 移除当前基于 `columnIndex * 24px` 的硬编码 gap。

4. **MatchupCard 瘦身**
   - 内边距 `p-1.5`、字号 `text-[10px]`、价格仍 `text-[11px] font-mono`。
   - `TeamRow`：当列宽 ≤ 104 时只渲染 `team.short`；> 104 渲染 `team.name` 配 `truncate`。通过 `compact` prop 控制。
   - logo 从 5×5 缩到 4×4。
   - 隐藏 `kickoffLabel`（在对称紧凑模式下噪声太大，hover tooltip 可后续补）。

5. **右半区方向**
   - 右半区的 `MatchupCard` 让 logo 在右、价格在左（镜像），强化对称感。通过 `mirrored` prop 控制 `flex-row-reverse`。

6. **移动端 fallback**
   - `md:` 以上启用对称布局；`md:` 以下回退到现有单向横滚版本（`overflow-x-auto` + 原 240px 列）。
   - 用 `useIsMobile()` 钩子，或纯 CSS：`hidden md:flex` / `md:hidden` 双渲染。优先 CSS 双渲染避免水合闪烁。

7. **空轮次/奇数容错**
   - 如果某轮 matchups 为奇数（mock 数据不会，但留个保险），多出来的放进上半区。
   - 决赛缺席时退化为非对称布局（直接渲染左半区，不阻塞）。

## 不做
- 不画 SVG 连接线（方案 B 的事，且对称布局下视觉已足够清楚）。
- 不引入 tab 切换上/下半区（你没要求，desktop 装得下就没必要）。
- 不动 `BracketMatchup` / `BracketRound` 数据结构。

## 验收
- 1021px viewport（你当前窗口）：bracket 完全可见，无横向滚动。
- 1440px viewport：居中、留白舒适。
- 768px viewport（mobile fallback）：保持现状横滑。
- 决赛卡居中、左右严格镜像。
- 球队名在窄列下用 short code 不溢出。
- `/style-guide` 的 bracket 演示同步更新。

确认这个范围 OK 就开做。
