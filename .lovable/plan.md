# Strikezone v2 — 完全重写，1:1 复刻 Bettle 视觉

把现有 `/strikezone` 的 UI 全部推翻重写。**数据模型/玩法/路由不变**（live 市场、价格游走、点格下单、瞬时穿越判定、localStorage 持仓），只换 **布局 + 字体 + 颜色 + 网格尺寸 + 控件形态**，1:1 对齐 Bettle 截图。

## 1. 布局重做（参考 Bettle 截图 2）

```text
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────────┐    ┌────────────────────────────────────┐ │
│  │ ● BALANCE    │    │  Y-axis    Grid (~10 cols × 9 rows)│ │
│  │  $10,000 ◢   │    │   60¢                              │ │
│  │              │    │   55¢   [95.00x][95.00x][52.51x]…  │ │
│  │ ↗ SESSION    │    │   53¢   [19.36x][ 8.28x][ 5.71x]…  │ │
│  │   +$0        │    │       ╭─ $1,663 ─╮                  │ │
│  │              │    │   50¢ │  (pill)  │ [1.02x][1.01x]… │ │
│  └──────────────┘    │       ╰──────────╯                  │ │
│                      │   48¢   [22.50x][ 4.92x][ 3.37x]…  │ │
│  ┌──────────────┐    │   45¢   [95.00x][68.14x][18.86x]…  │ │
│  │ ┌MATCH┐STREAK│    │   40¢                              │ │
│  │ ┌USA┐DRAW PAR│    │                                    │ │
│  └──────────────┘    └────────────────────────────────────┘ │
│                      below grid:                            │
│  ┌──────────────┐    United States vs Paraguay · LIVE 23'  │
│  │ BET SIZE  A/D│                                          │
│  │   ┌─ 100 ─┐  │                                          │
│  │   $10  $50   │                                          │
│  │   $100 $500  │                                          │
│  │   $1k  $5k   │                                          │
│  └──────────────┘                                          │
│                                                             │
│  ┌──────────────┐                                          │
│  │  ▣ STOP      │  (big red glowing button)                │
│  └──────────────┘                                          │
│                                                             │
│  [♪ ON][📖 RULES][ⓘ]                                       │
└─────────────────────────────────────────────────────────────┘
                              ↑ 星空点状底纹（dotted bg）
```

左栏 **不再是 market 列表**。左栏改为 Bettle 那种 **控制面板**（Balance / Asset picker / Bet size / STOP / 底部 ON/RULES/info）。市场选择改成左栏中段一个 **二级 tabs**：上一级 `MATCH / STREAK`（先只有 MATCH 可用，STREAK 灰着），下一级 outcome 横排小 chips（USA / DRAW / PAR），跟 Bettle 的 CRYPTO/STOCKS + BTC/ETH/SOL 完全同形。

市场名（"United States vs Paraguay · LIVE 23'"）移到 **网格下方** 作为副标题（Bettle 也是把当前资产名放在网格下/上的小字处）。

移除现有 topbar 的 BAL/PL 显示（已经在左栏卡里）；topbar 只留 ← Back + STRIKEZONE 标志。

## 2. 网格重做

- **尺寸**：可视 ~10 列 × 9 行（不是 60×21）。每格 ~96px × 64px 大方块
- **每格内容**：单一大字号倍率 `2.33x` / `95.00x`，占满格子
- **倍率范围**：近格 1.0x–2.5x（浅色），远格 8x–95x（亮橙）。"95.00x" 是显示上限（cap），更远的格也都印 95.00x（跟 Bettle 一致）
- **颜色**：橙色热力 — 倍率越高越亮橙（`#ff6b1a` → `#7a2a0a`），低倍率近黑色。**完全去掉之前的绿/黄/红梯度**
- **边框**：每格 1px 亮橙发光边（`box-shadow: 0 0 8px rgba(255,107,26,0.4) inset`）
- **Y 轴标签**：左侧贴边，每 ~3 格一个 ¢ 标签，cyan/teal 色（如 Bettle 的 `1,659 / 1,660 / 1,661`）
- **X 轴**：取消文字标签（Bettle 也没有 +10s/+20s 这种）
- **价格 pill**：当前价位置画一个 **大型发光胶囊**：`$1,663`（在我们语境是 `50¢`），下方一条短发光线指向当前 Y 轴刻度。绿色霓虹 `#00ff88`，外发光 ~16px。位置随当前价上下平滑过渡
- **下注标记**：押过的格子边框变 **亮 cyan** + 中心叠 `$100` 小字（不替换倍率，倍率在角落缩小）。命中时整格 0.5s 白闪 + 倍率向上飘字

## 3. 字体

- **像素/街机字体**：Bettle 用的是接近 "Press Start 2P" / "VT323" 这种 bitmap 风格
- 用 `@fontsource/press-start-2p` 装 Press Start 2P 给数字、按钮标签、标志
- 正文 fallback 继续用 JetBrains Mono
- 所有数字（倍率、价格、余额、bet size、P/L）一律 Press Start 2P
- 标志 STRIKEZONE / BALANCE / SESSION / BET SIZE / STOP / RULES 也用 Press Start 2P，全大写 + 字间距

## 4. 颜色 / 底纹

- 背景：深紫黑 `#0a0a1a` + **dotted starfield**（CSS radial gradient 点阵噪点）
- 主体强调色：neon cyan `#00f0ff`（边框、tab、按钮描边）+ neon green `#00ff88`（balance、价格胶囊、ON 状态）
- 警示：red `#ff2d2d`（STOP）
- 热力：橙 `#ff6b1a` 主色

把这些写成 css 变量（scoped 在 `/strikezone` 容器内，避免污染主题）：
```css
.sz-root {
  --sz-bg: #0a0a1a;
  --sz-cyan: #00f0ff;
  --sz-green: #00ff88;
  --sz-orange: #ff6b1a;
  --sz-red: #ff2d2d;
  --sz-card: #0f0f24;
  --sz-card-border: #00f0ff33;
}
```

## 5. 左栏控件细节

| 控件 | 样式 |
|---|---|
| **BALANCE 卡** | cyan 描边圆角卡，左上角 `● BALANCE` 小字 cyan，下方 `$10,000` 巨大 Press Start 2P + 绿色发光，右下角微 `◢` 装饰角 |
| **SESSION 卡** | 同卡里下半部分，`↗ SESSION` + `+$0`（涨绿/跌红） |
| **MARKET 卡** | 上一行：`MATCH` (active cyan边) `/ STREAK` (灰禁用)；下一行 3 个 outcome 方块（如 USA/DRAW/PAR），active 项 cyan 边+icon |
| **BET SIZE 卡** | 顶 `BET SIZE` + 右上 `A/D or Scroll` 提示；中间巨大显示当前值 `100`（Press Start 2P 橙色发光）；下面 6 个 chip 2×3 网格 `$10 $50 / $100 $500 / $1k $5k` |
| **STOP** | 大块红色发光按钮，square icon + `STOP` 字 |
| **底部** | 3 个小圆角方块：`♪ ON`（cyan）、`📖 RULES`（开 modal 显示玩法）、`ⓘ`（开 about） |

## 6. 视觉效果（Bettle 的"灵魂"）

- **星空底纹**：用 SVG 或 CSS `radial-gradient` 点阵铺满 body
- **格子发光**：所有 active 元素带 `box-shadow` 外发光
- **价格胶囊跟踪**：current price 变化时胶囊用 `transition: top 1s linear` 平滑滑动
- **bet 命中**：cell `animate-ping` + 倍率 +N 飘字
- **STOP 按钮**：hover 时红光更亮 + 轻微 scale
- **格子点击**：scale 0.95 → 1 弹回 + cyan 边框闪一下

## 7. 不动的部分

- 路由仍是 `/strikezone`
- `useStrikezoneSession` 持仓/余额逻辑完全不动
- `useLiveTicker` 1s 价格游走不动
- 倍率公式不动（只把显示 cap 在 95.00x）
- 命中判定（瞬时穿越）不动
- 热键 A/D/Z/Esc 不动
- 仅 live 比赛开放不动
- 不加任何入口

## 8. 文件改动

```
新增：
  src/features/strikezone/sz-theme.css        # 局部 css 变量 + 星空底纹 + utility
  src/features/strikezone/Sidebar.tsx         # 重写：Balance/Market/BetSize/Stop/Footer
  src/features/strikezone/PriceCapsule.tsx    # 发光价格胶囊组件

重写：
  src/routes/strikezone.tsx                   # 新布局
  src/features/strikezone/Grid.tsx            # ~10×9 大格 + 橙色热力 + Y轴 + 价格胶囊层

废弃（删除）：
  src/features/strikezone/MarketSidebar.tsx
  src/features/strikezone/BetSizeBar.tsx
  src/features/strikezone/PriceChart.tsx      # Bettle 没有独立 chart，取消
  src/features/strikezone/PositionsPanel.tsx  # 改成左栏 BALANCE 卡下小一行 "OPEN: 3 · P/L"

字体：
  bun add @fontsource/press-start-2p
  在 src/main.tsx import
```

## 9. 验证标准（看图说话）

实现后页面必须满足：
1. 视觉与 Bettle 截图近似 80% 以上：橙色大格、左栏卡片堆叠、Press Start 2P 字体、星空底纹、绿色价格胶囊
2. 单击格子 → 边框 cyan + 中心 `$100`
3. 价格胶囊随 tick 平滑上下移动
4. STOP 按钮巨大显眼，hover 红光增强
5. 字体全部为像素/街机风
6. **不**出现现有版本的：60列密集小格、绿色热力、market 列表式 sidebar、独立的折线图

如果做完看起来还是不像，我会主动用 playwright 截屏 + zoom_image 对比 Bettle 截图，差哪儿改哪儿，不交差。
