# 删除顶部 CategoryStrip

## 变更

1. **`src/routes/index.tsx`**
   - 删掉 `<CategoryStrip />` 及其外层 `<div className="pt-6 md:pt-8">`
   - 删掉 `CategoryStrip` 的 import
   - 这样 `AppTopBar` 下面直接接主网格，`Featured` / `Live & upcoming` H1 自然成为页面入口

2. **`src/components/sports/dashboard/CategoryStrip.tsx`** — 删除
3. **`src/data/sports-markets.ts`** — 删掉 `CATEGORIES` 常量（如果只有 CategoryStrip 在用）

4. **保留 "Live" 角标**
   - 在 `Live & upcoming` 的 SectionHeader 标题左侧加一个 `h-2 w-2 animate-pulse rounded-full bg-[oklch(0.7_0.22_25)]`（红色脉冲点）
   - 这样"现在有 live 内容"的信号还在，但不再是一个独立的过滤器 chip

## 不动的部分

- 主网格、所有卡片、Top scorer 卡、Mbappé spotlight 全部不变
- `AppTopBar` 不变
- 季节性问题暂不处理（demo 数据，不深究）

## 结果

页面更干净：TopBar → 直接进入 `Featured event` + `Live & upcoming events`（带红色 live 脉冲点）。没有看起来能点但其实没用的 chips。
