# 直播音轨 CN/EN 切换

## 范围确认

只在"真正播放"的三个表面加音轨切换控件，其它入口卡（首页 `LiveStreamCard`、`MobileLiveHero`）不动：

1. `GlobalStreamMiniPlayer`（全局右下角悬浮）
2. `FullscreenStreamOverlay`（全屏剧场）
3. `EventLiveStage`（事件详情页 Stream tab）

## 状态管理

音轨选择是全局状态：用户在悬浮卡选 CN，进全屏 / 进事件页 stream tab 应保持 CN。放到 `LiveStreamProvider` 里：

- 在 context 增加 `audioTrack: "cn" | "en"` 与 `setAudioTrack`
- 默认 `"en"`，记忆到 `localStorage`（key: `omenx.live.audio`）
- 暴露给三个消费组件

## UI 规格

统一的小型 segmented pill，两个选项 `EN` / `CN`，复用现有 chrome 按钮风格：

- **MiniPlayer**：放在海报右下角内嵌的控制层（与时钟同一区），尺寸 `h-5`，字号 `text-[9px]`，仅图标式，hover 显示完整。避免和底部 Trade 行抢空间。
- **FullscreenOverlay**：放在顶部 chrome 右侧（`SquareArrowOutUpRight` 左边），尺寸 `h-9`，与现有圆形 chrome 按钮等高的胶囊。
- **EventLiveStage**：放在视频右上角覆盖层（与现在的 LIVE/clock 同侧但下沉一层），尺寸 `h-7`。

视觉：未选 = `bg-white/10 text-white/60`；选中 = `bg-[color:var(--accent)] text-[color:var(--accent-foreground)]`。整体一个 `<AudioTrackToggle size="sm|md|lg" />` 共享组件，避免三处复制。

## 行为

- 切换时只更新 provider state（mock 阶段不真的换音轨，预留接入 hls.js `audioTracks` 的位置，写个 `// TODO: switch <audio>/HLS track here` 注释）
- 因为目前播放面是静态海报，没有真实 `<video>`，所以这一版仅做 UI + 状态联动；后续接真实流时再 wire 到 player API。

## 新增 / 修改文件

- 新增 `src/components/sports/live/AudioTrackToggle.tsx`
- 修改 `src/components/sports/live/LiveStreamProvider.tsx`（加 audioTrack state + persist）
- 修改 `GlobalStreamMiniPlayer.tsx` / `FullscreenStreamOverlay.tsx` / `EventLiveStage.tsx`（嵌入 toggle）
- 在 `src/routes/style-guide.tsx` Live 区块加 `AudioTrackToggle` 的三种尺寸 demo（遵循 core rule：新共享组件必须在 style guide 展示）

## 确认点

如果你希望默认是 CN 而不是 EN，或想用文字 `中文 / English` 而不是 `CN / EN`，告诉我，我在实现时调一下。
