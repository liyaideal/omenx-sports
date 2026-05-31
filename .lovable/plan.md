## 目标

1. 抽屉 header 精简 + 缩高。
2. 加了 PICK SIDE 那一层之后下面的 Buy/Sell CTA 滚到屏外 → 让 CTA 始终一屏可见。

## 改动

### 1. `TradeDrawer.tsx` — Header 精简

**删掉**：
- EPL 联赛 chip + `· TODAY 6:00PM` 那行
- `Vol $1.82M · 2,104 traders` 那行

**保留**：
- 标题 `Man City vs Arsenal`
- `Full market ↗` 链接（放到标题右侧同一行，靠右对齐）
- 右上角关闭 X

**高度**：`py-4` → `py-3`，去掉多余的间距 div，整体从 ~110px 降到 ~56px。

### 2. `TradeDrawer.tsx` — 各 section 内距收紧

- `PICK OUTCOME` / `PICK SIDE`：`py-4` → `py-3`，section 间分隔线保留。
- TradeForm 外层 wrapper：`px-5 py-4` → `px-5 py-3`。

### 3. `TradeForm.tsx` — CTA 悬浮在底部

最稳的方案：让 CTA 在 SheetContent 滚动容器里 `sticky bottom-0`，背景加 `bg-background/95 backdrop-blur`，上方加一道细分隔线。这样无论中间内容多长，按钮一直贴底可见。

具体改动：
- TradeForm 根容器从 `rounded-2xl border bg-surface p-5` 改为不带 padding 的纯内容容器（或保留卡片外观，但内部最后的按钮抽出来）。
- 简洁做法：在 TradeForm 内部不动太多，仅给最后那个 `<button>` 加上：
  ```
  sticky bottom-0 -mx-5 -mb-5 mt-5 px-5 py-3 
  bg-background/95 backdrop-blur 
  border-t border-border rounded-none
  ```
  rounded 取消、左右负 margin 撑满抽屉宽度，sticky 让它贴到 SheetContent 的视窗底部。

### 4. SheetContent 滚动容器

当前已经是 `overflow-y-auto flex-col`，sticky 子元素能正确贴底 — 不用动结构。

## 不动

- Provider / 调用方 / 数据。
- 两层选择逻辑（上一轮刚加的）。
- 卡片外的 sports-markets 数据。
- /event/$id 全页交易面板。

## 不在范围

- 桌面 vs 移动差异化布局（sticky 方案对两端都生效）。
- TradeForm 内部表单字段精简 — 保持现有信息密度，靠 sticky CTA 解决"看不见按钮"的问题。
