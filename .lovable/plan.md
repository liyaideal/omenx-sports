## 改动

在 `src/routes/style-guide.tsx` 的 `LegendAssetsInventory` 末尾追加一个第 5 节 **"Per-Round Clue Script & Correct Legend"**，把每一轮的"正确球星 + 三条线索 + 解锁顺序"以表格形式落地。数据全部从 `LEGEND_ROUNDS` 直接 derive，不复制硬编码字符串。

## 规则前置说明（一句话写死在小节顶部）

> 三条线索的位置 + 顺序在所有 round 里是恒定的：
> - **CLUE 1 · POSITION** — 一开局就解锁（reveal-on-launch）
> - **CLUE 2 · PEAK CLUB** — 社区投票破 30% 后解锁
> - **CLUE 3 · MAJOR TROPHY** — 社区投票破 60% 后解锁（最难的一条）
>
> 这套 idx → label 映射写死在 `LegendClueLabel` 类型里，前端不要重排。

（30% / 60% 阈值来源于 round-03 `unlockHint` 文案"Unlocks after 60% community vote"，30% 是中间梯度，符合现有 round-01/02 全部 revealed 的渐进逻辑；如果需要精确数字我先标 30% 占位、等产品确认。）

## 表格形态

每一行对应一个 round，列结构：

```text
ROUND │ COUNTRY │ CORRECT LEGEND │ CLUE 1 (open)  │ CLUE 2 (30%)   │ CLUE 3 (60%)
#01   │ 🇫🇷 FRA  │ Patrick Vieira │ DEF MID        │ ARSENAL        │ EURO 2000
#02   │ 🇦🇷 ARG  │ Javier Zanetti │ RIGHT BACK     │ INTER MILAN    │ COPA AMÉRICA 1991
#03   │ 🇪🇸 ESP  │ Andrés Iniesta │ CENTRAL MID    │ BARCELONA      │ WORLD CUP 2010 🔒
#04-08│  TBA   │ TBA            │ TBA            │ TBA            │ TBA
```

- 渲染时迭代 `LEGEND_ROUNDS`，活动/已揭晓的行直接取 `round.candidates.find(c => c.id === round.correctCandidateId).name` 和 `round.clues[i].value`。
- locked 的 clue 单元格加一个 🔒 + 灰色 + 显示 `unlockHint`，让"哪条最后解锁"在视觉上立刻读出来。
- upcoming 行用单一 `TBA` 占位行，避免重复 5 行噪音。
- 配色复用 `ACCENT/AMBER/MISS`：hit 行左侧 accent 边条、miss 行 miss 边条、voting 行 amber 边条，与 HUD 视觉一致。

## 不动的

- `LEGEND_ROUNDS` 数据 / `LegendClueLabel` 类型不改。
- 产品页 `GuessTheLegendTab` 不动。
- `LegendBayPlayground` 不动（它已经演示 4 个 state 切换，足够）。

## 验证

打开 `/style-guide#world-cup-carnival`，确认在 Assets & Tokens Inventory 下方新增了第 5 节，三行已开 round 的线索值与产品页 round bay 一致，第 3 列"MAJOR TROPHY 🔒"行显式标出"最后解锁"。