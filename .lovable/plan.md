# TopBar ↔ 首个 H1 间距 + 写入 style-guide

## 问题

`src/routes/index.tsx` 之前主网格用 `pb-6 md:pb-8`，但顶部 padding 为 0 —— TopBar 底边几乎贴着 `Featured event` / `Live & upcoming` H1。之前是 `CategoryStrip` 外层的 `pt-6 md:pt-8` 在撑高度，删 chips 时一起删掉了。

## 变更

1. **`src/routes/index.tsx`**
   - 主网格 className：`px-6 pb-6 md:px-8 md:pb-8` → `px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10`
   - 给 TopBar 和首个 section H1 之间 32–40px 喘息空间

2. **`src/routes/style-guide.tsx`** — 在 `Spacing & Radius` (Section 15) 里新增一个 "Page rhythm" 卡片，把这条规则固化下来：

   | Gap | Value | When |
   |---|---|---|
   | TopBar → 首个 H1 | `pt-8` / `md:pt-10` (32–40px) | 任何路由内容区进入时 |
   | H1 → 首张卡 | `gap-4` (16px) | section 内部 |
   | 同级 section 之间 | `gap-5` (20px) | 主网格的纵向 stack |
   | Card 内部 padding | `p-5` 或 `p-6` | 卡片本体 |

   用一个简单的可视示意（带 TopBar bar、H1、card 占位）说明这三个层级。

## 不动的部分

- TopBar 本体、所有卡片、Live 脉冲点、Top Scorer 卡都不变
