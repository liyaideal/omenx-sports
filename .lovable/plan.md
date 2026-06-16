## 问题分析

你看到的两个问题都在 `CarnivalFlagsMarquee` 和 `ScoreboardHero` 的国旗条上：

### 1. 国旗上下的"黑线"
在 `ScoreboardHero.tsx` 里，上下两条国旗轮播被包在带边框的容器里：
- 顶部：`<div className="border-b border-zinc-900/80">`
- 底部：`<div className="border-t border-zinc-900/80">`

这些 1px 的 `zinc-900` 深色边框在记分牌的黑色背景上看起来就是一条贴着国旗的黑线。设计原意是模拟 LED 屏的分隔线，但视觉上变成了"脏边"。

### 2. 国旗拼接处会"断"
`CarnivalFlagsMarquee` 用的是经典"复制一份轨道 + `translateX(-50%)`"的无缝滚动写法，但 flex 容器用了 `gap-2`（每两面国旗之间 8px 间距）。

问题是：`gap` 只在**相邻元素之间**生效，最后一面国旗和第二份轨道第一面国旗之间是有 8px 间距的，而第一份轨道**起点之前**没有间距。当动画从 `-50%` 跳回 `0` 时，这 8px 的不对称就导致视觉上会有"跳一下/对不上"的瞬间——就是你截图里的接缝错位。

## 修改方案

### A. 去掉黑线 — `src/components/sports/promo/ScoreboardHero.tsx`
- 顶部条：去掉 `border-b border-zinc-900/80`，保留容器本身（仍需要它做 overflow 裁剪定位）。
- 底部条：去掉 `border-t border-zinc-900/80`。
- 这样国旗就和记分牌主体之间没有突兀的深色分隔线，过渡更顺滑。

### B. 修接缝 — `src/components/sports/promo/CarnivalFlagsMarquee.tsx`
把 flex 的 `gap-2` 去掉，改成给**每面国旗**加 `marginRight`（比如 8px）。这样：
- 第一份轨道的最后一面国旗后面有 8px；
- 第二份轨道的第一面国旗前面没有间距，但因为上一面国旗自带 mr-2，所以视觉上仍然是 8px；
- `translateX(-50%)` 现在恰好等于"一份完整轨道（含末尾 margin）"的宽度，循环回到原点时位置完全一致，接缝消失。

实现上保留现有的 `FLAG_CODES`、`reverse`、`opacity`、`height` 属性和动画 keyframes，不改 API、不改 `/style-guide` 的展示。

### C. 验证
- 打开 `/promo/world-cup`，看顶部 `ScoreboardHero`：
  - 国旗条上下不再有黑色细线；
  - 慢动作观察循环点（约 60s / 80s 一次），不再有跳动。
- 顺便检查 `/style-guide` 中的 `CarnivalFlagsMarquee` demo 不受影响。

不修改业务逻辑、不动其他模块，纯视觉修复。
