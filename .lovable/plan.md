按你选的 **方向 A · 完整奖杯锚定左侧 + 双霓虹轨**，下面是落地方案。

## 视觉契约（对照选中原型）

```
┌──────────────────────────────────────────────────────────┐
│ ▓ 国旗 marquee（顶部，opacity 0.55）                      │
├──────────────────────────────────────────────────────────┤
│ ● LIVE PRIZE POOL              ┌─ENDS IN─────────┐       │
│                                │ 04:12:45:08     │       │
│                                └─────────────────┘       │
│                                                          │
│  ╔═════╗                                                 │
│  ║     ║   ─── 3,000,000 U ───                          │
│  ║奖杯 ║   ┌ JACKPOT ACCUMULATING · WC 2026 ┐           │
│  ║完整 ║                                                 │
│  ╚═════╝                                                 │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ ▓ 国旗 marquee（底部，反向，opacity 0.5）                 │
└──────────────────────────────────────────────────────────┘
```

## 改动清单（仅 `ScoreboardHero.tsx`）

### 1. 背景分区：左 1/3 奖杯 + 右 2/3 球场
- 左侧 1/3：完整奖杯 `bg-contain bg-bottom-left`，**底部对齐贴边**，高度 90%，不再被裁切露水印（用 `bg-position: left bottom` + 高度足够，让 "FIFA WORLD" 落到容器外被裁掉）
- 左→右黑色 vignette `from-black/60 via-transparent`，让奖杯金色平滑过渡到中间
- 右侧 2/3：保留现有球场图，加右侧 vignette + 中部一个绿色光晕 blob（`blur-[80px] bg-[oklch(0.7_0.18_145)]/20`）填补"死绿场"问题

### 2. 数字两侧加霓虹短轨
- 数字 `3,000,000` 左右各加一条 `w-12 h-[2px]` 绿色发光横线
- 解决"数字漂浮"——视觉上形成横向锚定，左右对称

### 3. 顶部 LIVE/ENDS IN 行
- 因为奖杯改成完整贴底（不再 42% 宽往上铺），LIVE 标签不会再被压
- ENDS IN 倒计时改为黑底卡片样式（min-w-[200px]，更有"计分牌"重量）

### 4. 国旗带保留
- 顶部 + 底部 marquee 完全保留，无改动

### 5. 移动端（≤ md）
- 左侧奖杯变为绝对定位水印（opacity 0.3），不挤压数字
- 数字字号 `text-6xl`，霓虹短轨隐藏

## 不动
- `CarnivalFlagsMarquee`、`ConfettiLayer`（TwinkleField）、`CornerBracket` 子组件
- `wc26-trophy-hero.png` 资源（图本身已经是黑底金奖杯，复用）
- 倒计时逻辑、文案、字体（Orbitron + Chakra Petch）

## 同步
- `/style-guide` 内的 ScoreboardHero demo 自动跟着更新（因为是同一组件）
- DESIGN.md 不动（这次只是布局微调，没新增 token）

## 验证
- `browser--screenshot /promo/world-cup` 对比改前改后
- `browser--screenshot /style-guide` 确认 playground 没破

确认即开工。