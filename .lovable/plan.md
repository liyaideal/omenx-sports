## 方向

按 v1 「复古球场记分牌 + 翻牌线索 + 签名档案」重做 `/promo/world-cup?tab=legend`。  
保留现有数据模型（8 国 × 4 候选 × 3 线索 × Tier-01 spin 奖励），重做视觉壳层和图像元素。

## 视觉锚点（翻译自 v1）

```text
┌─[scoreboard chassis · 12px frame · corner bolts]──────────┐
│ SERIES PROGRESS                       LIVE FEED · GUES-77 │
│ [01🟢][02🟡][03·][04·][05·][06·][07·][08·]                │
├──────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────────────────────┐  │
│  │   FLAG   │  │ ▌POSITION         ATTACKER           │  │
│  │  (BRAZIL)│  │ ▌PEAK CLUB        AC MILAN           │  │
│  │          │  │ ▌MAJOR TROPHY     ━━━ (locked)       │  │
│  └──────────┘  └──────────────────────────────────────┘  │
│  REGION · CONMEBOL                                        │
├──────────────────────────────────────────────────────────┤
│  [ KAKÁ      42% ▓▓▓▓░ ]  [ RONALDO      28% ▓▓░░░ ]    │
│  [ ZICO      18% ▓░░░░ ]  [ ROMÁRIO      12% ▓░░░░ ]    │
├──────────────────────────────────────────────────────────┤
│  SIGNED ARCHIVE                                           │
│  [PELÉ] [CRUYFF] [ZIDANE] [MESSI·active]                  │
└──────────────────────────────────────────────────────────┘
```

## 图像资源（`src/assets/legend-reveal/`）

**只生成 2 类素材，规避肖像权：**

1. **8 国旗帜纹理板**（`flag-{brazil|spain|france|argentina|germany|england|netherlands|portugal}.jpg`）  
   - 256×160 横版，做旧、做暗、带运动模糊，匹配 LED 记分牌色调  
   - `imagegen` standard，~8 张

2. **签名档案缩略图**（`signed-{slug}.jpg`）  
   - 80×112 竖版，**风格化插画半身像**（不写实，避免真实球员肖像），背景叠国旗色  
   - 已签的 8 位正确答案 + 2 位 prewarm = ~10 张  
   - `imagegen` standard，统一画风（哑光做旧、签名笔触叠层）

**候选卡和正解头像都不出真人图**（用文字 + 国旗色块）— 这样既省成本，也保留悬念，也不踩肖像权。

## 文件改动

### 1. `src/data/world-cup-carnival.ts`
- `LegendCountry` 新增 `flagImage: string`（指向 import 的旗帜纹理）
- `LegendCandidate` 新增 `position?: string`、`peakClub?: string`、`majorTrophy?: string` —— 3 个线索全部结构化为「key → value」（正解才填，其他候选不需要）
- `Round` 的 `clues[]` 改成 `{ label: 'POSITION'|'PEAK CLUB'|'MAJOR TROPHY', value: string, unlocked: boolean }[]`
- `PrewarmLegend` / 正解球员 新增 `signedImage: string`

### 2. `src/components/sports/promo/GuessTheLegendTab.tsx`（重写）
- 整个容器换成 v1 chassis 壳：`border-[12px] border-[#1a1a1a]` + 4 个螺栓圆点 + 内阴影 + 顶部反光 + 极轻 scanlines（opacity 10%）
- `RoundProgressHud`：替换现在的 `RevealWall` 圆点墙 → 8 格 LED 方块（hit=#4ade80、active=#facc15 pulse、miss=#f87171、upcoming=zinc-950）+ 右上 `LIVE FEED · GUES-{round}` 字样
- `ActiveRoundBay`：5 列 grid，左 2 列国旗图，右 3 列 3 行 split-flap 线索条（左侧 amber 立柱 + label/value 两端对齐）
- `CandidateBoard`：保留 2×2，但每张换成 v1 的扁平 + 进度条 + hover amber 描边样式
- `SignedArchiveStrip`：底部横条，每张缩略图 48×64，amber 描边 = 最新一张
- 拆 4 个子组件（chassis、hud、bay、archive）放同文件，~400 行

### 3. `src/routes/style-guide.tsx`
镜像新增：chassis 壳 demo、LED 进度灯 4 态、split-flap 线索行 3 态、签名档案缩略图

### 4. `DESIGN.md` §4 / §7
- §4 加 "Legend Scoreboard Chassis" 规格（border、bolt、scanline opacity 上限）
- §7 Don't：候选卡不放真人头像；候选不暴露 position/club/trophy；scanline 不超过 10% opacity

### 5. `mem://design/legend-scoreboard`
固化壳层规则（chassis + LED 进度 + split-flap 线索）

## 不动

- 路由 / tab 结构 / LuckyBox 入口
- 奖励机制（Tier-01 spin）
- 数据 mock 的 8 国名单和 prewarm（Vieira / Y. Touré）

## 风险

- 8 张旗帜 + 10 张人像生成 ≈ 18 次 standard imagegen，需要 1–2 分钟。可以接受？
