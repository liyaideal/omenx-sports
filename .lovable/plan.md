## Pinpoint → Y2K Cartridge 改版计划

### 总方向
丢掉「贴纸 + 黑黄危险条」的静态平面感，换成 **Y2K 任天堂卡带 / 早期掌机** 的可玩感：像素质感 + 棱形按钮 + 进度条 + 关卡感 + 战绩册。每一局看起来像在「过一关」，不像在看图表。

---

### 1. 视觉语言（替换 `pp-theme.css`）

**色板（卡带塑料 + CRT 屏幕）**
- 卡带外壳：奶油白 `#f4ecd8`、薄荷 `#7ed4b2`、樱粉 `#ff9bb3`、电光蓝 `#5ec8ff`
- 屏幕：暗绿 LCD `#0f1a14` 底 + 亮绿像素 `#9bff6f`
- 强调：警报红 `#ff3b3b`、金币黄 `#ffcc00`
- 中性：`#2a2620` 文字、`#d8cdb5` 边

**字体（用 `@fontsource`，不用贴纸的 Anton/Permanent Marker）**
- `@fontsource/press-start-2p`：分数、计时、价格（像素感）
- `@fontsource/silkscreen`：标签、按钮
- `@fontsource/space-grotesk`：正文（保证可读性，不全像素）
- `@fontsource/vt323`：行情滚动条

**质感**
- 卡片 = 卡带：4px 实线深色描边 + 2 层硬阴影偏移 `4px 4px 0 #2a2620, 8px 8px 0 rgba(0,0,0,.15)`，圆角 12px
- 内嵌「LCD 屏」面板：暗绿底 + 1px 像素网格 + 微微 CRT 扫描线
- 按钮：棱形/胶囊带高光，按下时 `translate(2px,2px)` 阴影变浅，配 8-bit「咔哒」音效
- 不用渐变模糊；只用纯色 + 硬阴影 + 1px 像素描边

---

### 2. 可玩性增强（这是重点）

**A. 动效与反馈**
- 价格变化：数字翻牌（split-flap），上涨绿色弹跳 + ↑像素箭头，下跌红色震屏
- 下注瞬间：卡片闪白 1 帧 + 「INSERT COIN」金币掉落动画
- 开奖：LCD 屏从模糊到聚焦，命中时全屏放烟花像素 + 「STAGE CLEAR」横幅；未命中显示「GAME OVER」+ 灰屏
- 倒计时：最后 10 秒红色脉冲 + 节拍音
- 8-bit 音效（可静音开关）：下注、确认、开奖、连胜

**B. 进度与收集（新增轻量化模块）**
- 顶部「玩家卡带」：头像 + 等级 LV + 经验条 + 当前连胜 🔥×N
- 战绩册 (Trophy Case)：徽章网格，已解锁亮色像素图标，未解锁灰色剪影（首胜、3 连胜、10 连胜、千倍局、爆冷等）
- Streak 系统：连胜显示在 HUD 右上，断了有「COMBO BROKEN」抖动
- 每日任务条：「今日完成 3 局 / 命中 1 次冷门」进度像素条

**C. 社交炫耀**
- 每局结束生成「战绩卡」：卡带外形 + 玩家名 + 命中事件 + 倍率 + 像素角色，一键分享 PNG
- 排行榜 Tab：当日连胜榜、当日倍率榜，前 3 名配金/银/铜像素奖杯
- 战绩可复制成 ASCII 块，方便贴 Discord/X

---

### 3. 改动范围

**重写**
- `src/features/pinpoint/pp-theme.css` —— 全部替换为 Cartridge tokens（保留 `pp-*` 类名）
- `src/main.tsx` —— 换字体包：移除 anton/bungee/permanent-marker，加 press-start-2p / silkscreen / vt323 / space-grotesk
- `src/routes/__root.tsx` —— 同步字体 `<link>` 清理
- `src/routes/pinpoint.tsx` —— Logo 改成「PINPOINT」像素卡带 logo；LIQUIDATED 模态改为「GAME OVER」LCD 风
- `src/features/pinpoint/Grid.tsx` —— Canvas 配色改 LCD 绿底 + 像素字体；命中/未命中加爆点动画
- `src/features/pinpoint/Sidebar.tsx` —— 卡带式卡片 + 像素按钮 + 翻牌价格
- `src/features/pinpoint/PriceCapsule.tsx` —— 翻牌数字
- `src/features/pinpoint/EventTabs.tsx` —— 关卡式 Tab（STAGE 1 / STAGE 2）

**新增**
- `src/features/pinpoint/PlayerHUD.tsx` —— 等级 / 经验 / 连胜
- `src/features/pinpoint/TrophyCase.tsx` —— 徽章网格（mock 数据，纯前端）
- `src/features/pinpoint/ResultCard.tsx` —— 战绩分享卡（html2canvas 导出 PNG）
- `src/features/pinpoint/sounds.ts` —— 8-bit 音效（mock 用 WebAudio 合成，无需音频文件）

**Style Guide 同步**
- `/style-guide` 的 Pinpoint 区块整体替换为「Pinpoint Cartridge」demo：卡带卡片、LCD 屏、棱形按钮、徽章、翻牌数字、HUD

**只换皮 + 加轻量 UI 模块**，不动业务逻辑、不改持仓/订单/价格计算。所有「进度/徽章/连胜」先用 mock 数据，等后续接后端。

---

### 4. 不做
- 不做真音频文件（用 WebAudio 合成 8-bit 即可，体积 0）
- 不做暗/亮主题切换
- 不真做后端的「等级/经验」系统，先 localStorage mock
- 不引入 framer-motion 重型库；优先 CSS keyframes + Tailwind animate

---

### 5. 验证
- `rg "anton|bungee|permanent-marker"` 应清空
- Playwright 截图 `/pinpoint` 和 `/style-guide` 对比新卡带风
- 手测：下注 → 翻牌 → 开奖 → 战绩卡生成 → 连胜计数 +1
