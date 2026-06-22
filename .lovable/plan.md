## 问题

当前 HUD 用的是做旧"博物馆挂旗"纹理图，在 ~80px 宽的小瓦片里被压暗、被周边阴影吃掉，国旗本身几乎看不清，识别率比 emoji 还低。"做旧"风只适合下方 Active Bay 的大图。

## 方案：HUD 改用扁平矢量国旗

HUD 瓦片只需要"一眼识别是哪个国家"，所以把 HUD 那一处（且仅那一处）换成**扁平矢量 ISO 国旗 SVG**，下方 Active Bay 的大幅做旧挂旗保持不变 —— 形成"远看清晰 / 近看有质感"的层次。

### 实现

1. 新增依赖：`country-flag-icons`（轻量，按国家 code 暴露纯 SVG React 组件，无需自带 CSS / 字体）。
2. `src/data/world-cup-carnival.ts`：给 `LegendCountry` 增加 `iso2` 字段（FR / AR / ES / BR / DE / EN→GB-ENG / NL / PT / CI…），保留现有 `flag` emoji 和 `flagImage` 做旧图。
   - 英格兰用 `country-flag-icons` 的 `GB-ENG` 子区域旗（库里支持）。
3. `GuessTheLegendTab.tsx` 的 `RoundLedTile`：
   - 把当前 `<img src={flagImage}>` 块替换成 `<FlagIcon country={iso2} />`（即库提供的 SVG 组件）。
   - 容器：`h-9 sm:h-11`，`rounded-[3px]`，外加 1px `border-black/70` + 极淡 inset shadow，保持复古面板贴合感。
   - 状态视觉只动包裹层不动旗本身：
     - revealed-miss：包裹层加 `grayscale(0.55) opacity(0.7)`
     - revealed-hit：保留绿底条 + 顶部 1px 极淡绿 inset
     - voting/locked-in：保留琥珀底条 + 顶部 1px 极淡琥珀 inset
     - upcoming：继续 "?" 不放旗
   - 移除之前给旗加的 `contrast/saturate` 滤镜——扁平旗本来就是干净纯色。
4. Active Bay / Signed Archive / 数据接口、`/style-guide` 演示都**不动**——它们用的是做旧大图，本来就清楚。

### 不动 / 不引入

- 不删现有做旧旗资源（Active Bay 还在用）。
- 不引 CSS spritesheet 方案（flag-icons），SVG 组件更轻、可独立 tree-shake。
- DESIGN.md §4 加一句小补丁："Scoreboard HUD tiles use flat ISO SVG flags; weathered textures are reserved for Active Bay only." 一行。

### 验证

`bun add country-flag-icons` → 改完后 Playwright 截 `/promo/world-cup?tab=legend` 桌面态，确认 8 个 tile 里前 3 个能一眼分辨出 FR/AR/ES。
