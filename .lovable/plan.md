## 目标

`/league/world-cup-2026?view=bracket` 里的 bracket 卡片只展示两支球队（保持现状），但点击进入的 `/event/<matchup-id>` 必须是 1X2 三选项 market（home / draw / away），而不是当前的二选项 binary。

## 现状

- `src/data/tournament.ts` 的 `BRACKET_MARKETS` 里每个 matchup 生成的是 `shape: "binary"`，`outcomes: [home, away]`。
- 因此详情页走的是 binary 渲染分支（单交易按钮、共享 order book），缺少 Draw。
- `BracketView` 只读 `homePrice` / `awayPrice` 来画卡，跟 outcomes 数量无关。

## 改动

仅改数据生成层 `src/data/tournament.ts` 中的 `BRACKET_MARKETS`：

1. 把 `shape` 从 `"binary"` 改成 `"three-way"`。
2. `outcomes` 改为三项：`home`、`draw`、`away`。
   - Draw 概率派生：`drawPrice = round(1 - homePrice - awayPrice, 2)` 当 `homePrice + awayPrice < 1`；否则给一个合理保底（如 `0.18`）并按比例缩放 home/away 让三者归一。
   - Draw outcome 形如 `{ id: "draw", label: "Draw", price: drawPrice, delta24h: 0, meta: "X" }`（沿用现有 `isDrawOutcome` 识别规则，不挂 team）。
3. `kindLabel` 改成 `"${round.label} · 1X2"` 以反映三选项。
4. 给每个 matchup 在源数据里加一个可选 `drawPrice?: number`，让 R16/QF/SF/Final 这种"实际不可能平的淘汰赛"也允许 mock 一个 90 分钟平局概率（说明：详情页是 90 分钟 1X2 市场，加时/点球不计）。先全部使用第 2 步的自动派生即可，不需要逐场手写。

## 不动的地方

- `BracketView.tsx`：仍然只渲染 `home` / `away` 两行 + 各自 price，不展示 Draw。
- `EventOutcomesPanel`：已经按 `outcomes.length` 自动分支，三选项会自动走 multi-outcome 渲染，无需改组件。
- Binary event 的既有规则（2 outcome 不嵌套 YES/NO）不受影响。
- Group winner / 其它现有 markets 不动。

## 验证

- 打开 `/league/world-cup-2026?view=bracket`：卡片仍是两行球队 + 概率，无 Draw。
- 点击任一 matchup → `/event/r32-1` 等：详情页 outcomes 面板出现 3 个选项（含 Draw），每个 outcome 有独立 YES/NO 与 order book。
- 全局 grep 确认 `BRACKET_MARKETS` 之外没有再写死 binary fixture 用例。
