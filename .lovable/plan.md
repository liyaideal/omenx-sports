## 顶部右侧"玩家证"牌匾 + 左栏压一屏

把生涯数据从左栏整体搬到顶栏右侧，做成一块**街机玩家证牌匾**（不是卡片不是 UI 框，是身份徽章）。左栏只留本局数据，自然就一屏放得下。

### 顶栏新布局

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  ← BACK   PINPOINT BETA       USA 1-0 PAR  00:38     │ ┌────────────┐    │
│                               MEX 2-0 RSA  01:04     │ │ PLAYER CARD│   │
│                                                      │ └────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

**玩家证牌匾**（顶栏最右、贴边、约 320×64px）：
- 不用 `.pp-card` 黑底硬阴影那一套，改成**双层冲压金属感**：外层 1px 金边描边、内层暗背景、左上角小三角缺口（像证件孔）
- 内容横向 3 段：
  - **左段**：8×8 像素头像方块 + LV 05（大号 stencil）
  - **中段**：XP 进度条 横置 80×6px + "64 / 340" 小字 + WIN 22%
  - **右段**：W32 / L114 / BEST 11.4× 三行迷你数字 + 下方 6 个 16px 奖杯横排
- 整块带 1px 高光线条（像证件层压塑料反光），与左侧 LCD 卡片视觉拉开
- hover 整块亮 8%，**不可点击**——纯炫耀位（生涯页以后再做）

视觉关键词：街机时代会员卡、机房积分卡、押金牌、不是 dashboard widget。

### 左栏（剩 5 块，自然一屏）

按从上到下顺序：
1. Balance 卡
2. Session P/L + Open 卡（合并）
3. Margin Health 卡（瘦身、保留 bar）
4. Market chips（USA/DRAW/PAR + 比分一行）
5. Bet Size chips（紧凑 2×3，去掉大号 100 数字）
6. Leverage chips（1×/2×/3× 横排矮版）
7. STOP 按钮
8. Sound / Rules / Info 文字行

合计高度 < 700px，1024×780 视口零滚动。左栏宽度从 ~300px 收到 **260px**，留更多空间给牌匾和顶栏赛程 chip。

### 顶栏赛程区

现在 LIVE 标 + USA/MEX 两个赛程 chip 不动，只把它们的水平位置整体左移，给最右的玩家证让位。

### 改动文件

- **新建** `src/features/pinpoint/PlayerCard.tsx` —— 顶右玩家证牌匾组件（金属冲压描边 + 头像 + LV + XP bar + W/L/Best + 奖杯横排）
- **新建** `src/features/pinpoint/pp-player-card.css` —— 牌匾专属样式（金边、压塑高光、证件孔缺口、悬停发光）
- `src/features/pinpoint/PlayerHUD.tsx` —— 整文件**删除**（或保留为内部空壳，由 PlayerCard 取代）
- `src/features/pinpoint/Sidebar.tsx` —— 删掉 PlayerHUD 渲染；合并 Balance/Session/Margin 为更紧凑版；BetSize 去掉大号 100；所有 chip 用矮版（28px）
- `src/routes/pinpoint.tsx` —— 顶栏 flex 末尾插入 `<PlayerCard>`；左栏宽度 300→260px
- `src/routes/style-guide.tsx` —— Cartridge 段把 PlayerHUD 示例换成 PlayerCard 牌匾示例
- `DESIGN.md` —— §4 新增 "PlayerCard 玩家证牌匾"（金属冲压视觉、不是 dashboard 卡片）；§5 写明"生涯数据归顶部牌匾，本局数据归左栏"；§7 Do's & Don'ts 加"不要把跨局生涯数据和本局资金数据放进同一个卡片维度"

### 不动

- 右侧网格（位置/宽度/Canvas/逻辑/快捷键全部不动）
- 数据来源：复用现有 `useGameStats` hook，PlayerCard 只是消费者
- LCD 卡带主视觉、字体、颜色 token
- 顶栏 BACK、PINPOINT 标题、LIVE 标、赛程 chip

### 验证

- Playwright 三视口截图 1440×900 / 1280×800 / **1024×780**：
  - 顶栏一行装得下 BACK + 标题 + 赛程 chip + PlayerCard 牌匾，无换行
  - 左栏从顶到底无滚动（断言 `sidebar.scrollHeight <= clientHeight`）
  - 右侧网格位置/尺寸与改动前一致
- 截 PlayerCard 元素特写（`element.screenshot`），确认金属冲压+证件孔+奖杯横排的视觉与左栏 LCD 卡明显不同
- `/style-guide` Cartridge 段单独展示 PlayerCard，正常渲染
