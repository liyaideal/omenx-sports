## 调整：在 SEC-03 头卡加回"剩余抽奖券"展示

### 背景
volume=0 的老用户进来只看到今日交易量 0，容易错过下面还未使用的历史券。头卡需要第一时间告诉用户"你还有 X 张券可用"。

### UI 变化（仅一处）

在 `LuckyBoxSection` 头卡（SEC-03 · DAILY LUCKY BOX 卡片）内，`<p>` 副标题下方新增一行 ticket ledger。

结构：

```
┌───────────────────────────────────────────────┐
│ SEC-03 · DAILY LUCKY BOX                      │
│ TODAY'S VOLUME: 1,240 U                       │
│ Every time your daily volume crosses…         │
│                                               │
│ TICKETS READY   T1 ×2   T2 ×1   T3 ×0         │
└───────────────────────────────────────────────┘
```

细节：
- 左侧标签 `TICKETS READY`：`font-scoreboard text-[10px] tracking-[0.25em] text-zinc-500`。
- 三个 tier chip 横排，每个由 `T1/T2/T3` 编号 + `×N` 数值组成；用各自 accent 色（绿 / 黄 / 蓝）。
- 券数 = 0 的 chip 降饱和：`text-zinc-600`，无 accent 色；避免"全部亮"喧宾夺主。
- 券数 ≥ 1 的 chip：accent 色文字 + `border` 同色 + 微弱 glow，视觉上像个小 badge。
- 总券数 = 0 时：整行改为一句提示 `No tickets yet — reach 100 U today to earn your first`（`text-zinc-500`）。
- 桌面 & 移动端都在头卡内展示，不新增独立条。

### 联动
Tier 卡片内已有的 `×N TICKETS` 徽章保留 —— 头卡是快速一览，卡片内是操作入口，两者一致但不冲突。

### 涉及文件
`src/components/sports/promo/LuckyBoxSection.tsx`（唯一改动）。把 `tickets` 也传给头卡渲染即可，不动数据层。

### 不改动
奖池、券的领取/消耗逻辑、volume ladder、卡片交互、style-guide fixture。
