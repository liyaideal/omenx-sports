## 目标

不动 OmenX 的功能逻辑，先沉淀**一套面向体育预测的视觉规范**，落成可浏览的 `/style-guide` 页面。后面再做 Events 等示范页时，直接消费这些 tokens 和组件，保证一致性。

---

## 视觉语言（从截图抽取）

**气质**：深夜球场 + 霓虹聚光 + 玻璃质感。Premium 球迷端的高级暗色调，比 OmenX 的"交易终端"更感性、更有比赛日仪式感。

**核心 tokens**

| 类别 | Token | 值 | 用途 |
|---|---|---|---|
| 背景 | `--background` | oklch 极深紫黑 ~`#0E0B1A` | 页面底色 |
| 表面 | `--surface` | ~`#171327` | 卡片底 |
| 表面-高亮 | `--surface-elevated` | ~`#1E1832` | hover/激活卡 |
| 边框 | `--border` | 白 8% | 卡片描边 |
| 主色 | `--primary` | 淡薰衣草紫 ~`#CBB6FF` | 主按钮/激活 chip/进度条主调 |
| 次色 | `--accent-neon` | 霓虹品红 ~`#FF3DC4` | 光环/渐变高亮/球员卡光晕 |
| 文字 | `--foreground` | 近白 | 主文 |
| 文字-弱 | `--muted-foreground` | 蓝灰 ~55% | 副标/label |
| 赛果-赢 | `--win` | 翡翠绿 | Win/Yes |
| 赛果-输 | `--loss` | 玫红 | Loss/No |
| 半色 | `--draw` | 琥珀黄 | Draw/Pending |

**渐变 / 阴影**
- `--gradient-neon`：薰衣草 → 品红 → 紫，用于光环、进度条强调
- `--shadow-glow`：品红 30% 外发光，球员卡/CTA hover

**字体**
- 标题：`Sora` 或 `Space Grotesk`（粗体，几何感强，球场号码味）
- 正文：`Inter`
- 数字 / 比分 / 赔率：`JetBrains Mono`（数据严谨）
- 球员名等氛围位：`Instrument Serif` 斜体（"Lionel *Messi*" 那种调性）

**形状语言**
- 卡片圆角统一 `rounded-2xl`（截图里所有卡都是大圆角）
- 顶部图标按钮：圆角方形 `rounded-xl`，激活态填充薰衣草
- Chip：药丸形 `rounded-full`
- 装饰元素：虚线圆环（数字 10、17 周围那种）、霓虹光环

---

## StyleGuide 页面结构

路由：`/style-guide`，单页可滚动，左侧锚点目录，右侧展示区。

1. **Brand & Tone** — 简短宣言 + 主色环境光示意
2. **Color Tokens** — 表面 / 文字 / 主色 / 赛果 / 渐变，每个 swatch 可复制 token 名
3. **Typography** — 标题/正文/数据三档字体的实际样例，含"球员名斜体"展示
4. **Buttons** — primary（薰衣草）/ neon（霓虹品红渐变 CTA）/ ghost / icon-square（截图顶导那种）
5. **Cards**
   - `MatchCard`：两队 logo + 时间 + 联赛（截图右上 3 张）
   - `PredictionCard`：question + 两队对决 + 双色投票进度条 + 互动数（Fan Zone 那张）
   - `PlayerSpotlightCard`：人物图 + 霓虹光环 + 数据三宫格（Mbappé 那张）
   - `LeaderboardRow`：紧凑数据行（Premier League P/W/O/L）
   - `StatChip`：球员小卡（Messi/Haaland，含虚线圆环数字）
6. **Chips & Badges** — 筛选 chip、联赛 chip（带 logo）、状态 badge（Live / Upcoming / Final）
7. **Progress & Vote Bars** — 双色投票条、单色进度条
8. **Decorative Elements** — 虚线圆环、霓虹光环、渐变分隔线（独立成段，让设计语言显形）
9. **Iconography** — Lucide 子集 + 几何示意
10. **Spacing / Radius** — 4/8/12/16/24 + 圆角档位
11. **Component Playground** — 选 2-3 个核心组件（MatchCard / PredictionCard / PlayerSpotlightCard）做可调参数预览

---

## 技术实现

- **Tailwind v4 + `src/styles.css`**：所有 token 定义在 `:root`，通过 `@theme inline` 暴露 Tailwind 工具类（已有结构，扩展即可）
- **字体**：通过 Google Fonts `<link>` 注入 Sora / Inter / JetBrains Mono / Instrument Serif，在 `__root.tsx` head 里加
- **新组件目录**：`src/components/sports/`
  - `MatchCard.tsx`
  - `PredictionCard.tsx`
  - `PlayerSpotlightCard.tsx`
  - `LeaderboardRow.tsx`
  - `StatChip.tsx`
  - `VoteBar.tsx`
  - `NeonRing.tsx`（装饰，纯 CSS / SVG）
  - `LeagueBadge.tsx`
- **StyleGuide 路由**：`src/routes/style-guide.tsx`，单文件，分 section 渲染上述组件
- **首页处理**：保留现有 placeholder，临时加一个跳转 link 到 `/style-guide`，方便预览
- **不接后端**：所有数据 hard-coded mock（球队名、比分、虚拟头像用渐变占位 + 几个 unsplash 占位足球意象图）

---

## 不在本轮范围

- Events / Trade / Portfolio 等业务页（等本规范定稿后再做一个示范页）
- Web3、Supabase、ethers 等真实集成
- 移动端 drawer / bottom nav（先桌面端展示规范，移动端在示范页阶段处理）

---

## 交付物

确认计划后，一次性产出：
1. 更新 `src/styles.css` 注入新的 tokens / 渐变 / 阴影
2. 在 `__root.tsx` 注入 Google Fonts
3. `src/components/sports/` 下 8 个组件
4. `src/routes/style-guide.tsx` 完整规范页
5. 首页 placeholder 加一个去 StyleGuide 的入口

你确认后我就开始写。
