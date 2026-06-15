
# OMENX 世界杯狂欢季 — 活动页方案 (v2 · LED 记分牌方向)

## 0. 已确认决策
- **结构**：Tab 分页（Overview / 新人入场礼 / 连中挑战 / 幸运盲盒 / 规则）
- **入口**：① AppTopBar 加「🏆 世界杯狂欢季」高亮项；② `LeagueHubHero` 右侧空白填促销卡（仅 WC2026）
- **数据**：纯前端 mock，可玩但不持久化
- **不做**：Trash 部分 / KOL 版 / 盈利率冲榜赛
- **画风**：体育场 LED 记分牌（v3 prototype）

## 1. 路由 & 文件

```text
src/routes/
  promo.world-cup.tsx                ← Tab 容器，?tab= 控制选中
src/data/
  world-cup-carnival.ts              ← 全部 mock 常量（奖励/档位/概率/文案）
src/components/sports/promo/
  ScoreboardHero.tsx                 ← 顶部 LED 记分牌（奖池 + 倒计时 + LIVE 指示）
  CarnivalTabs.tsx                   ← 5 个 Tab 切换
  OverviewSection.tsx                ← Overview 主体（见 §2）
  NewbieRewardsSection.tsx           ← 4 任务卡 + 邀请进度
  ComboChallengeSection.tsx          ← 4 槽位选 outcome + 累乘赔率
  LuckyBoxSection.tsx                ← 3 档奖池 + 开箱转盘
  CarnivalRulesSection.tsx           ← 规则 Accordion
  CarnivalPromoCard.tsx              ← LeagueHubHero 右侧入口卡
  ScoreboardTicker.tsx               ← LED 滚动通告条（复用底部）
```

## 2. Overview 视觉规范（落实选中的 LED 记分牌）

完全按 v3 prototype 还原，并落到现有 design token：

**字体**
- 引入 Google Fonts：`Orbitron`（7-segment 数字感）、`Chakra Petch`（机械正文）
- 在 `src/styles.css` 加 `@utility font-scoreboard`（Orbitron）和 `@utility font-pitch`（Chakra Petch）

**Hero 记分牌**（ScoreboardHero）
- 黑底 + 4px 深灰边框 + 圆角 + LED 点阵纹理 (`radial-gradient #fff 1px / 4px`)
- 红色脉冲点 + "Live Prize Pool" kicker
- `3,000,000 U` — 巨号 Orbitron italic，accent green `oklch(0.7 0.18 145)` + drop-shadow 绿光
- 副标：「JACKPOT ACCUMULATING · WORLD CUP 2026 EDITION」
- 左右两条垂直绿色渐变光带（场馆结构感）
- 倒计时（Orbitron）右上：`12D : 04H : 32M`

**3 个系列入口卡**（OverviewSection 内）
按文档真实系列重命名（不用 prototype 占位名）：
- **SEC-01 · 新人入场礼** — accent green，560 U
- **SEC-02 · 世界杯连中挑战** — amber/yellow，10U → 500U
- **SEC-03 · 每日幸运盲盒** — blue，签名球衣
- 卡片：方框边 + 小方块编号图标 + SEC 编号 + 标题 + 一句话 + 底部 1px LED 长条（hover 发光）
- 点击 → `navigate({ to: '/promo/world-cup', search: { tab: 'newbie'|'combo'|'luckybox' } })`

**用户进度条**（Fan Status）
- `LVL N`（Orbitron 绿）+ 「Qualification Phase / 85% to Finals」
- 3px 绿光进度条，扫光动画
- 右侧 mock 已 follow 的队伍国家代码方块（ARG / FRA / +4）

**底部 ScoreboardTicker**
- 黑底窄条，文本横滚（已有 `ticker-scroll` keyframes，复用）
- 滚 3 条 mock：本周新增系列 / 下场比赛倒计时 / Top trader 收益
- 落地页底部 + 顶部入口 hover 时也可用同款窄条

## 3. 其它 Tab（沿用 LED 视觉语言）
- **新人入场礼**：4 张任务卡用同 LED 卡片骨架，进度条用绿光段；CTA 按钮黑底绿边
- **连中挑战**：4 槽位 = 4 块「比赛卡槽」记分牌；累乘赔率 = 大号 Orbitron
- **幸运盲盒**：3 档奖池 = 3 张「奖品柜」LED 卡；开箱 = 滚动数字 + 最终结果停在中央，配 Orbitron 抖动
- **规则**：Accordion 标题用 `font-scoreboard`，正文 Chakra Petch

## 4. 入口实现

**A. AppTopBar** — `NAV` 数组首位插入：
```ts
{ label: "🏆 世界杯狂欢季", to: "/promo/world-cup", highlight: true }
```
样式：accent green 渐变背景 + 微光晕 + Chakra Petch 字体，区别于其他 nav 项。活动结束删一行即可。

**B. LeagueHubHero** — 加可选 `promoSlot?: ReactNode` prop；`league.$slug.tsx` 在 WC2026 时传入 `<CarnivalPromoCard />`：
- 迷你 LED 记分牌样式，显示「🏆 300万U 奖池 · 倒计时」+ 「立即参与」按钮
- md+ 居右浮，sm 折到 hero 下方
- 不影响其它 league hero

## 5. 数据 / 状态
- 全部 mock 在 `world-cup-carnival.ts`：奖励档位、抽奖概率、滚动条文本、倒计时目标日期
- 提交组合 / 已抽次数 → 组件 `useState`，刷新重置
- 倒计时：`useEffect` 1s tick 到 `2026-07-19`

## 6. Style Guide 同步
在 `/style-guide` 新增 "World Cup Carnival" 区块，展示：
- ScoreboardHero、CarnivalPromoCard、3 张系列卡、Fan Status 进度条、ScoreboardTicker

## 7. 不动 / 不破坏
- 不改 `LeagueHubHero` 已有 props，只新增可选 `promoSlot`
- 不接 Lovable Cloud，不动 schema、server fn、其他页面
- 不破坏 ticker / mini player / event detail 现有布局

## 8. 落地顺序（建议一次实现，可串行）
1. 加字体到 styles.css + Google Fonts link
2. 常量数据 `world-cup-carnival.ts`
3. ScoreboardHero / CarnivalTabs / ScoreboardTicker / CarnivalPromoCard 基础组件
4. OverviewSection（含 3 入口卡 + Fan Status）
5. 三个系列 Section（新人礼 / 连中 / 盲盒）
6. RulesSection
7. 路由 `promo.world-cup.tsx`
8. AppTopBar 加入口项
9. LeagueHubHero `promoSlot` + WC 传入 PromoCard
10. /style-guide 同步
