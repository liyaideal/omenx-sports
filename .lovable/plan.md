# 重新设计 Scoreboard Hero 顶部信息排版

## 问题
当前 `LIVE PRIZE POOL` 贴在左上角、`ENDS IN` 贴在右上角，中间是巨大的 `3,000,000 U`，三者隔得太远、视觉脱节，看不出"标签 → 金额 → 倒计时"是一个整体。

## 方案（按选中的 v2 方向）
把顶部那行做成一条**居中的信息条**，宽度限制为 `max-w-2xl`，紧贴在大数字正上方：

- 左侧：红点 + `LIVE PRIZE POOL`
- 右侧：`ENDS IN` 小标签叠在倒计时上方（两行右对齐）
- 下方一条 `border-b border-white/10` 把它和大金额分隔开，但又靠得很近

这样三个元素挤在同一个垂直中轴线上，读起来就是一个完整的"奖池播报"组件，而不是散在角落的三块。

## 改动范围
只动 `src/components/sports/promo/ScoreboardHero.tsx` 里的 top row：
- 删掉原来的 `flex justify-between` 满宽布局
- 删掉右上那个独立的 `min-w-[180px]` 黑色倒计时框（视觉太重）
- 新结构：`mx-auto max-w-2xl` 的居中 row，左右两端对齐 + 底部细分隔线
- 倒计时数字稍微缩小（保持 `text-sm`），让它服务于大金额而不抢戏

其它元素（旗帜跑马灯、角标、大数字、奖杯背景、底部 subline）全部保持不变。

## 同步
- `/style-guide` 里直接复用同一个 `<ScoreboardHero />` 组件，无需额外改动
