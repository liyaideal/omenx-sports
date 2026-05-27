# 移动端直播 Hero 重做

## 问题

目前移动端首页的 "Live Scores" 模块 (`MobileLiveHero`) 只画了两个 crest 圈 + 大比分，把桌面端 `LiveStreamCard` 里最有"直播感"的东西都丢了：

- `market.livePoster` 海报图（球场实拍/广播画面）
- 居中的 Play 按钮（带 backdrop blur）
- 直播 score bug（底部圆角胶囊里的两队 logo + 比分）
- LIVE 红色 pill + 比赛分钟数

整张卡片看起来像"静态比分牌"，不像"正在直播的入口"。

## 方案

把 `MobileLiveHero` 的 `HeroCard` 重写成"全宽海报 hero"，本质是 `LiveStreamCard` 的移动端放大版本，但保留首页 hero 的尺度感。

### 新的 HeroCard 结构（从上到下）

```text
┌──────────────────────────────────────────┐
│ [LIVE • PL]              [72:14]         │  ← 海报顶部，pill + 分钟
│                                          │
│         ┌──────┐                         │
│         │ ▶    │  ← 居中 56px Play 按钮  │
│         └──────┘                         │
│                                          │
│  [🛡 ARS  2 — 1  CHE 🛡]  ← 比分 bug    │
└──────────────────────────────────────────┘
   Streaming · Premier League   Open →      ← 海报下方 footer 一行
```

- 整张卡片 `aspect-[4/5]` 左右（≈ 360×450），让海报图占满视觉。
- 海报上 overlay：顶部渐变 + 底部到 surface 的渐变，保证文字可读。
- 没有 `livePoster` 时退化到 `from-white/[0.06] to-transparent` 渐变（与桌面端一致），并把两队 crest 放大居中作为兜底。
- 整卡仍是 `<Link to="/event/$id">`，`active:scale-[0.99]`。
- 保留外层 `section` 的 header（"Live Scores" 标题 + N matches pill）。

### Rail（次要直播）保持

下面横滑的 `RailCard` 保留现在的小卡（crest + 比分），但同步加一个左上 `LIVE` pill 和一个迷你播放图标，让"它们也是直播"这点更明确。如果该比赛有 `livePoster`，把卡片背景换成 16/9 的 poster 缩略图（高 ~64px），让视觉一致。

## 涉及文件

- `src/components/sports/mobile/MobileLiveHero.tsx` — 重写 `HeroCard`，小改 `RailCard`。
- `src/routes/style-guide.tsx` — "Mobile Shell" 区已有 `MobileLiveHero` 演示，确认改完后预览依然渲染（不需要新增条目，但要重新看一眼 phone frame 里效果）。

## 技术细节

- 复用现有 token：`bg-surface`、`ring-[color:var(--accent)]/20`、`text-[color:var(--accent)]`、`shadow-card`。不引入新颜色。
- 海报图 `<img loading="lazy" />`，与 `LiveStreamCard` 一致。
- Play 按钮：`grid h-14 w-14 place-items-center rounded-full bg-background/55 ring-1 ring-white/30 backdrop-blur-md`，比桌面端的 40px 大一圈，符合移动端触达。
- 比分 bug 用现在 `LiveStreamCard` 同款 `bg-background/70 ring-1 ring-white/15 backdrop-blur`，字号略放大 (`text-2xl`)。
- 不动桌面端 `LiveStreamCard`，不动 `index.tsx` 桌面分支，不动数据层。
