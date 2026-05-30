## 目标

调整 `/league/$slug?view=props` 页面：
1. 取消 "Group winners" 和 "Binary questions" 的分区，统一成一个 "Markets" 网格 — 用户不需要看到多选/二元的区别。
2. Spotlights 模块从竖版人物卡改成横版卡片，仍作为"重点 props 推荐"在 Props 顶部展示。
3. Season futures（赛季冠军 / 最佳射手）仍保留独立分区。

---

## 改动清单

### 1. `src/components/sports/league/PropsGrid.tsx`
- 删除原 "Group winners" 和 "Binary questions" 两个 section。
- 新增一个统一 section `"Markets"`：把 `GroupWinnerCard`（多选）和 `BinaryQuestionCard`（二元）渲染到同一个 grid（`md:grid-cols-2 xl:grid-cols-3`）。顺序：先 groups，后 binary。
- Spotlights 区段保留，标题改为 "Featured props"，位置放到 Markets **上面**（作为重点推荐）。
- Season futures 保持原位置（Markets 之后）。

### 2. 新建 `src/components/sports/league/SpotlightPropsCardHorizontal.tsx`
横版卡片，替换 PropsGrid 里的 `PlayerPropsSpotlight` 用法（PlayerPropsSpotlight 原组件用于首页 carousel，保留不动）。

布局（约 height 180–200px）：
```
┌───────────────────────────────────────────────────────────┐
│ [Portrait 140×]   @handle · POS              Vol · ends   │
│  (neon ring,      Firstname Lastname                       │
│   half size)      ─────────────────────────────────────    │
│                   • Anytime scorer        Y 62¢  N 38¢    │
│                   • 2+ goals              Y 24¢  N 76¢    │
│                   • Shots o2.5            Y 51¢  N 49¢    │
└───────────────────────────────────────────────────────────┘
```
- 左列固定宽度（~140px）放头像 + neon ring（缩小版，复用 PlayerPropsSpotlight 的渐变蒙版思路但更紧凑）。
- 右列：顶部 handle/名字/POS，下面纵向列出 prop 行；每行 title + 两个小 Y/N 按钮，复用 `useTradeDrawer` 打开交易抽屉。
- 显示前 3 条 props，多余的折叠为 "+N more"。

### 3. `PropsGrid` 的 Spotlights grid
- 从 `md:grid-cols-2 xl:grid-cols-3`（竖版）改为 `md:grid-cols-1 xl:grid-cols-2`（横版更宽）。
- 标题文案改为 "Featured props · 重点关注"。

---

## 不改动
- `PlayerPropsSpotlight`（首页 dashboard 用的竖版 carousel）保留。
- `GroupWinnerCard` 和 `BinaryQuestionCard` 内部样式不动，仅改 PropsGrid 里的分组。
- 数据层（`tournament.ts` / `sports-markets.ts`）不动。
- `/style-guide` 同步加一个 `SpotlightPropsCardHorizontal` 的 demo（按项目核心 memory 要求）。

---

## 风险
- 把 groups（4–6 个）和 binary（若干）放到同一 grid，密度增加；MAX_VISIBLE=3 的折叠机制已经能压住卡片高度，xl 三列下排版正常。
- 横版卡在窄屏（< md）会变成单列竖排，内部仍是左右布局 — 需要在 < sm 时把左列头像缩到 96px 避免挤压；会在组件里加 responsive class。
