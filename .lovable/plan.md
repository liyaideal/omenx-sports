## 问题

`ShareCardPreview` 海报中的 leg 行目前只渲染 `extractCountry(leg)`（取 `teamLabel` 去掉 win/draw 后剩余的部分）+ 固定的 "WIN"。这套逻辑只对 MONEYLINE 有效：

- MONEYLINE：`teamLabel = "Brazil Win"` → 显示 `🇧🇷 BRAZIL WIN` ✓
- SPREAD：`teamLabel = "Brazil -1.5"` → 显示 `🇧🇷 BRAZIL -1.5 WIN`，但**丢失对手 / 赛事上下文**
- TOTAL：`teamLabel = "Under 0.5"` → 显示 `⚽ UNDER 0.5 WIN`，**完全没有球队信息**（即截图反馈的问题）

## 方案

只改 `src/components/sports/promo/ComboChallengeSection.tsx` 内的海报 leg 渲染（约 1550–1608 行）。不动 state / 数据层。

### 1. 新增 helper `getLegPosterContent(leg)`

按 `leg.marketType` 分支返回 `{ flag, primary, secondary, suffix }`：

| marketType | flag                              | primary (大字) | suffix    | secondary (小字, 0.7 透明)        |
| ---------- | --------------------------------- | -------------- | --------- | --------------------------------- |
| MONEYLINE  | 选中方国旗 / Draw → ⚽            | `BRAZIL`/`DRAW`| `WIN`     | `BRA vs ARG`                      |
| SPREAD     | 选中方国旗（解析 `teamLabel` 首词）| `BRAZIL -1.5`  | `WIN`     | `BRA vs ARG`                      |
| TOTAL      | ⚽                                | `OVER 2.5` / `UNDER 0.5` | `WIN` | `BRA vs ARG`                |

- 解析球队名：取 `teamLabel` 去掉尾部数字/符号（`/\s+[+-]?\d+(\.\d+)?$/`）；TOTAL 跳过球队解析。
- `secondary` 统一从 `leg.matchLabel`（已是 `"Brazil vs Argentina"` 格式）取，转大写显示。

### 2. 调整 leg 行结构

把现有「team + WIN」单行改为两行堆叠：

```text
[#] [flag]  PRIMARY  WIN          ← 现有字号 2.65cqw
            BRA vs ARG            ← 新增 1.7cqw, POSTER_NEON opacity 0.55
```

- 用 `flex-col` 包裹 primary/secondary；`secondary` 仅在非空时渲染。
- 行高保持原 padding（`py-[1.8%]`）不变，因为多出一行小字仍在原视觉密度内（实测 4 行 × 多 ~1.7cqw 仍在 ticket frame 内）。

### 3. 同步 `/style-guide`

`src/routes/style-guide.tsx` 现有海报 demo 用的是 mock combo（4 条 moneyline）。新增一个 `ShareCardPreview` 变体 demo，使用混合 leg：1× MONEYLINE + 1× SPREAD + 1× TOTAL + 1× DRAW，展示新的两行结构。在 §海报 区域加一句话说明：「Spread/Total 必显示 matchLabel 副标题」。

### 4. 不变

- `LegSlot`（构建区）保持现状 —— 那边已经 render 了 `leg.matchLabel · leg.marketLabel`，信息完整。
- 文案颜色 token（`POSTER_NEON`、`POSTER_GOLD`）保持。
- 不动 `extractCountry`（仍被 ticket frame 标题外其他地方间接用？实际只此一处，但保留以免误删）—— 可在新 helper 内部调用 `countryToFlag`。

## 验收

- `/promo/world-cup?tab=combo` 选 4 条全 TOTAL（Under/Over）→ 海报每行显示「OVER 2.5 WIN」+ 下方「BRA VS ARG」小字。
- 选 SPREAD 时 → 「BRAZIL -1.5 WIN」+ 「BRA VS ARG」。
- 纯 MONEYLINE 4 腿 → 视觉与现在一致，只是多了 matchLabel 副标题。
- `/style-guide` 海报区出现混合 leg 变体。
