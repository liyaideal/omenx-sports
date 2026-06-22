## 方案：A + C 组合落地到正式 Lucky Box

把 **A 共享音量轨道** 作为主结构（物理连接 volume → 卡），叠上 **C 聚光灯 dim 层**（让 active 卡片在视觉上彻底跳出来）。直接改正式的 `LuckyBoxSection.tsx`，不建 lab 路由、不动 style-guide demo（按规范 style-guide 同步一次即可）。

## 视觉效果（自上而下）

1. **顶部 hero 卡** 保留现有内容（SEC-03 · DAILY LUCKY BOX / TODAY'S VOLUME: 1,240 U / 副标）。
2. **新增 Volume Ladder 轨道**（hero 卡和 3 张 vault 卡之间）
   - 56px 高，full-width，深色背景 + LED 网格
   - 0U → 5,000U 线性比例尺；轨道上 3 个节点 ⬢ 分别在 100/1000/5000U 位置，节点配色对应该档 accent（green / amber / blue）
   - 已达到的节点实色发光；未达到的节点空心 dashed
   - 已填充段：从 0 到当前 volume，渐变 green→amber，`box-shadow` 同色辉光
   - **1,240 U token**：amber 发光六边形（`clip-path: polygon(...)`），`framer-motion` 入场 `x: 0% → 24.8%`，缓动 1.2s，到位后 `animate-pulse`
   - token 下方 **2px amber LED 竖光柱** 接到 Premium 卡顶部中点（`absolute` 定位）
3. **3 张 vault 卡**（沿用现有 `TierCard` 结构，只改状态层）
   - **Active（Tier-02 Premium）**
     - 叠 `::before` amber **conical / radial gradient 光锥**（从顶 30% 向下，30% opacity）
     - `ring-2 ring-amber-400` + `shadow-[0_0_40px_rgba(250,204,21,0.35)]` 呼吸描边
     - 顶部新增 `YOUR TIER TODAY` 小徽章（amber 实色）
     - CTA 保留 `OPEN VAULT` 实色 amber
   - **Surpassed（Tier-01 Basic）**
     - `::after` 覆 `bg-black/60` + `grayscale` filter
     - 左上贴 `✓ CLEARED` 角标（zinc dashed）
     - CTA 文案 `OUTGROWN · TIER-02 ACTIVE`，禁用
   - **Locked（Tier-03 Grand）**
     - `::after` 覆 `bg-black/50` + `grayscale`
     - 右上贴 `🔒 LOCKED` 角标
     - CTA 文案 `+3,760 U TO UNLOCK`，禁用
4. **行为**：`spin()` 仅 active 档可触发，其它两档完全 disabled。

## 状态派生
在 `LuckyBoxSection` 里一次性算：
```ts
const activeIndex = [...LUCKY_BOX_TIERS]
  .map((t, i) => ({ i, ok: todayVolume >= t.volumeUnlock }))
  .filter(x => x.ok).pop()?.i ?? -1;
function statusOf(i: number): "active" | "surpassed" | "locked" {
  if (i === activeIndex) return "active";
  if (i < activeIndex) return "surpassed";
  return "locked";
}
```
`TierCard` 接 `status` prop，移除内部 `unlocked` 二态判断。

## 文件变动
- 改：`src/components/sports/promo/LuckyBoxSection.tsx`
  - 顶层加 `<VolumeLadder volume={todayVolume} tiers={LUCKY_BOX_TIERS} activeIndex={activeIndex} />`
  - `TierCard` 重构为四态视觉（active / surpassed / locked，外加复用一个内部 `next` fallback 给「没人达到任何档」的兜底）
  - 加 `MAX_THRESHOLD = LUCKY_BOX_TIERS[LUCKY_BOX_TIERS.length - 1].volumeUnlock` 作为轨道刻度上限
- 同步：`src/routes/style-guide.tsx`
  - LuckyBox demo 区追加 3 段静态预览：`todayVolume = 80 / 1240 / 6000`，展示三种全局态（none active / mid active / all cleared）
- 不动：数据层、spin 概率、`world-cup-carnival.ts`、prize 列表渲染

## 不做
- 不建 lab 路由
- 不改 hero 卡内 SEC-03 文案
- 不改 reel 动画
- 不引新依赖（framer-motion 已用）

## 验收
- 1,240 U 默认态：轨道 token 停在 Tier-02 节点右侧 + 光柱落在 Premium 卡 + Premium 是唯一未被 dim 的卡
- 改 `USER_CARNIVAL_STATE.todayVolume` 为 80 → 三张卡全 locked；为 6000 → 全 surpassed 但 Grand 是 active
- `pnpm/bun` build 通过