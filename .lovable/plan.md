## 问题

`AppTopBar` 是 `sticky top-0 z-50`，高度约 64px（`py-3` + 内容）。

右侧交易列目前是 `lg:sticky lg:top-4`，所以它紧贴视口顶部 4px 处 —— 也就是直接钻进了 TopBar 下面。内部 picker 用 `lg:sticky lg:top-0`，是相对滚动容器顶部 sticky，但容器顶部本身就在 TopBar 后面，所以 picker 永远被 TopBar 遮住。

修复就是给 sticky 列留出 header 高度。

## 改动

`src/routes/event.$id.tsx` 中右侧 sticky wrapper：

```diff
- className="space-y-3 lg:sticky lg:top-4 lg:self-start
-            lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto
-            lg:pr-1 lg:[scrollbar-gutter:stable]"
+ className="space-y-3 lg:sticky lg:top-20 lg:self-start
+            lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto
+            lg:pr-1 lg:[scrollbar-gutter:stable]"
```

- `lg:top-20`（5rem ≈ 80px）让整列起点位于 TopBar 下方，留一点呼吸空间。
- `lg:max-h-[calc(100vh-6rem)]` 相应缩短最大高度，保证底部不被裁。
- 内部 picker 已是 `lg:sticky lg:top-0 lg:z-10`，无需再改 —— 现在容器顶部本身就在 TopBar 下面，picker 自然可见。

## 文件

- `src/routes/event.$id.tsx` — 仅调整 sticky 列的 `top` 与 `max-h`。

不动其它组件，不动业务逻辑。
