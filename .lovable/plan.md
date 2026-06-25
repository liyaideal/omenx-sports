## 问题

左栏底部的小字 `NO MANUAL CLOSE · BETS RESOLVE AT JUDGEMENT` 跟 Rules 弹窗里 04 条已经说的内容完全重复：

> 04 — Click your own bet to cancel & refund the margin … **No active close — bets resolve at judgement or get liquidated if account MMR ≥ 100%.**

放在 Sidebar 底部既占视觉空间，又让用户每次都要看一遍同一句规则，没有额外信息量。

## 改动

**1. `src/features/pinpoint/Sidebar.tsx`**
- 删掉底部那块 `NO MANUAL CLOSE · BETS RESOLVE AT JUDGEMENT` 的小字（含外层 wrapper 与 `title` tooltip，约 270–280 行附近）。
- 不替换成别的内容，让 Sidebar 自然收尾在 Account / Disclosure 区块下方，整体更紧凑。

**2. `src/routes/pinpoint.tsx`（Rules 弹窗 04 条）**
- 保留现有 04 条文案不动，作为该规则的唯一出处。
- 可选微调：把 "No active close" 这半句加粗或单独换行，让用户在 Rules 里更容易扫到（不改语义）。

**3. `src/routes/style-guide.tsx`**
- 同步删除第 3628 行附近的 "NO MANUAL CLOSE BUTTON · BETS RESOLVE AT JUDGEMENT OR LIQUIDATION" 演示，保持 playground 与产品一致。

## 不动的部分

- Rules 弹窗本身、入口按钮、cancel/lock window 逻辑都不变。
- Sidebar 其它模块（Account、Leverage、Disclosure、Margin Health）布局不动。
