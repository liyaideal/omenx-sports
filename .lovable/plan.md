## 目标
把"猜球星"从 LuckyBox Tier-03 下挂的小卡片，升级为 `/promo/world-cup` 活动页的独立 tab——容器变大、决策从 1/8 降到 1/4、按国家分轮，悬念和命中率都更合理。

## 已确认决策
1. 同一国家可重复揭晓（例：巴西出现 Kaká 一轮、Carlos 一轮）
2. 干扰项球星由我从该国退役名宿池里挑（纯前端假数据，不涉及合作）
3. 揭晓顺序完全随机，UI 不显示倒计时数字，用 `next reveal: TBA`

## 已确认 8 国主池（含可能扩到 9）
Brazil（Kaká, Roberto Carlos）/ Spain（Iniesta）/ France（Vieira）/ Argentina（Zanetti）/ Germany（Lahm）/ England（Terry）/ Netherlands（Bergkamp）/ Portugal（Figo）

## 结构方案：单列 + 历史墙（Wordle Daily 风格）
不做三栏 broadcast 也不做满宽 album，原因：
- 三栏在 ≤1024 宽断点会被迫 stack，反而碎；
- 满宽 album 视觉重，和 LuckyBox 兄弟 tab 不一致；
- 单列窄容器（max-w-3xl 居中）能在桌面/移动一致，焦点清晰，符合"每周来揭晓一次"的克制感。

### 页面分区（自上而下）

```text
┌─────────────────────────────────────────────┐
│ Round Header                                │
│  Round #03 · clue 2 of 3 live   · next: TBA │
│  🇪🇸 SPAIN  (巨型国旗 + 国家名)              │
├─────────────────────────────────────────────┤
│ Clue Stack (3 行渐进式)                      │
│  ✓ C1  Midfield maestro, 6 La Liga titles   │
│  ✓ C2  Scored a World Cup winning goal 2010 │
│  🔒 C3  Unlocks after 60% community vote     │
├─────────────────────────────────────────────┤
│ Candidates (2×2 网格，4 张该国退役球星卡)     │
│  [Iniesta 42%] [Xavi 31%]                   │
│  [Puyol 14%]   [Villa 13%]                  │
│  选中态：琥珀描边 + 角标 ●                    │
├─────────────────────────────────────────────┤
│ Lock-in CTA (大琥珀按钮)                     │
│   "Lock in pick"                            │
│   Correct → 1× Tier-01 Basic Vault spin     │
├─────────────────────────────────────────────┤
│ Reveal Wall (横向 8 槽位 dot 进度)           │
│  ● ● ● ○ ○ ○ ○ ○      Your record: 1/2 hits │
│  hover 任一已揭晓 dot → 浮层显示该轮国家+球员 │
│  +用户当时的猜测对错                         │
├─────────────────────────────────────────────┤
│ Pre-warm Strip (窄行)                       │
│  ✦ Already signed for OmenX                 │
│  [Vieira 缩略图] [Y.Touré 缩略图]            │
└─────────────────────────────────────────────┘
```

### 4 种轮次状态（同一组件不同 state，会做到 /style-guide）
| 状态 | 触发 | 视觉 |
|---|---|---|
| `voting` | 当前轮进行中 | 候选卡可点，CTA 亮 |
| `locked-in` | 用户已锁选 | 已选卡保持高亮 + ✓徽章，其他卡变灰，CTA 变成 "Pick locked · waiting reveal" disabled |
| `revealed-hit` | 揭晓且用户猜对 | 正确卡翻转露出 ✓，错误卡灰；顶部横幅 "You hit it! 1× Tier-01 spin granted →" |
| `revealed-miss` | 揭晓且用户没猜对 | 正确卡翻转露出 ✓+王冠，用户原选卡显示 ✗；横幅 "Better luck next round" |

## 技术拆解（user 可跳过）

### 文件改动
1. **`src/data/world-cup-carnival.ts`** — 重写之前的 `SIGNED_JERSEY_REVEALS`：
   - 新 type `LegendRound { id, roundNumber, country, correctLegend, candidates[4], clues[3], status, userPick?, communityVote% }`
   - `LEGEND_ROUNDS: LegendRound[]` — 至少 5 条（2 已揭晓 + 1 当前 voting + 2 locked future placeholder）
   - 每国干扰项从这些退役名宿里挑（举例池）：
     - BRA: Kaká / R.Carlos / Cafu / Ronaldinho / Rivaldo
     - ESP: Iniesta / Xavi / Puyol / Villa
     - FRA: Vieira / Henry / Thuram / Makelele
     - ARG: Zanetti / Verón / Crespo / Riquelme
     - GER: Lahm / Schweinsteiger / Klose / Ballack
     - ENG: Terry / Lampard / Gerrard / Beckham
     - NED: Bergkamp / Seedorf / Davids / van der Sar
     - POR: Figo / Deco / Rui Costa / Nuno Gomes
   - `PREWARM_LEGENDS`: Vieira（已在主池）+ Y.Touré（不在主池，仅预热）
   - 不再删除 LuckyBox Tier-03 的 jersey 文案；只是不再下挂猜球星模块

2. **`src/components/sports/promo/GuessTheLegendTab.tsx`**（新文件）
   - 拼上面 6 个分区
   - 子组件：`RoundHeader` / `ClueStack` / `CandidateCard` / `RevealWall` / `PrewarmStrip`
   - 状态管理：本地 `useState` 模拟 voting → locked-in 转换（纯前端 demo，不入库）

3. **`src/routes/promo.world-cup.tsx`**（已存在，需读后改）
   - tabs 数组新增 `{ id: "guess-legend", label: "Guess the Legend", icon: ... }`
   - 插在 LuckyBox 之后
   - URL 参数 `?tab=guess-legend` 可直达

4. **`src/components/sports/promo/LuckyBoxSection.tsx`**
   - **撤掉**之前在 Tier-03 下挂的 `GuessTheNextLegendSection`（如果已加）
   - Tier-03 文案保留"signed jersey"作为奖项展示
   - 加一行小字 link："Guess who's next →" 跳到新 tab

5. **`src/routes/style-guide.tsx`**
   - 新增 "Guess the Legend — Round 4 状态" demo（voting / locked-in / revealed-hit / revealed-miss）
   - 新增 "Reveal Wall — dot 三态" demo
   - 删除之前的 8 选 1 playground

6. **`DESIGN.md` §7 Don'ts** 追加：
   - 猜球星模块禁止 8 选 1 全量曝光，必须按国家分轮 4 选 1
   - 禁止显示具体倒计时数字（揭晓周期不固定）
   - 干扰项必须是该国家真实退役名宿，不能虚构

7. **`mem://features/signed-jersey-reveal`** 更新：从"8 选 1 + 投票"改为"按国家分轮 4 选 1 + 独立 tab + Tier-01 spin 奖励"

### 不在本次范围
- 真实投票后端存储（纯前端 mock %）
- 跨用户排行榜（仅"Your record"）
- 实际 spin 发放管线（仅 UI 提示）
- Y.Touré 头像生成（用占位 + 之前用户上传的现场签名照）

## 实施顺序
1. 数据层（`world-cup-carnival.ts`）
2. 子组件 + Tab 主组件
3. 接入 `promo.world-cup.tsx` tabs
4. 撤掉 LuckyBox 下挂模块、加跳转 link
5. 镜像到 `/style-guide`
6. 更新 DESIGN.md + memory

批准就开工。
