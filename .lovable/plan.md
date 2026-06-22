## 问题

1. 上轮把 Share 主 CTA 强调样式去掉后，`ShareTrigger variant="wide"` 默认是 `bg-white/[0.02]` + `text-muted-foreground` + `primary` 紫色箭头 chip——在深色背景上几乎不可见。
2. 主 CTA `py-4`，下面两个次级按钮 `py-3`，高度不一致，黄色已经够醒目，不需要再靠加高来强调。

## 方案

给 `ShareTrigger` 的 wide 变体新增可选 `accent` 主题，并降低默认 padding 灵活性；call site 切到 amber。

### 1. `src/components/sports/share/ShareTrigger.tsx`

- `ShareTriggerProps` 新增 `accent?: "default" | "amber"`（默认 `"default"`，保持现有用法不破坏）。
- wide 分支：
  - 容器内的 token 按 accent 切换：
    - default：维持现有 `border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.06]` + `text-muted-foreground` + `bg-primary/10` arrow chip。
    - amber：`border-amber-400/70 bg-amber-400/10 hover:border-amber-400 hover:bg-amber-400/15` + 文案 `text-amber-300 group-hover:text-amber-200` + arrow chip `bg-amber-400/20` + 箭头 `text-amber-300`。
  - 把 `py-4` 改为通过参数控制——简单做法：给 wide 加 `size?: "md" | "sm"`，`md=py-4`（默认，向后兼容）、`sm=py-3`。
- 不动 chip / ghost / icon 变体。

### 2. `src/components/sports/promo/ComboChallengeSection.tsx` — `TicketAcceptedModal`

`ShareTrigger` 调用改为：
```tsx
<ShareTrigger
  target={...}
  variant="wide"
  label="Share my combo"
  accent="amber"
  size="sm"
/>
```
其它（grid 两列次级按钮、capReached caption）保持不动。这样三个按钮都是 `py-3`，主 CTA 为 amber 描边 + 浅 amber 内填 + amber 字 + amber 箭头，醒目且一致。

### 3. style-guide 同步

`src/routes/style-guide.tsx` 之前那条 "Post-submit ticket reveal" 的措辞微调：
> 主 CTA 用 `ShareTrigger variant="wide" accent="amber" size="sm"`，与下方两个 zinc-outline 次级按钮高度对齐（统一 `py-3`），accent 仅靠 amber 描边 + 浅 amber 内填 + amber 文案/箭头表达主次层级。

### 4. DESIGN.md

上一轮新加的「Modal footer button stack」小节追加一句：
> 主 CTA 与次级按钮**高度一致**（都用 `py-3`），accent 只通过颜色（amber）而非加高来区分；避免主 CTA 比次级高出一头的视觉割裂。

## 不在范围

- 不改任何其它 ShareTrigger 调用方（default accent 完全向后兼容）。
- 不改弹窗 Trophy / 数据区 / capReached 文案。
- 不动滚动 / 高亮 ticket 行为。

## 验证

桌面截图弹窗底部，确认：
- Share my combo：amber 描边 + 浅 amber 内填 + amber 字 + amber 箭头，清晰可读。
- 三个按钮高度一致（`py-3`）。
- 两个次级按钮仍是 zinc outline，不与主 CTA 抢色。
