
## 目标

参考截图修两件事，让"K 线撞到哪个格子"一目了然，命中下注格子时有强烈的赌博命中爽感。

1. **撞击瞬间，同列其他格子立刻消失，只留下被撞的那一格短暂停留并发光**——目前是整列一起淡出，看不出哪个被撞。
2. **如果被撞的格子是用户下注的格子，爆出一圈金/绿色星星粒子**（叠加在现有的金光环 + `+$xxx` 飘字之上）。

## 修改范围

只动 `src/features/strikezone/Grid.tsx`（Canvas 渲染层）。不动业务逻辑、session、结算逻辑。

## 实现要点

### A. 列结算时区分 "hit row" vs 其他 row

`Grid.tsx` 现在 RAF 循环里检测到 `prevFirstSec < firstSec`（一列刚跨过 NOW 线）时，给该列 11 行全部 push 同样速度的 `DyingCell`。改为：

- 在跨过 NOW 的那一帧，取 `hitRow = round(priceRef.current) → 对应的 row index`（用 `centerRef.current` 反推），作为这列被 K 线撞到的格子。
- **非 hit row**：以更快的速度淡出（`DYING_MS` 从 220ms 调到约 140ms），同时轻微向内塌缩 + 透明度直降，让"周围立刻清空"的感觉成立。
- **hit row**：新增一个 `HitFlashCell` 状态（约 650ms）：
  - 0–120ms：白→金色亮度 punch，scale 1 → 1.18 → 1，边框由橙变金（`#ffd84a`）。
  - 120–450ms：保持高亮 + 脉冲发光环。
  - 450–650ms：渐隐到 0。
  - 该格在期间始终绘制，覆盖在淡出列之上。
- 已是 user bet 的列（`settledColumnsRef` 已加），现在的逻辑跳过 dying，改为：**仍然对非 bet 行 spawn 快速淡出 DyingCell**（让用户清楚看到"K 线就撞到我下注那行"），bet 行交给已有 win/lose effect 处理。

### B. 命中下注格的星星粒子

新增 `StarParticle` 数组 + `drawStars()`，在 win effect 创建时一并 spawn ~14–18 个：

- 粒子属性：`x, y, vx, vy, life, maxLife, size, hue (gold/green 二选一)`。
- 初速度径向向外 + 微随机角度，重力 `gy ≈ 0.0008 px/ms²` 让它略下坠。
- 渲染：四角星形（两个旋转 45° 的矩形 + 中心高光圆点），亮度随 `1 - life/max` 衰减；附带 8px 金色 shadowBlur。
- 寿命 ~900ms，与 `WIN_BURST_MS` 接近。
- 同步生成 ~6 颗较大的"主爆星"+ 12 颗"碎星"，营造截图里"满天黄绿小星"的密度。

Lose 不加星星（保持只有红色塌缩）。

### C. 细节

- `drawIdleCell` 在非 hit row 的 dying 阶段加 0.6 倍 fade 曲线（先快后慢），避免一下消失太突兀。
- `prevFirstSecRef` 的设置时机不变。
- 不改 props、不改外部 API。
- `/style-guide` 不需要更新（Grid 不是独立 showcased 组件，且只是视觉调整）。

## 验收

- 一根 K 线撞到某列时，眼睛能在 ~150ms 内只看到那一格亮起，其他格已消失。
- 撞到自己下注的格子时，金/绿色星星向外散开 + 原有 `+$xxx` 飘字 + 环。
- 撞到空格子时，只有金色 hit-flash，没有星星。
- 输的格子继续走红色塌缩，无星星。
