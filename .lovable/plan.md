## 目标

把当前简化版 `ComboChallengeSection`（4 个空 slot + 一个 picker sheet）替换为符合 PRD v1.0 的完整活动页结构，保留在 `/promo/world-cup?tab=combo` tab 内。视觉延续现有 Carnival LED / Orbitron + Chakra Petch 风格，不引入新主题。

## 范围

- 完整本地状态机（无后端，所有 API 用 `setTimeout` mock）
- Share Card 只做预览态（不导出 PNG，不接 html-to-image）
- Mock 比赛数据自行扩充（Group + R16 + QF + SF + Final ~20 场，每场 3 个 moneyline outcomes，部分场带 display-only Total/Spread）

---

## 1. 页面结构（在 ComboChallengeSection 内）

```text
ComboChallengeSection (tab=combo)
├── CampaignHero            顶部品牌+规则一句话+剩余 entries
├── FilterBar               Stage / Matchday / Team search / Availability
├── 两栏布局
│   ├── 左：MatchSelector
│   │   └── MatchCard[]     1 场 1 卡，3 个 moneyline 按钮
│   └── 右（desktop sticky）：
│       ├── ComboBuilder    4 个 leg 槽 + stake 输入
│       ├── QuotePreviewPanel
│       └── CTA
├── SubmitConfirmModal      二次确认
├── RequoteModal            旧/新赔率对比
├── TicketSuccessPanel      出票成功 → Share my Combo
├── TicketStatusList        已出 ticket 列表（mock 几条不同 status）
└── ShareCardPreview        点 Share 弹出 1080×1350 预览卡（不下载）
```

Mobile：滤器+卡片纵向流式，底部 sticky 显示 `n/4 · odds · stake · CTA`。

## 2. 状态机

```text
PageState: LOADING_CONFIG → READY → PREVIEW_LOADING → PREVIEW_READY
         → SUBMITTING → (TICKET_ACCEPTED | REQUOTE_REQUIRED) → ERROR
```

实现要点：
- `selectedLegs` 上限 4；同 `matchId` 替换而非新增；满 4 后第 5 场 toast 提示
- `stake` 默认 10U，校验 min/max/step
- 4/4 + valid stake → CTA `Calculate odds` 触发 mock preview（800ms 后给 `quote_id` + `activity_odds`，按 50× cap）
- `quote_expires_at_ms` 60 秒倒计时，过期变 `Refresh odds`
- Submit 时 30% 概率触发 `REQUOTE_REQUIRED`（新赔率比旧的低 5–15%），打开 RequoteModal
- 用户确认新赔率 → 二次 submit 成功
- 出票成功落入 `tickets` 列表（localStorage 持久化），达到 participation cap（3 张）后隐藏 build CTA

## 3. Mock 数据扩充

新建 / 扩展 `src/data/world-cup-carnival.ts` 中的 `WC_COMBO_MATCHES`：

- `Match`：`matchId / stage / matchday / home / away / kickoff / matchComboStatus / markets[]`
- 每场 markets：1 个 `MONEYLINE`（combo_eligible: true, 3 outcomes 含概率）+ 0–1 个 `TOTAL` / `SPREAD`（display_only）
- ~20 场覆盖 Group/R16/QF/SF/Final，3–4 个 matchday，混入 1–2 场 `MATCH_CUTOFF_REACHED` 不可选
- 保留 `COMBO_MAX_ODDS=50`、`COMBO_STAKE` 等既有常量，新增 `STAKE_MIN/MAX/STEP`、`PARTICIPATION_CAP=3`、`REQUOTE_PROBABILITY=0.3`、`QUOTE_TTL_SEC=60`

旧的 `COMBO_PICK_CATALOG` / `COMBO_SAMPLE_PICKS` 由新模型派生（保持向后兼容，若没人用就删）。

## 4. 文件改动

**新增**：
- `src/components/sports/promo/combo/CampaignHero.tsx`
- `src/components/sports/promo/combo/FilterBar.tsx`
- `src/components/sports/promo/combo/MatchSelector.tsx` + `MatchCard.tsx`
- `src/components/sports/promo/combo/ComboBuilder.tsx`（含 LegRow、StakeInput）
- `src/components/sports/promo/combo/QuotePreviewPanel.tsx`
- `src/components/sports/promo/combo/SubmitConfirmModal.tsx`
- `src/components/sports/promo/combo/RequoteModal.tsx`
- `src/components/sports/promo/combo/TicketSuccessPanel.tsx`
- `src/components/sports/promo/combo/TicketStatusList.tsx`
- `src/components/sports/promo/combo/ShareCardPreview.tsx`（1080×1350 视觉预览，scale 适配）
- `src/components/sports/promo/combo/useComboState.ts`（状态机 hook）
- `src/components/sports/promo/combo/mockApi.ts`（preview / submit mock，含 requote 抽签）

**改动**：
- `src/components/sports/promo/ComboChallengeSection.tsx`：完全重写，组合上面 12 个子组件
- `src/data/world-cup-carnival.ts`：扩 `WC_COMBO_MATCHES` 数据集 + 新常量
- `src/routes/style-guide.tsx`：补一节 "Combo Activity" 展示 MatchCard / ComboBuilder / QuotePreviewPanel / ShareCardPreview / RequoteModal 五个新模块（遵守 Core memory：playground 同步）

## 5. 视觉

- 沿用 `font-scoreboard` (Orbitron) + `font-pitch` (Chakra Petch)、`bg-led-matrix`、amber accent
- MatchCard：左侧 stage tag + matchday，右侧三个 outcome 按钮（show team + probability），被选中变 amber 描边 + 底部 amber bar
- StickyBuilder：黑底 + amber 框，4 个 leg 槽（空槽 SLOT-N 占位、满槽显 pick 名）
- QuotePreviewPanel：scoreboard 风格大字显 `activity_odds × stake = payout`
- RequoteModal：左右两列对比旧/新，新值用红/绿染色（odds 涨变绿，跌变红）
- ShareCardPreview：1080×1350 卡缩放到容器宽度，含 4 picks、odds、payout、OmenX logo 占位、QR 占位，底部脚注

## 6. 不做（出 PRD 范围 / 用户已确认排除）

- 真正下载 PNG / html-to-image / native share / 复制链接
- Win Card / Near-miss Card 视觉（先放占位 tab，标注 P1）
- 真实埋点（事件名以 `console.debug` 落地，便于以后替换）
- /wc-combo 独立路由（保留在 promo tab 内）
- 接 ticket 详情后端 / 真实 polling

## 验证

- 4 场切换 / 替换 / 满 4 限制
- stake 校验、preview 倒计时过期 → Refresh
- requote 抽签（debug 按钮强制触发一次便于演示）
- 三张 mock ticket 在列表里覆盖 ACCEPTED / SETTLED_WON / SETTLED_LOST
- mobile sticky 底栏在小屏出现，desktop 不出现
- style-guide 新区块渲染正常
