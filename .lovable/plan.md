## Sports Lockup — Neon Monolith 实施

按用户选择的 v1 方向实施，保留原 OMENX logo 图（不重做成纯文字），删除 Mainnet 徽章，去掉 Sports nav tab，nav 回归 OmenX 标准 4 项。

### 视觉

```text
[OMENX图]│ ZONE
         │ SPORTS    Events  Portfolio  Leaderboard  Insights        [Equity] [Avatar▾]
         ↑
   3px 紫→粉渐变竖条 + neon 发光
```

- `OMENX` 仍是 `omenxLogo` SVG，`h-8`
- 中间一根 `h-9 w-[3px]` 渐变竖条：from-primary via-primary to-accent + `shadow-[0_0_12px_hsl(var(--primary)/0.6)]` 霓虹光
- 右侧两行 lockup：
  - 上行 `Zone`：`text-[9px] font-bold uppercase tracking-[0.4em] text-white/30`
  - 下行 `Sports`：`font-display text-2xl font-black italic uppercase`，紫→粉渐变文本（`bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent`），带 `drop-shadow-[0_0_15px_hsl(var(--primary)/0.35)]` 霓虹外发光
- hover：整组轻微缩放（logo 图 `group-hover:scale-[1.02]`），整体 `hover:opacity-95`
- `sm:` 断点以下隐藏竖条 + Sports lockup，只剩 logo（窄屏 fallback）
- 整组包在一个 `<a href="/">` 里，点击回 Sports 首页

### Nav

- 删除 NAV 数组里的 `Sports` 项
- 删除 `active`/`isActive` 分支（4 项都是外链跳回 omenx.app，没有 active 态）
- 保留 hover 紫色品牌 hover 样式

### 受影响文件

- 编辑 `src/components/sports/dashboard/AppTopBar.tsx`
  - 删除 Mainnet badge JSX
  - 替换 logo `<a>` 内部为 Neon Monolith lockup
  - NAV 数组移除 Sports，简化激活态代码分支
