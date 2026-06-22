## 背景

4腿 combo 下注成功后，`TicketAcceptedModal` 关闭，用户回到长页面。新生成的 ticket 出现在最底部的 `My Tickets` 区，桌面 / 移动端都没有任何视觉引导，用户不知道滚到底部去看。

## 方案

在不改业务逻辑的前提下，给「ticket 落到 My Tickets」这一步加上**显式入口** + **自动定位** + **高亮脉冲**，desktop & mobile 同样表现。

### 1. `TicketStatusList` 加锚点 + 高亮态

文件：`src/components/sports/promo/ComboChallengeSection.tsx`

- 给容器加 `id="combo-my-tickets"` 和 `ref`，并通过 prop 接收 `highlightTicketId`。
- `TicketRow` 接收 `highlight: boolean`：当 true 时在外层套一个 2s 的 amber 脉冲环（`ring-2 ring-amber-400/70 shadow-[0_0_24px_rgba(250,204,21,0.35)]` + `animate-pulse` 一次性，2.5s 后自动去掉）。
- 不改 ticket 的数据结构，只是 UI 层。

### 2. Section 顶层管理高亮 / 滚动

`PromoComboSection` 顶层：

- 新增 `const [highlightId, setHighlightId] = useState<string | null>(null);`
- 新增 `const ticketsRef = useRef<HTMLDivElement>(null);` 并透传给 `TicketStatusList`。
- 抽出 `revealLatestTicket()`：
  1. `setHighlightId(ctrl.lastAccepted?.ticketId ?? null)`
  2. `requestAnimationFrame(() => ticketsRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" }))`
  3. `setTimeout(() => setHighlightId(null), 2800)`
- 使用 `window.matchMedia("(prefers-reduced-motion: reduce)")` 判断 reduced-motion。

### 3. `TicketAcceptedModal` 增加显式入口

在「Share my combo」下方、`Build another combo` 上方，新增第二个次级按钮 **「View my ticket」**：
- 样式：`border border-amber-400/40 bg-transparent text-amber-300`，宽度 100%。
- 点击：调用新 prop `onView()` → 父组件先关弹窗（`ctrl.startNewCombo` 已会把状态置回 IDLE），再调用 `revealLatestTicket()`。
- 同时把弹窗的「关闭（点遮罩 / Esc / Build another）」也都走 `revealLatestTicket()`——只要用户离开弹窗，都自动滚到 My Tickets 并高亮新 ticket，确保「不看说明也能被引导到」。

### 4. Mobile 行为

`MobileStickyBar` 在 sheet 形态下渲染同一个 `ResponsiveModal`，逻辑天然复用。`scrollIntoView({ block: "start" })` 在 mobile 也生效；mobile 底部有 sticky bar，给 `revealLatestTicket()` 的 scroll 额外 `setTimeout 50ms` 等待弹窗动画收起后再滚，避免动画打架。

### 5. Style-guide 同步

文件：`src/routes/style-guide.tsx`

在已有的 `My Tickets / TicketStatusList` 演示区下新增一段 demo：
- 渲染 3 张 ticket，第一张通过 `highlightTicketId` 触发 amber 脉冲。
- 加一段说明：「Combo 下注成功后，弹窗关闭 / 「View my ticket」点击都会自动滚动到该区块并对最新 ticket 做 2.5s 高亮脉冲，desktop 与 mobile 一致。」

## 不在范围

- 不改 `useComboState` 的状态机或 ticket 数据结构。
- 不动 `ComboBuilder` / `QuotePreviewPanel` / 海报相关组件。
- 不调整 `My Tickets` 在页面中的位置（保持现在底部）。

## 验证

- Playwright：mobile 1280×1800 — 选 4 腿 → 下注 → 关弹窗 → 截图确认页面已经滚到 My Tickets 且最新 ticket 周围有 amber 高亮。
- 同流程在 desktop viewport 重复一次。
- 触发「View my ticket」按钮路径单独跑一次。
