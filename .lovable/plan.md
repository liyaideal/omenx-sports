## Goal
让揭晓时刻从「静默状态切换」升级为一段有仪式感的盛大揭晓秀，用户进入/刷新页面时自动播放一次，之后回到静态结果态。

## Trigger 规则
- 服务端为每个用户记录每轮的 `revealSeen` 标记。
- 进入 `?tab=legend` 时若存在「已到揭晓时间 + 本用户未播放过」的轮次 → 排队播放（按 round 顺序，一次只播一个）。
- 播放期间禁用 tab 切换与外层滚动；可点击右上角 SKIP 直接跳到结果态。
- 播完写入 `revealSeen=true`，之后刷新页面不再自动播，只能从「Round 卡右上 ▶ REPLAY」手动回放（无奖励弹窗）。
- 未到揭晓时间，或本轮无用户投票，不触发揭晓秀。

## 揭晓秀时间线（约 6–8s，全屏 takeover）
ROUND 卡所在区域升起为全屏暗幕，LED 机箱包边亮起，其它区域降为 12% 亮度。

```text
T0.0  幕布升起 + 低频 whoosh
       顶部 LED 跑马灯：「ROUND 01 · REVEALING…」黄闪
T0.6  CLUE 行依次点亮（POSITION → PEAK CLUB → MAJOR TROPHY）
       每行 0.25s，黄色描边脉冲 + 打字机音效
T1.8  SELECT CANDIDATE 4 张卡进入「淘汰序列」
       错误候选逐张：红色脉冲 → 灰阶 → 向下塌陷 0.2s
       间隔 0.35s，共 ~1.0s
T2.8  正确候选卡居中放大 1.15×，金色描边 + 光束扫过
       卡片 3D 翻面 0.5s：背面=真人写实照 + 姓名 + 国旗
T3.5  结果横幅从底部滑入：
       命中 → 绿色「YOU HIT IT · TIER-01 SPIN GRANTED」+ 金色 confetti + 上升音阶
       未中 → 红色「MISSED · NEXT ROUND IN 24H」+ 红色脉冲扫线 + 低音 thud
       未投票 → 中性蓝「REVEALED · NO PICK THIS ROUND」+ 静音
T4.5  序列徽章（顶部 01/02/03…）对应格子从 LIVE 黄翻转为 HIT 绿 / MISS 红
       带 0.3s 翻牌动画 + 进度条填充
T5.5  命中场景：转盘奖励弹窗滑入，CTA「SPIN NOW」/「LATER」
       其它场景：幕布缓慢淡出，回到常规页面，焦点定位到下一轮卡片
```

全程右上角持续显示 `SKIP ▷` 与 1px 进度条，让用户可随时跳过。

## 视觉与音效
- 复用现有 Carnival LED 设计 token（Orbitron + Chakra Petch、琥珀/绿/红三色信号灯），不引入新字体或新色板。
- 描边脉冲、光束扫过、翻面用 framer-motion；confetti 用现有 `canvas-confetti`。
- 音效全部走 WebAudio 短促采样（< 200ms），首屏静音，用户首次交互后解锁；提供顶部 🔇 切换并持久化到 localStorage。
- 全程尊重 `prefers-reduced-motion`：降级为「卡片描边闪烁 + 结果横幅淡入 + 徽章翻转」，无塌陷/光束/confetti，时长压缩到 ~2s。

## 状态与数据
- `legendReveal.revealAt: ISO`、`legendReveal.revealSeenAt: ISO | null`（按用户 × 轮次）。
- 客户端拉取时若 `now >= revealAt && !revealSeenAt`，进入「待播队列」。
- 揭晓秀完成或 SKIP 后调用 `markRevealSeen(roundId)` 写入。
- 多轮同时待播（用户长时间未回）时按 round asc 顺序串行播放，每段间留 0.4s 黑场。

## 组件结构
- 新增 `LegendRevealOverlay`（fixed inset-0，z 50），由 `GuessTheLegendTab` 根据待播队列条件挂载。
- 抽出 `useLegendRevealQueue` hook 管理队列、SKIP、markSeen、reduced-motion 分支。
- `CandidateBoard` 暴露 `revealMode: 'idle' | 'eliminating' | 'flipping' | 'done'`，由 overlay 通过 ref/props 驱动同一组卡片做动画，避免重复一套视觉。
- `SeriesProgressStrip` 暴露 `flipBadge(roundId, 'hit'|'miss')` 命令式 API，供 overlay 在 T4.5 调用。

## Style Guide 同步
- `/style-guide` 的 `LegendBayPlayground` 增加「Reveal Sequence」分段，提供 ▶ PLAY HIT / ▶ PLAY MISS / ▶ PLAY NO-PICK 三个手动触发按钮，循环回放整段揭晓秀（不写入 revealSeen）。
- 同步 reduced-motion 降级版的预览开关。

## 不改动
- 揭晓后的 hit/miss 静态布局、clue 解锁规则、4 选 1 逻辑、转盘奖励规则、其他 tab。
- 现有 LED 机箱与字体 token。
