
# World Cup Carnival 视觉升级

目标：保留现有 LED 记分牌骨架，往里塞真实世界杯氛围——AI 生成的主视觉作为环境层，SVG/CSS 装饰把每一处"线框感"压下去。视觉强度按 5/5 拉满。

## 1. AI 生成主视觉（一次性生成 5 张，存为 CDN asset）

用 `imagegen--generate_image`（premium tier，1920×1024 横幅）生成下列图，全部走霓虹绿 + 黑色 + 金色调，保持 LED scoreboard 调性：

| 文件 | 用途 | prompt 关键词 |
|---|---|---|
| `hero-trophy-left.jpg` | Hero 左侧氛围层 | World Cup trophy close-up, dark studio, neon green rim light, dramatic shadows |
| `hero-stadium-right.jpg` | Hero 右侧氛围层 | Empty floodlit stadium at night, view from tunnel, green pitch glow, dark sky |
| `card-welcome.jpg` | Welcome Pack 卡片顶部 banner | Confetti raining over dark stadium tunnel, neon green spotlights |
| `card-combo.jpg` | Combo Challenge 卡片顶部 banner | Glowing football trail, motion blur, dark background, green energy |
| `card-luckybox.jpg` | Lucky Box 卡片顶部 banner | Glowing trophy emerging from cracked golden box, dark, ember particles |

全部用 `lovable-assets create` 上传成 `.asset.json`，仓库里不留二进制。

## 2. ScoreboardHero 改造

- 左侧 30% 宽：放 `hero-trophy-left.jpg`，`mix-blend-mode: screen` + `opacity-40` + 左到右黑色渐变遮罩（让数字依旧清晰）
- 右侧 30% 宽：放 `hero-stadium-right.jpg`，对称处理
- 中间 40% 保留纯黑 LED 数字
- 顶部加一条 **32 国国旗水平滚动条**（用 `flagcdn.com`，无限循环 marquee），高度 24px，opacity 50%
- 四角加 SVG"角标支架"装饰（像真实体育场记分牌的金属边框结构）
- 背景层加 **闪烁星点/烟花粒子**（pure CSS，10-15 个 `radial-gradient` 点 + `animate-twinkle`）

## 3. 三张 Series 卡片改造（OverviewSection）

每张卡现在只是个边框，改成：
- 顶部 120px banner 区域：放对应的 AI 生成图，加暗色 vignette
- banner 左下角：彩色发光的 SEC-XX 编号 + ICON
- banner 右上角：装饰小图标（奖杯/盲盒/闪电）
- 卡片底部加 1px 流光边线（hover 时整条 sweep 一次）
- 卡片背景加微弱的 LED dot-matrix 纹理（沿用现有 `.bg-led-matrix`）

## 4. 满屏装饰元素（全局/分布）

- **国旗滚动带**：在 ScoreboardHero 顶部、Tabs 下方各放一条，方向相反
- **彩带 / 碎纸屑 SVG**：在 Hero 上方和页面底部各撒一层（绝对定位，pointer-events-none，slow drift 动画）
- **足球 + 奖杯 SVG 水印**：分布在 Combo Challenge 的空白区域和 Rules 页背景
- **看台灯光光斑**：页面顶部 + 底部各一条 radial-gradient 光晕（绿+金）
- **新增 CSS 动画**：`@keyframes twinkle`、`@keyframes confetti-fall`、`@keyframes flag-marquee`

## 5. Welcome Pack / Lucky Box / Combo 内部小升级

- **NewbieRewardsSection** 任务卡：左上角加 LED 数字角标背景纹理；CLAIMED 卡加金色彩带角标 SVG
- **ComboChallengeSection** Slot 卡：选定后背景叠加该队国旗水印（opacity 8%）；POTENTIAL PAYOUT 区域加金色光晕
- **LuckyBoxSection** Vault 卡：voucher 预览区改成带 LED dot-matrix + 流光扫过 + 微缩的奖杯/盲盒 SVG
- **CarnivalRulesSection**：背景加足球场草坪条纹（极淡）+ 装饰球图标

## 6. 移动端

所有装饰都跑 `hidden md:block` 或减弱版本，避免移动端过载。AI 图保留但缩放更紧。

## 7. Style guide 同步

把升级后的 ScoreboardHero、三张新版 Series Card 镜像到 `/style-guide` 的 World Cup Carnival 区。

---

## 技术细节

- **AI 图生成**：用 `imagegen--generate_image` model=`premium`，生成到 `/tmp` 然后 `lovable-assets create` 上传，pointer 写到 `src/assets/carnival/*.jpg.asset.json`
- **不动业务逻辑**：mock 数据、tab 路由、倒计时全部保留
- **CSS 新增** 写在 `src/styles.css` 现有 carnival 区块下
- **新组件**：`CarnivalFlagsMarquee.tsx`、`ConfettiLayer.tsx`、`StadiumLightingGlow.tsx`
- **修改组件**：`ScoreboardHero`、`OverviewSection`、`NewbieRewardsSection`、`ComboChallengeSection`、`LuckyBoxSection`、`CarnivalRulesSection`、`style-guide.tsx`

## 执行顺序

1. 先生成并上传 5 张 AI 图（最耗时，并行）
2. 写新增装饰组件 + styles.css 动画
3. 改造 ScoreboardHero（最关键）
4. 改造 3 张 Series 卡片
5. 改造各 tab 内部
6. 同步 style-guide
7. 跑一遍预览截图验收

**生成 AI 图的成本是这次升级最大支出。如果你想先看 Hero 改造效果再决定是否生其余 4 张，告诉我"先 Hero"，我就只生 2 张试水。**
