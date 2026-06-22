## 问题

Welcome Pack / Combo Challenge / Lucky Box 三个 tab 都是整宽布局（撑满 Carnival 容器），切到 Guess the Legend 时整个 scoreboard chassis 被 `mx-auto w-full max-w-3xl` 收成中等宽度居中，左右大量留白，tab 切换时视觉宽度突变，确实不和谐。

根因在 `GuessTheLegendTab` 根节点：

```tsx
// src/components/sports/promo/GuessTheLegendTab.tsx:95
<div className="mx-auto w-full max-w-3xl">
  <ScoreboardChassis>...</ScoreboardChassis>
</div>
```

## 改动

仅改两行 className，无逻辑 / 数据变更。

1. `GuessTheLegendTab` 根容器去掉 `max-w-3xl`，改为与其他 tab 一致的整宽：`w-full`。ScoreboardChassis 自身的边框/螺栓/扫描线保持不变，只是 chassis 现在跟着 Carnival 容器整宽延展。
2. 内部 8 格 LED `RoundProgressHud` 当前是 `grid-cols-8`，在更宽的容器里每个 tile 会被拉得过大；保留 `grid-cols-8` 但给容器加 `max-w-3xl mx-auto` 让 HUD 内的 tile 保持现有手感（avoid 把单个国旗 tile 撑成 desktop 上的巨型方块）。同样的 `max-w-3xl mx-auto` 也包到 ActiveRoundBay / CandidateBoard / SignedArchiveStrip 的内部内容区——chassis 拉满，内部 layout 仍然居中阅读宽度。

  → 这样既解决"tab 切换时左右留白突变"，又保持 scoreboard 模块内部的紧凑节奏。

3. `LegendScoreboardDemo`（style-guide § 1）与 `LegendBayPlayground` 同步去掉外层 `max-w-3xl` 限制，保持 playground 与产品一致（mem://index Core）。

## 不动

- chassis 视觉（边框厚度、螺栓、扫描线、glare）
- HUD / Bay / Board / Archive 五个模块的内部组件与数据
- 其他三个 tab 的布局
- DESIGN.md 的 scoreboard 视觉作用域规则