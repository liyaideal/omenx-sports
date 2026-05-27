## Event 头部 → 左右分栏（C 方案）

把 `EventDetailHeader` 和下面那排 `OutcomePicker` 合成一张卡，按 fixture 左 / odds + 统计右。

### 1. 新布局（仅改 `src/routes/event.$id.tsx`）

桌面 (md+)：

```text
┌──────────────────────────────┬──────────────────────────┐
│ [EPL] [MATCH]    [⌚ 6:00pm] │                          │
│                              │  OUTCOMES                │
│   🛡 MCI    vs    🛡 ARS     │  ▸ MCI    48¢ ↗+2 ▁▂▄    │
│   Man City        Arsenal    │    DRAW   24¢ ·  0 ▂▁▂    │
│       Today · 6:00pm         │    ARS    28¢ ↘−2 ▄▃▂    │
│                              │                          │
├──────────────────────────────┴──────────────────────────┤
│  VOLUME · 24H VOL · TRADERS · ENDS                       │
└─────────────────────────────────────────────────────────┘
```

- 网格：`md:grid-cols-[1.2fr_1fr]`，中间一条 `divide-x divide-border`。
- 删掉重复的 `Man City vs Arsenal` 大标题文字（crests + 名字已经表达，标题只在三方/期货市场出现）。
- 删掉独立的 `<OutcomePicker>` 区块，整页里挪到 header 右栏。

### 2. 右栏 outcome 行（替代 OutcomePicker / OutcomeSelector）

新组件 `HeaderOutcomeRow`（同文件内）：

```text
[crest/dot]  Label                  48¢   ↗+2   ▁▂▄▃▅  
```

- 行高 56px，选中态 `ring-1 ring-primary/40 bg-primary/5`，未选中 hover 出现 `bg-white/[0.03]`。
- 左侧 glyph：有 team 用 crest（24px），没有 team 用首字母圆点（Draw = "D" / Yes = "Y" / No = "N"），保留现有配色逻辑。
- 中间 label：team.name 或 outcome.label。
- 右侧三件套：
  - 价格 `48¢`，主排版字号 `text-lg font-mono`，颜色随 selected。
  - delta24h pill 复用 `PricePill` 的 delta 颜色逻辑，但只显示 `↗+2¢`。
  - 一个 40×16 px 的 inline SVG sparkline（基于 `hashSeed(market.id + outcome.id)` 生成 12 个点），colour 跟随 outcome tone。新增小函数 `<Sparkline seed pts={12} tone />`，纯 SVG，不引依赖。
- 整行 `<button>`，click → `onSelect(idx)`，沿用现有 `selectedIdx`。

二选一（binary）和三路市场都走这个组件，不再分支到 `OutcomeSelector` / `OutcomePill` —— OutcomeSelector 还在 style-guide 里使用，不删。

### 3. 左栏紧凑化

- crest 圆从 80×80 → 72×72，glow 强度保持。
- `Man City` / `Arsenal` 名字 + 中间 `vs` + `Today · 6:00pm` 整组垂直居中到右栏中线，避免左栏比右栏短一截留白。
- 期货/玩家 prop 类（没有 `fixture`）走另一支：左栏只有 `<h1>{market.title}</h1>` + 联赛副标。

### 4. 底部统计行

- 维持 4 列 `Volume / 24h Vol / Traders / Ends`，跨整张卡（`md:col-span-2`），上面一条 `border-t border-border`。
- 字号/留白不变。

### 5. 响应式（<md，含当前 1021 视口的临界值）

- `grid-cols-1`，顺序：fixture → outcomes → stats。
- outcome 行保持 56px，stats 改 2×2 网格。
- 用 `lg:grid-cols-[1.2fr_1fr]` 而不是 md，避免 1021px 卡到中间挤崩。

### 6. DESIGN.md & style-guide 同步

- DESIGN.md §4 Component Stylings 加 "Event detail header" 条目：双栏契约、outcome 行的 56px 高度 + selected ring 规则。
- DESIGN.md §7 Don'ts 加："不要在 event 头部下方再放一排独立 outcome 卡片，odds 必须并入 header 右栏。"
- `src/routes/style-guide.tsx` §13 Event detail 区块更新一张新的 header demo（双栏 + outcome 行），删掉旧的"header + 下方 OutcomePicker"对照。
- 写 `mem://design/event-detail-header`：双栏 + outcome 在右栏的规则，更新 `mem://index.md`。

### 不动

- `TradeForm` / `PriceChart` / `OrderBook` / `PositionsTable` / `OutcomeSelector` / `OutcomePill` 一概不改。
- 路由、loader、数据结构不动。
- 暂不引入 motion / 不加新依赖。

### 文件清单

- 改：`src/routes/event.$id.tsx`（重写 `EventDetailHeader`，删 `OutcomePicker`，新增 `HeaderOutcomeRow` + `Sparkline`）
- 改：`src/routes/style-guide.tsx`（event detail 示例）
- 改：`DESIGN.md`
- 新建：`mem://design/event-detail-header`，更新 `mem://index.md`

确认后开工。