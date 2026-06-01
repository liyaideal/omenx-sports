## 改动

只动 `src/routes/event.$id.tsx` 里的 `EventDetailHeader`（含 `CrestBlock` 微调）。

### 1. 类型标签 `Match` → `Game`

`market.kind === "match"` 的显示文案改成 `Game`（与全局 league hub `Games` tab 的统一术语对齐，单数用于单场标签）。其它分支不动。

### 2. 顶部 VOL / 24H / 参与人数 → 右侧竖排

不再放在 league chip 同一行。改为放在 fixture 区域**右侧**单独一列，三行竖排：
- `VOL` / `$612K`
- `24H` / `$184K`
- 人数 icon / `4,720`

每行 label（mono uppercase 10px muted）+ value（tabular foreground sm）。右对齐，占固定宽度（≈ 96px）。

### 3. 头部更紧凑、更醒目

外层 padding 从 `p-6` 缩到 `px-5 py-4`，并去掉 fixture 区 `mt-5`（用 `mt-3`）。

新结构：

```text
┌───────────────────────────────────────────────────────────────┐
│ [WORLD CUP] [GAME]                                  [< SHARE] │
│                                                               │
│   🇺🇸           vs              🇵🇾          VOL   $612K    │
│  United        Kickoff         Paraguay      24H   $184K    │
│  States   Today · 9:00pm                     👥    4,720    │
└───────────────────────────────────────────────────────────────┘
```

- 顶条只剩 chips（左）+ Share（右）—— 去掉那条 inline stats，整行更轻。
- Fixture 块和 stats 列在一个 flex 里：`flex items-center justify-between gap-6`，fixture 居中靠左/中，stats 列贴右。
- CrestBlock 尺寸从 `72×72` 缩到 `60×60`，队名 `text-sm` 不变，整体高度自然下降。
- `vs` 字号从 `text-3xl` → `text-2xl`，Kickoff 行间距收紧。

不动业务逻辑、不动数据、不动 share / fixture 数据源。

## 文件

- `src/routes/event.$id.tsx`（仅 `EventDetailHeader` + `CrestBlock`）
