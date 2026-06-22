## 问题

`/style-guide#world-cup-carnival` 里 Guess the Legend 只展示了"组装好"的 scoreboard demo 和 bay 三态，但没有列出原子素材清单——开发者照着这页写新页面时，不知道：
- 8 个国家用了哪些做旧大旗 (`flagImage`) 和扁平 ISO 旗 (`iso2`)
- 10 张签名球员图分别长什么样、对应哪个国家
- mystery 占位、CIV 预热 bonus 各是哪张
- HUD / Bay / Archive 三处的颜色 token (HIT / LIVE / MISS / AMBER) 分别是什么

## 方案

在现有 "scoreboard chassis demo" 之上**新增一段 "Assets & Tokens Inventory"**，纯文档性质，不引入新组件、不改业务代码。

### 修改：`src/routes/style-guide.tsx`

新增一个 `LegendAssetsInventory()` 子组件，插在现有 `LegendScoreboardDemo` 之前（让人先看到清单再看组装效果）。包含 4 块：

1. **Country flags · weathered hero (`flagImage`)** — 8 张 (BRA/ESP/FRA/ARG/GER/ENG/NED/POR) 的 thumbnail（h-24 卡片），下方注 `LEGEND_COUNTRIES.{CODE}.flagImage` 和源路径 `src/assets/legend-reveal/flag-*.jpg`，说明仅用于 ActiveRoundBay。
2. **Country flags · flat ISO SVG (HUD)** — 同 8 国，渲染 `FlagSvg code={iso2}`（h-12 矩形），下方注 `country-flag-icons/react/3x2` + 对应 `iso2` 字段。说明仅用于 RoundProgressHud。
3. **Signed portraits (`LEGEND_SIGNED_IMAGES`)** — 10 张 (BRA/ESP/FRA/ARG/GER/ENG/NED/POR/CIV/mystery) 的 thumbnail（h-32，aspect 5/7 框，带烫金边），下方注 `LEGEND_SIGNED_IMAGES.{CODE}` / `LEGEND_MYSTERY_PORTRAIT`，说明 mystery 用于未官宣回合，CIV 是预热 bonus 不参与主回合。
4. **Color tokens** — 4 个色卡：ACCENT `#4ade80` (HIT)、AMBER `#facc15` (LIVE)、MISS `#f87171`、chassis bg `#0d0d0d`，每个色卡下方写它在哪些组件里出现。

为了让 `FlagSvg` 在 style-guide 里可用，把它从 `GuessTheLegendTab.tsx` export 一下（当前是文件内部 helper），或者在 inventory 里直接 `import * as FlatFlags from 'country-flag-icons/react/3x2'` 自己渲染——选后者，避免污染业务组件的公开 API。

### 不动

- `LegendScoreboardDemo` / `LegendBayPlayground` 保留不动。
- 没有新增素材生成。
- 不改 DESIGN.md（这是 playground 完整度补丁，不引入新规则）。

### 验证

跳到 `/style-guide#world-cup-carnival`，确认新增的 "Assets & Tokens Inventory" 块在 demo 上方，所有 8 国双形态旗 + 10 签名图 + 4 token 全部可见且带标签。
