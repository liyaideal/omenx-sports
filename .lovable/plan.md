# 移动端直播模块改成"两张等大宽卡堆叠"

## 当前问题

- HeroCard 用了 `aspect-[4/5]` 竖卡，太占地。
- 主副结构（hero + rail）让两个直播视觉权重不平等，第二个被缩成小缩略图。

## 新方案

`MobileLiveHero` 改成一个**等大宽卡列表**：每张比赛卡都是同一个 `LiveMatchCard` 组件，`aspect-[16/9]` 全宽海报，纵向 stack，`gap-3`。两个直播 → 两张完整大卡，N 个直播 → N 张同款卡。

### 单张卡（`LiveMatchCard`）结构

整卡就是一个 16/9 海报，所有信息 overlay 在海报上（不再额外加 footer 行，节省纵向空间）：

```text
┌──────────────────────────────────────┐
│ [LIVE • EPL]            [00:43:43]   │  top row
│                                      │
│              ┌────┐                  │
│              │ ▶  │  44px play       │
│              └────┘                  │
│                                      │
│ [🛡 MCI 2 — 0 ARS 🛡]   Open →      │  bottom row: 比分 bug + open
└──────────────────────────────────────┘
```

- 卡片：`aspect-[16/9] rounded-3xl border border-[color:var(--accent)]/40 ring-1 ring-[color:var(--accent)]/20`。
- 海报：`<img object-cover>` 铺满；无 poster 时降级渐变。
- Overlay：顶部 `from-background/70` 渐变 + 底部 `from-surface/85` 渐变，保证可读。
- 顶部左：`LIVE` pill (accent) + 联赛 short。顶部右：分钟数 pill。
- 中心：44px Play 圆按钮，`bg-background/55 backdrop-blur-md ring-white/30`，比 hero 那版稍小，让两张卡叠起来不重。
- 底部：左边比分 bug（紧凑版，hLogo 24 + short + 比分 + short + aLogo 24），右边 `Open →` 小字。
- 整卡 `<Link to="/event/$id">`，`active:scale-[0.99]`。

### Section 结构

```text
header: Live Scores  |  N matches
  ↓
LiveMatchCard #1  (16/9)
LiveMatchCard #2  (16/9)
LiveMatchCard #N  (16/9)
```

不再有 `HeroCard` / `RailCard` 之分；不再有横滑 rail。两场 → 两张等高等宽卡。

### 高度对比

- 旧 hero (4:5) ≈ 360 × 450 + footer ≈ 480px + 小 rail 130px ≈ **610px**
- 新两张 16/9 ≈ 360 × 202 × 2 + gap 12 ≈ **416px**

节省 ~190px，且两个直播视觉权重相等。

## 涉及文件

- `src/components/sports/mobile/MobileLiveHero.tsx` — 重写：删掉 `HeroCard`/`RailCard`/`Crest`，新增 `LiveMatchCard`，section 用 `space-y-3` 渲染所有 markets。
- `src/routes/style-guide.tsx` — Mobile Shell 区已有 `MobileLiveHero` 演示，自动跟着更新；无需手动改，但会复查一眼 phone frame 高度合理。

## 技术细节

- 不动数据层、不动桌面端、不动 `index.tsx`。
- 保留现有 token：`bg-surface`、`var(--accent)`、`shadow-card`、`backdrop-blur-md`、`font-display` / `font-mono`。
- `Open →` 用 `lucide` `ArrowRight`，`text-[10px]` `text-white/85`。
- 不引入新颜色、不引入新依赖。
