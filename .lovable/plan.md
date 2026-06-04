## 目标

借鉴 Polymarket / bet365 / Betfair 的做法，用**分层提示**告知用户直播流和比分存在 30s–60s 延迟、仅供参考，避免投诉，又不破坏沉浸感。

## 设计原则

1. **不写整句长文案糊脸** — 用 ⓘ icon 收纳详细说明
2. **比分 vs 视频流分开标注** — 用户对两者预期不同
3. **常驻提示要克制** — 极小字号、低对比度、不抢戏

---

## 改动清单

### 1. 新建 `LiveDelayInfo` 组件（核心复用件）
路径：`src/components/sports/live/LiveDelayInfo.tsx`

- 一个 `ⓘ` 图标按钮（lucide `Info`，h-3 w-3，white/50）
- 点击 / hover 弹出 Popover（复用 `@/components/ui/popover`）
- 内容：
  > **About live data**
  > Live video and scores may be delayed by 30–60 seconds vs the venue.
  > Use them as reference only — settled outcomes are based on official sources.
- 支持 `variant="score" | "stream"` 切换措辞
- 在 `/style-guide` 添加 demo（遵守 Core memory）

### 2. 比分位置挂 ⓘ（参考 Polymarket 截图）

只在 chip 内嵌一个 ⓘ，不加额外文字：

- **EventLiveStage**：右上角 `liveClock` chip 旁
- **FullscreenStreamOverlay**：顶部 `liveClock` chip 旁
- **GlobalStreamMiniPlayer**：右上角 `liveClock` chip 旁（icon h-2.5）
- **LiveStreamCard**（首页瓦片）：右上角 `liveClock` chip 旁
- **EventHeader / PreMatchStrip**（若展示 live 比分）：检查并补上

### 3. 视频播放器：常驻一行细字

**EventLiveStage** 和 **FullscreenStreamOverlay** 视频区域底部内边沿：

```
Stream delayed · reference only   ⓘ
```

- `font-mono text-[9px] uppercase tracking-widest text-white/40`
- ⓘ 点开复用 LiveDelayInfo popover
- MiniPlayer 太小，不加常驻文字，只保留 chip 上的 ⓘ
- **不弹 toast**

### 4. Trade Drawer：下单环节的强提示

`src/components/sports/trade/TradeDrawer.tsx` 中，当目标 market `isLiveStream === true` 时，在金额输入上方渲染一条 inline notice：

```
[ⓘ] Live scores shown may lag the venue by 30–60s.
```

- `bg-amber/10 text-amber border-amber/30`（或现有 warning token）
- 不可关闭，下单关键场景做最强提示

### 5. DESIGN.md 更新

在 §4 Component Stylings 加入 "Live delay info" 小节，记录：
- ⓘ 必须出现在所有 live chip
- 常驻 caption 文案统一为 "Stream delayed · reference only"
- Trade Drawer live market 必须显示 amber notice

### 6. /style-guide 同步

在 Live 区块添加：
- LiveDelayInfo 两种 variant 的 popover demo
- 带 ⓘ 的 live chip 示例
- Trade drawer live notice 示例

---

## 涉及文件

- 新建：`src/components/sports/live/LiveDelayInfo.tsx`
- 修改：
  - `src/components/sports/event/EventLiveStage.tsx`
  - `src/components/sports/live/FullscreenStreamOverlay.tsx`
  - `src/components/sports/live/GlobalStreamMiniPlayer.tsx`
  - `src/components/sports/dashboard/LiveStreamCard.tsx`
  - `src/components/sports/trade/TradeDrawer.tsx`
  - `src/components/sports/EventHeader.tsx` / `event/PreMatchStrip.tsx`（如显示 live 比分）
  - `DESIGN.md`
  - `src/routes/style-guide.tsx`

## 不做的事

- 不弹 toast
- 不在每个比分数字旁边写长句话
- 不加可关闭横幅
- 不做延迟精确测量（仅写 30–60s 区间）

Used the design-md skill.