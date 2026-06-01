## 方案 A：联赛海报做底

### 思路
联赛只有 5 种（WC / UCL / EPL / LL / MLS），我们提前为每个联赛 AI 生成一张 atmospheric 背景图，按 `market.league.short` 映射，作为头部模块的底图，配合深色遮罩 + 轻微模糊保证文字可读。

### 步骤

1. **AI 生成 5 张联赛底图** → `src/assets/league-bg/`
   - `wc.jpg` — World Cup 2026：北美球场夜景 + 金绿氛围、抽象大力神杯轮廓
   - `ucl.jpg` — UEFA Champions League：深蓝星空 + 欧冠星纹球场穹顶
   - `epl.jpg` — Premier League：英伦球场看台灯光 + 紫色调
   - `ll.jpg` — La Liga：西班牙日落球场 + 橙红渐变
   - `mls.jpg` — MLS：北美都市夜景球场 + 红蓝氛围
   - 统一风格：宽幅 1920×720、低饱和、画面中心留暗（给文字让位）、无文字无logo、cinematic、轻噪点

2. **建立映射** `src/lib/league-backgrounds.ts`
   ```ts
   import wc from "@/assets/league-bg/wc.jpg"
   // ...
   export const LEAGUE_BG: Record<string, string> = { WC: wc, UCL: ucl, EPL: epl, LL: ll, MLS: mls }
   ```

3. **改造头部** `src/routes/event.$id.tsx` (EventHeader, line 512+)
   - 移除当前两个 `bg-primary/15` 紫色 blur orbs
   - 在 `<header>` 内最底层加：
     ```tsx
     <img src={LEAGUE_BG[market.league.short]} className="absolute inset-0 h-full w-full object-cover opacity-40" />
     <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/85 to-surface" />
     <div className="absolute inset-0 backdrop-blur-[2px]" />
     ```
   - 保留底部 primary 渐变光带
   - 兜底：联赛不在映射里时退回当前 `bg-ambient` 纯色

4. **同步 style-guide** `/style-guide`（按 core memory）：
   - 在 event header 示例区切换 league 演示不同底图

### 视觉效果
- 没有 "World Cup" label 也能一眼认出赛事
- 各联赛页面有差异化氛围，但通过统一遮罩保证 UI 一致
- 文字对比度由 70→85% surface 渐变保证

### 风险
- AI 生成图需要人工挑选，可能跑 1–2 轮才满意（每联赛 1–2 张候选）
- 文件体积：5 张 jpg 控制在每张 < 200KB

确认后开始生成图片并接入。