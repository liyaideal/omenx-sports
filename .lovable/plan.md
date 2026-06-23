删除 `LegendRevealOverlay` 底部的灰色 helper 文案 `REPLAY · NO REWARD CHANGE · ESC TO SKIP` / `FIRST WATCH · CINEMATIC AUTO-PLAYS ONCE · ESC TO SKIP`。

## 改动

仅改 `src/components/sports/promo/LegendRevealOverlay.tsx`：删除以下两段（桌面绝对定位版本 + 移动端内联版本）：

```tsx
{/* mobile inline */}
<div className="mt-6 text-center font-scoreboard text-[9px] ... sm:hidden">
  {isReplay ? "REPLAY · NO REWARD CHANGE" : "FIRST WATCH · CINEMATIC AUTO-PLAYS ONCE"} · ESC TO SKIP
</div>

{/* desktop absolute */}
<div className="absolute inset-x-0 bottom-4 hidden ... sm:block">
  {isReplay ? "REPLAY · NO REWARD CHANGE" : "FIRST WATCH · CINEMATIC AUTO-PLAYS ONCE"} · ESC TO SKIP
</div>
```

`isReplay` prop 保留（仍由 `LegendRevealSequenceDemo` 传入，未来可能用到），右上角 SKIP 按钮 + ESC 快捷键不动。
