# Pinpoint 重命名 + 街头滑板贴纸风格改造

## 1. 重命名 strikezone → pinpoint

### 路由
- 新建 `src/routes/pinpoint.tsx`（由旧 `strikezone.tsx` 改名），`createFileRoute("/pinpoint")`
- 删除 `src/routes/strikezone.tsx`
- `routeTree.gen.ts` 由插件自动重建，不手动改

### 目录与文件
- `src/features/strikezone/` → `src/features/pinpoint/`
- `sz-theme.css` → `pp-theme.css`（内容整体重写，见第 3 节）
- `useStrikezoneSession.ts` → `usePinpointSession.ts`
- storage key `omenx.strikezone.v1` → `omenx.pinpoint.v1`（旧数据自然失效，反正一直在洗）

### 命名 token 全量替换
- 类型/Hook：`StrikezonePosition` → `PinpointPosition`，`StrikezoneState` → `PinpointState`，`useStrikezoneSession` → `usePinpointSession`，`useStrikezoneGroups` → `usePinpointGroups`，`StrikezonePage/Inner` → `PinpointPage/Inner`
- CSS 前缀 `sz-*` → `pp-*`（`sz-card`、`sz-pixel`、`sz-display`、`sz-chip`、`sz-stop`、`--sz-cyan` 等所有变量与类）
- 文案：UI 内 `STRIKEZONE` 大字、页面 title/og 全部改为 `PINPOINT`
- `.lovable/plan.md` 内提及同步更新

### 用户可见路径
- 旧的 `/strikezone` 直接 404（用户没要求做 301，保持简单）

## 2. 设计方向：街头滑板贴纸

定调：滑板品牌物料（Supreme / Palace / Thrasher / Stüssy）的能量，不是儿童贴纸。核心是"拼贴 + 撕边 + 丝印感"，而不是霓虹发光。

### 风格关键词
- **拼贴层叠**：卡片像被一张张贴上去的方贴，带轻微旋转（-2°~+3°）、错位阴影
- **丝印质感**：套色不准（offset print misregistration），印刷颗粒（grain noise）覆盖
- **黑黄危险条**：警示斜条用于强提示（爆仓、止损、高杠杆区）
- **手写体 + 工业体混排**：标题用粗压扁体（Anton / Bungee），副标题用涂鸦手写（Permanent Marker / Rubik Mono One），数字用 mono（JetBrains Mono）保持可读
- **大字标语**：`PINPOINT`、`LIQUIDATED`、`ALL-IN` 这种关键词做"贴纸标题"
- **图章/印戳**：状态用圆/方戳子表达（WON / LOST / LIVE），带半透明红/黑墨水感
- **撕纸边**：卡片边缘可选锯齿/撕边 SVG mask

### 色板（取消霓虹）
- 纸底 `#f4ede0`（米黄牛皮纸）/ 深底 `#141210`（沥青黑）双主题，先做深底
- 主强调 `#ff3b1f`（消防红）
- 次强调 `#ffd400`（出租车黄）
- 辅助 `#1f8a4c`（深绿，用于赢/上涨）
- 中性 `#e7e1d3`（米白文字）/ `#7a736a`（哑灰）
- 警示斜条 `#000` + `#ffd400`

### 不要的东西
- 任何 cyan/magenta 霓虹发光（`text-shadow: 0 0 8px`）
- 像素体（Press Start 2P）街机风
- 暗黑 + 蓝紫赛博朋克

## 3. 视觉实现范围（本轮只换"皮"，不动业务）

- 全量重写 `pp-theme.css`：删掉所有 glow / pixel / scanline，引入 grain noise（CSS `background-image` 用 SVG turbulence）、贴纸阴影 token `--pp-sticker-shadow`、警示条 utility `pp-hazard-stripes`
- 字体：用 `@fontsource/anton`、`@fontsource/permanent-marker`、`@fontsource/bungee`、`@fontsource/jetbrains-mono`（4 个包，安装后在 `src/main.tsx` 引入；不动 `index.html`）
- 组件级最小改动：
  - `Sidebar.tsx`：把 sz-card / sz-pixel / sz-display 替换为 pp-sticker / pp-marker / pp-headline；保持结构和数据绑定
  - `Grid.tsx`：canvas 调色板换成新色板，关键文字（HIT / LIQ / +$xx）改成印戳样式；DOM 浮层用新字体
  - `EventTabs.tsx`：tab 改成贴纸条
  - 路由页头部 `STRIKEZONE` 大字 → `PINPOINT` 贴纸 logo（带轻微旋转 + 黄底黑字）
- 爆仓 modal：换成"红章 + LIQUIDATED 印戳 + 黑黄斜条边"
- 不改任何 hook 逻辑、equity 计算、liquidation 触发条件、下单流程

## 4. /style-guide 同步

按 Core 规则，`/style-guide` 加 `Pinpoint Stickers` 区块演示：sticker card、hazard stripes、印戳、headline、marker text、新色板。

## 5. 不在本轮范围

- 暗/亮双主题切换（先只做深底）
- 旧路由 301 重定向
- 撕边 SVG mask（先用直角 + 错位阴影达到贴纸感，撕边作为后续优化）
- 真实丝印套色不准动画（先静态错位）

## 技术细节

### 文件操作
```
mv src/features/strikezone → src/features/pinpoint
mv src/routes/strikezone.tsx → src/routes/pinpoint.tsx
rm src/features/pinpoint/sz-theme.css → 新建 pp-theme.css
```
之后全局 sed 替换 import 路径与符号名。

### 字体安装
```
bun add @fontsource/anton @fontsource/permanent-marker @fontsource/bungee @fontsource/jetbrains-mono
```
在 `src/main.tsx` 顶部 import 这 4 个包；`src/styles.css` 的 `@theme` 加 `--font-display: "Anton"`、`--font-marker: "Permanent Marker"`、`--font-sticker: "Bungee"`、`--font-mono: "JetBrains Mono"`。

### 关键 CSS token（pp-theme.css 节选）
```css
--pp-paper: #141210;
--pp-ink: #e7e1d3;
--pp-red: #ff3b1f;
--pp-yellow: #ffd400;
--pp-green: #1f8a4c;
--pp-mute: #7a736a;
--pp-sticker-shadow: 3px 3px 0 #000, 6px 6px 0 rgba(255,212,0,0.35);
--pp-grain: url("data:image/svg+xml;utf8,<svg ...turbulence.../>");
```

### 验证
- `code--exec` 跑 `rg -i "strikezone|sz-"` 应返回空（除 routeTree.gen.ts 自动重建窗口外）
- Playwright 截图 `/pinpoint`、`/style-guide` 确认风格转向、无霓虹残留、字体加载成功
