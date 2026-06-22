## 问题诊断

进入 SEC-04 后看到的全是「猜测机制」（国旗 + 线索 + 4 候选），但**完全没说"猜对能拿什么"**。文案里隐含的奖励规则——*猜对解锁 1× Lucky Box Tier-01 抽奖位，而签名球衣本体在 Lucky Box 的奖池里*——只写在 `/style-guide` 的文档里，玩家在产品页根本看不到。"Guess the Legend" 在玩家脑中是断开的：它和抽奖之间缺了那根线。

## 解决思路（纯前端文案 + 信息架构，不动玩法）

在现有 Scoreboard chassis 顶部插入一条新的 **Mission Brief 横条**（在 `RoundProgressHud` 之上、Chassis 之内），统一回答三个新人最先问的问题：

```text
┌──────────────────────────────────────────────────────────────┐
│ MISSION                                                       │
│ Crack the signed-jersey vault — one retired legend per round. │
│                                                               │
│ 🎯 Pick the right legend before reveal day                    │
│ 🔓 Hit → 1× Lucky Box Tier-01 spin unlocks for you            │
│ 👕 The signed jersey itself drops into the Lucky Box pool →   │
│    [Open Lucky Box ↗] (anchor jump to SEC-03)                 │
└──────────────────────────────────────────────────────────────┘
```

设计落点：
- 一句 mission line + 一行 stakes line + 一颗"Open Lucky Box →"按钮锚跳到 SEC-03（用现有 tab 状态切换，不改路由）。
- 视觉上沿用 scoreboard 配色：`#0d0d0d` 底，amber 高亮关键词 "Lucky Box Tier-01 spin"，accent green 表示"reward unlocked"逻辑。
- 默认展开，加一个 `?` icon 让老用户折叠（用 `useState`，无后端、无 storage）——本次先省略折叠，默认全展开就好。

## 配套微调

1. **Round bay 顶部右侧那行 `2 / 3 CLUES LIVE`**：在它旁边加一行更小字号的副标 `HIT → +1 LUCKY BOX SPIN`，把"猜对的回报"贴近用户正在操作的位置。
2. **Lock-in 按钮文案**：从 `LOCK IN PICK` 改成 `LOCK IN · WIN 1 SPIN`，把奖励直接放进 CTA。
3. **Toast 文案**：locked 之后的 `Pick locked — waiting for reveal day` → `Pick locked — hit on reveal day unlocks 1 Lucky Box spin`。

不动玩法、不改数据、不动 Lucky Box / 其它 tab。

## 文件范围

- `src/components/sports/promo/GuessTheLegendTab.tsx` — 新增 `MissionBrief` 子组件并插入到 `ScoreboardChassis` 顶部；CTA 文案；toast 文案；Round bay 副标。
- 锚跳 SEC-03 用现有 tab 切换 prop（如 `onSelectTab`）即可；如果父组件没暴露，就用 `window` 滚动到 SEC-03 卡片 / 或暂以 disabled badge 形式呈现，等下一轮再接 wiring。我会先读 parent 看怎么接最干净再实现。
- `/style-guide` 的 Legend playground 同步加 `MissionBrief` 展示，保持 playground 与产品一致（遵循 Core memory 规则）。

## 不动的

- 数据 (`world-cup-carnival.ts`)、Lucky Box、奖品赔率、reveal 时机机制全部不动。
- 不引入新插画/品牌图。

## 验证

到 `/promo/world-cup?tab=legend` 截图，确认：第一屏就能读到「猜中 → 1× Lucky Box Tier-01 spin」+ 「签名球衣本体在 Lucky Box 抽」+ 可一键跳过去看奖池。