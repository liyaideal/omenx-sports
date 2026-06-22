## 问题
桌面右栏 `<aside class="hidden lg:block">` 内的 sticky 容器没有限制高度，当 ComboBuilder + QuotePreviewPanel（含新增的 Share this combo 按钮）总高度超过视窗时，底部 Share 按钮会被视窗底部裁掉。

## 修复
仅修改 `src/components/sports/promo/ComboChallengeSection.tsx` 中右侧 sticky 容器：

```tsx
<aside className="hidden lg:block">
  <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
    <ComboBuilder … />
    <QuotePreviewPanel … />
  </div>
</aside>
```

要点：
- `max-h-[calc(100vh-7rem)]` 与 `top-24` 对齐，留出顶部导航 + 底部呼吸。
- `overflow-y-auto` 让内部独立滚动，永远能滑到 Share 按钮。
- `pr-1 [scrollbar-gutter:stable]` 防止滚动条出现时内容左右抖动。
- 不改动手机端（已是底栏方案）。

## 不在范围
- 不改 ComboBuilder / QuotePreviewPanel 内部结构、字号、间距。
- 不改顶部 hero / filter / 主列表。