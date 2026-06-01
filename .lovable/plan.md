## 目标

为没有 `fixture` 的 event（冠军、榜单、组冠军、prop…）做一个**纯文字也能撑住**的 header，不依赖 team/player crest 映射。Fixture 版（两队 + vs）保持不变。

## 视觉骨架

```
┌────────────────────────────────────────────────────────────┐
│ [WC] · TOURNAMENT WINNER                                    │  ← league badge + kind chip
│                                                             │
│  World Cup 2026 — Champion                                  │  ← H1 声明句，左对齐
│                                                             │
│  ◷ Settles Jul 19, 2026   ●  Open                           │  ← meta 行
└────────────────────────────────────────────────────────────┘
```

右侧 stats（Volume / Live players）和 share 按钮位置都不动。

## 改动

### 1. `src/routes/event.$id.tsx`
- 在 `EventHeader` 的 fallback 分支替换现有居中 `<h1>`：
  - 顶部一行小标签：`<LeagueBadge short={market.league.short} />` + `·` + kind chip（大写、`text-muted-foreground`、`tracking-[0.22em]`、`font-mono`）。
  - H1 改为左对齐：`font-display text-3xl md:text-4xl font-bold tracking-tight`。
  - 标题下一行 meta：`<Clock>` icon + `endsLabel`，间隔 `·`，状态 dot（绿色脉冲）+ `Open`。
- 容器从 `items-center text-center` 改成 `items-start text-left`，左 padding 与 fixture 版对齐。
- 背景：fallback 分支不显示 `leagueBg` 透出来的图（容易像污点），改成纯 `bg-ambient` + 一层很弱的 league 主色 radial（用 `LEAGUE_BG` 的 hue 或直接走 `bg-ambient`）。

### 2. `src/data/sports-markets.ts`
- 给 `SportsMarket` 加可选 `kindLabel?: string`，缺省时按 `kind` 映射：
  - `league-winner` → `Tournament winner` / `Season winner`（按 league 决定）
  - `top-scorer` → `Top scorer`
  - `group-winner` → `Group winner`
  - `match` → 不用（走 fixture 分支）
  - 其它 → `Market`
- 把映射放在一个小的 `getKindLabel(market)` 辅助里，event header 直接调用。

### 3. `/style-guide`
- 在 "Event header" 区块加 **Question mode** demo，覆盖三种：
  - WC Champion（多 team outcomes）
  - EPL Top scorer（球员 outcomes）
  - Group F winner（小组冠军，纯文字）
- 同时确保现有 fixture mode demo 还在，方便对比。

## 不做

- 不改 fixture 分支的 vs + 两 crest 设计。
- 不在 header 加 outcome chip 流（下方就是 chart）。
- 不改 title 文案的语气（保持声明句）。

## 待确认

无 — 你已经定了。回我"开工"或者切到 build mode 我就做。
