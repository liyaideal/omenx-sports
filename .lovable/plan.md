放弃 3 个变体。**严格 1:1 复刻你给的参考图**，不再二次发挥。

## 仅改 1 个组件

`src/components/sports/promo/ComboChallengeSection.tsx` 里的 `ShareCardPreview`（1074-1167 行）整段重写。同步 `src/routes/style-guide.tsx` 的 demo。

## 1:1 还原参考图

画布
- 比例 **1080 × 1700**（≈9:14，按参考图测出），不是 4:5。
- 背景 `#050505` 纯黑 + 顶部左右两束黄绿 radial 光锥 + 全幅细密点阵（4px grid，opacity 0.08）。
- 调色板锁死：
  - **金黄** `#F2D024`（OMENX 主标题分隔/REWARD/ABCD2026/箭头）
  - **荧光绿** `#C6FF3D`（票券描边、WIN 文字、SHARE & INVITE 描边、序号方框）
  - 白 `#FFFFFF`、灰 `#7A7A7A`

顶部
- 巨大 "OMENX" 居中白色字 wordmark：用 Google Font **Saira Stencil One** 或 **Audiowide** 逼近参考图的切角字形（先用 Audiowide，离线兜底 `font-pitch`）。字号占画幅宽度约 85%。
- 下方：小尺寸金色奖杯 icon（lucide `Trophy`，金黄描边）外加 4 个直角取景框角标（绝对定位 4 个 L 形短线）。
- 再下一行小字 "WORLD CUP 4-LEG COMBO"，字间距 0.3em，金黄色。

Hero
- "10U → 500U" 单行：10U 白色 + 箭头金黄 + 500U 金黄。字号 ~140px，使用 Audiowide。
- 副标题 "4 PICKS. HIT ALL 4." 居中，荧光绿。数字 "4" 用金黄。

主票券（绿色描边 + 四角缺口）
- 外框：2px 荧光绿 `#C6FF3D`，圆角 8px。
- 左右各两个外凹半圆缺口（绝对定位 4 个 `#050505` 圆点 + 1px 绿边）模拟票根。
- 顶部居中 "« MY 4-LEG COMBO »"：荧光绿字 + 两侧用两组 `//` 斜线装饰（旋转 -20°）。
- 内部 4 行 leg（横向分隔线荧光绿 0.5px）：
  - 序号方框：32×32，2px 荧光绿描边，切上下两个角（clip-path 八边形），里面数字荧光绿。
  - 国旗：40×40 圆形，2px 荧光绿描边，内嵌真国旗（先用 emoji flag 在白底圆里渲染，国家从 `ticket.legs[i]` 推断）。
  - TEAM 名：白色 Audiowide 大字。
  - WIN：右对齐，荧光绿。
- 底部三列 STAKE / ODDS / REWARD，竖向荧光绿分隔线：
  - 每列顶部一个小 icon（lucide `Coins` / `TrendingUp` / `Trophy`，荧光绿）
  - 中间标签灰色小字
  - 底部数值：STAKE/ODDS 白色，REWARD 金黄

底部 SHARE & INVITE 票券（独立小票）
- 同样的荧光绿描边 + 四角缺口（更小）。
- 左侧：lucide `Users` 荧光绿 icon + "SHARE & INVITE" 白字 → "REFERRAL CODE" 荧光绿小字 → "ABCD2026" 金黄大字（Audiowide）。
- 右侧：白底 80×80 QR 占位（暂用 CSS 棋盘格图案，后续真 QR 留口子）+ "SCAN TO JOIN" 荧光绿小字。

## 字体策略

- 新增 Google Font：`Audiowide`（标题）。在 `src/styles.css` 顶部加 `@import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');`，注册 token `--font-poster: 'Audiowide', system-ui;` + 工具类 `.font-poster`。
- 不引 Saira Stencil One；Audiowide 接近参考图的切角宽字感，体积小。

## 国旗

`countryToFlagEmoji(team)` 局部 helper：从 leg.teamLabel 提国家 → 返回 emoji。覆盖 Argentina/Brazil/France/Spain/Portugal/Netherlands/Belgium/England/Germany/Italy。fallback 显示首字母。

## 数据接入

参考图全部硬编码值都映射到 `ticket`：
- "10U" ← `ticket.stakeU`
- "500U" ← `ticket.grossPayoutU`
- "50x" ← `ticket.lockedActivityOdds`
- 4 行 ← `ticket.legs[0..3]`
- "ABCD2026" ← `ticket.referralCode ?? "OMENX2026"`

## 记忆

完成后写入 `mem://design/share-poster` 锁定海报样式（黄绿配色 + 票券缺口 + Audiowide），并在 index 加引用。Carnival LED 记忆不动（那是 hero 区域规则，海报例外明确写在新记忆里）。

## 验收

跟参考图肉眼比对：OMENX 字形、票根缺口位置、4 行 leg 排版、三列 stats、底部 SHARE/QR 块都要 1:1 对得上。
