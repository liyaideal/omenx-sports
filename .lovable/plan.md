# Pinpoint 体验优化实施计划

目标：把"功能完整但情绪平"的页面，升级为有爆发力和势能的博彩体验。严格遵守**黄金原则**：局部 + 非阻断 + 可聚合 — 永远不全屏遮罩、不锁输入、不真慢放、不排队。

按文档优先级，分 3 个 batch 上线。每个 batch 都可独立体验、独立验收。

---

## Batch 1（本轮交付）· P0-1 命中庆祝 + P0-3 连胜

页面最缺的就是"赢得不够爽"，先打这一拳。

### 1.1 新增独立特效层
- 新文件 `src/features/pinpoint/EffectsLayer.tsx`：覆盖在 Grid canvas 之上的独立 `<canvas>`，`pointer-events:none`，自己的 rAF 循环，对象池复用粒子/金币。
- 暴露命令式 API（通过 ref 或全局事件总线）：
  - `flashCell(rect, tier)` — 白闪 + scale 弹跳 + 金色描边 + 光环 ring
  - `burstParticles(x, y, tier)` — 粒子炸裂（带重力、渐隐）
  - `flyCoins(fromRect, toRect, count, tier)` — 二次贝塞尔金币流，stagger 20-40ms
  - `showCombo(text)` — 角落 "x3 HIT" / "COMBO ×5" 角标
- 性能封顶：粒子 ≤150、金币 ≤24；超出只加亮度不加数量。
- 降级：`prefers-reduced-motion` → 只保留数字滚动 + 描边脉冲。

### 1.2 Grid.tsx 接入
- 命中判定时（cell 进入 `resolving_win`）：计算 `ratio = leverage × (odds-1)`，分档 S/M/L/XL；计算格子屏幕坐标 rect；触发 §1 时间线。
- **聚合**：120ms 窗口收集多格命中 → `flushWinBatch`：每格各播白闪+小粒子，金币流合并成一束，余额一次滚加，弹一个 COMBO 角标，音效合成上扬而非叠 N 个"叮"。
- 输的反馈缩短：格子塌陷下沉 + 渐隐左滑 + 短"噗"音（已有基本逻辑，调短调轻）。

### 1.3 AccountBlock.tsx 升级
- 余额改成"数字滚动累加"组件（rAF lerp old→new，~250ms，easeOutCubic）。
- 暴露 `balanceAnchorRef`（getBoundingClientRect）作为金币飞行终点。
- 到达瞬间触发卡片 scale 1→1.06→1 + 绿色描边脉冲。

### 1.4 连胜 Streak（P0-3）
- `usePinpointSession.ts` 新增 `streakCount`：每次 win → ++；任何 lose → 归零；cancel 不影响。
- 新组件 `StreakPill.tsx`：角落"🔥 N"常驻 pill，命中跳动+火苗变大；到 3/5/10 阈值爆闪+升调音+「3 WIN STREAK」标签；断了火苗熄灭+「STREAK LOST」微提示。
- streak 越高，§1 的粒子/金色/音高在上限内 +1 档。

### 1.5 音效分层（P0-1 配套）
- 扩展 `sounds.ts`：`win_S/M/L/XL`（同一基音 + playbackRate 变调）、`coin_arrive`、`streak_up`、`streak_lost`、`lose_soft`。聚合赢只播 1 个合成音。

### 1.6 验收
- 单格大赢：白闪→粒子炸→金币飞向左上余额→余额滚加+绿脉冲，全程 ~800ms 不挡点击。
- 3 格同赢：3 格各自弹+小粒子，但只有 1 束金币、1 次滚动、1 个"x3 HIT"。
- 连赢 3 把：pill 爆闪，第 4 把命中粒子/音明显更猛。
- reduce-motion：无闪无震，仍有数字滚动。

---

## Batch 2（下一轮）· P0-2 画面对行情有反应

数据驱动，不依赖语义事件。

- 新 `src/features/pinpoint/lib/momentum.ts`：滑动窗口检测概率线 Δp/Δt 超阈值 → 触发 `MomentumEvent { kind: 'SURGE'|'PLUNGE'|'SHIFT', magnitude }`。
- Grid canvas：触发时概率线**辉光拖尾加粗** + 整网格抖一下（CSS transform shake 120ms）+ 赔率扫光重定价 + 顶部弹方向标签（`MOMENTUM SHIFT` / `SURGING` / `COLLAPSING`）。
- 比分变化（接 EventSelector 数据源）：弹「USA 2-0」横幅 + 复用上面冲击特效，直播框高亮闪。
- 顶部状态词（`HEATING UP` / `NAIL-BITER` / `CALM` / `ON FIRE`）随波动率切换。

---

## Batch 3（下一轮）· P0-3 余项 + P1 选做

- Combo（同列多格命中）大特效 + 音浪叠加（Batch 1 已含基本聚合，这里强化视觉）。
- XP 即时增长动画：每次下注/命中 XP 条肉眼可见地涨；升级弹幕 + 音效。
- "千钧一发"：bet_open 且剩余判定 ≤1.5s 且线接近 → 该格边框急促闪烁（4→10Hz）+ 心跳音 bpm 加快 + 聚焦光晕。**游戏时钟不变**。
- P1 视觉：概率线辉光拖尾、扫描线扫过格子微亮、hover 预览浮层（"押 $100 × 3x → 赢 $X，~Y%"）。
- 爆仓仪式感：MMR 进入红区时边缘红脉冲加剧 + 心跳加快；冻结时一次克制的"清算"视觉（非全屏遮罩）。

---

## 技术要点

- **架构**：EffectsLayer 是绝对定位 `<canvas>`，绑定到 Grid 容器；通过 ref 暴露命令式 API，避免 React re-render 干扰 60fps。
- **坐标系**：Grid.tsx 计算的 cell rect 用 `canvas.getBoundingClientRect()` 转屏幕坐标后传给 EffectsLayer。金币终点用 `balanceAnchorRef.current.getBoundingClientRect()`。
- **聚合**：Grid 内维护 `winBuffer: WinEvent[]`，每帧末 flush；空 buffer 时直接走单格路径。
- **降级**：在 EffectsLayer 顶部判 `prefers-reduced-motion`，所有 burst/coin/shake 提前 return。

---

本计划先实现 Batch 1（约占总工作量 50%，但带来 ~70% 的"爽感"提升）。Batch 2/3 在你试玩 Batch 1 后再启动，避免一次性改太多导致回归风险。
