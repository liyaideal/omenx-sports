## 目标
修复 SELECT CANDIDATE 卡片白送 PEAK CLUB 线索的问题：从候选卡里移除 CLUB 字段。

## 改动
1. `src/components/sports/promo/GuessTheLegendTab.tsx`（CandidateBoard 卡片）
   - 删除候选卡内显示 `candidate.club` 的那一行 + 相关样式。
   - 卡片只保留：球员名 + 投票百分比进度条。
   - 不改卡片高度/网格结构，仅去掉中间 club 文本行。

2. `src/routes/style-guide.tsx` — `LegendBayPlayground` 中的 CandidateBoard 演示
   - 同步移除 CLUB 行，保持 playground 与产品一致（Core 规则）。

3. `src/data/world-cup-carnival.ts`
   - 候选项的 `club` 字段保留（数据层不动），仅 UI 不再渲染，避免影响其它逻辑/未来扩展。

## 不动
- POSITION / PEAK CLUB / MAJOR TROPHY 三条 clue 行为与解锁规则。
- 投票百分比、Lock-in、Reveal 流程。
- 卡片尺寸、栅格、LED chassis 视觉。
- 其它 tab。
