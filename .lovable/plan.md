## 问题定位

你截图里那条黑底其实不是 bracket 容器，是上面的 **HubTabs**（Games / Props / Bracket 那一排 pill 所在的 sticky bar）。

当前 `src/components/sports/league/HubTabs.tsx` 用的是：

```
sticky top-0 z-30 ... border-b border-border bg-background/85 ... backdrop-blur
```

`bg-background/85` 是 85% 不透明的纯黑，所以即使下面有 WorldCupBackdrop 的绿色斜纹，也基本被盖掉，呈现成一条很丑的黑条 + 一条 border-b 的硬线。

## 修复方案

只改 `src/components/sports/league/HubTabs.tsx`，让它跟 BracketView 容器一样融进背景：

1. **背景**：`bg-background/85` → `bg-background/40`（或 `bg-white/[0.02]`），保留 `backdrop-blur-sm`，让背后的斜纹绿透出来，pill 仍然清晰可读。
2. **底边线**：去掉 `border-b border-border` 这条硬黑线，改成更轻的 `border-b border-white/[0.04]`，或者干脆移除——sticky 状态下靠 backdrop-blur 自然分层就够。
3. **sticky 行为保留**：`sticky top-0 z-30` 不变；滚动时仍然吸顶，只是不再是一条黑砖。

## 不动的部分

- BracketView 容器（上一轮已经改成半透明）维持现状。
- HubTabs 内部 pill 的样式（active=白底黑字，inactive=半透明）不动，只改外层 bar 的背景与边线。
- 其它页面（非 WC）也共用 HubTabs，半透明在普通深色背景下同样自然。

OK 就开做。