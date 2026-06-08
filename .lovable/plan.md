# Bracket v4：versus 卡片 + 撑满容器

## 目标
- 删掉国家代码（ARG/BRA…），完整队名足够，不要重复。
- 卡片改成「上排两个旗 + vs」「下排两个队名 + 价格」的横向对阵布局（参考你贴的 USA vs Mexico 图）。
- bracket 整体撑满 hub 内容区宽度。

## 卡片结构

```
┌───────────────────────┐
│   🇦🇷    vs    🇸🇦    │   ← 上排：左旗 · vs · 右旗（居中对齐）
│  Argentina  Saudi A.  │   ← 下排：左名 · 右名（两列等分，居中）
│    86¢         14¢    │   ← 价格独占一行（两列等分）
│        JUN 27         │
└───────────────────────┘
```

细节：
- **上排**：`flex justify-center items-center gap-2`，旗 h-7 w-7（比之前更显眼，因为是视觉主角），中间小写 `vs` 用 serif italic（`font-serif italic text-muted-foreground text-[10px]`）。
- **下排队名**：`grid grid-cols-2 gap-1`，每格 `text-[11px] font-medium text-center truncate`，hover tooltip 显示全名。
- **价格行**：`grid grid-cols-2 gap-1`，font-mono text-[11px] font-semibold tabular-nums，居中。胜方价格位置换 `✓` 绿色。
- **kickoff**：底部居中，font-mono text-[9px] tracking-widest muted。
- 整卡 `p-2 rounded-lg`，hover 高亮（保留现状）。决赛卡保留 🏆 + 紫色 glow。

为什么这样能省宽：原版本每行 = logo + name + price 横排，name 区域被挤压。现在 logo 行单独成排（不占 name 宽），下面两个 name 各占半宽，列宽 ~100px 时每个 name slot ~44px，"Argen…" 仍会截断；但常见 desktop 1280+ 下每列 ~135px、name slot ~60px，"Argentina" / "Brazil" / "France" 全名都能完整显示，长名（"Netherlands"/"United States"）才会 truncate。

## 撑满容器
- `SymmetricBracket` 外层去掉 `w-fit mx-auto justify-center`，改 `w-full`。
- 9 列用 `flex-1 min-w-0` 等分（决赛列 `flex-[1.3]` 略宽强调）。
- 取消固定 `OUTER_WIDTH=108`、`FINAL_WIDTH=128`。改为最小宽度 `min-w-[96px]`，容器宽度越大列越宽。
- `gap-2` 行列呼吸。
- 极窄屏 `overflow-x-auto` 兜底（很少触发，因为最小 96 × 9 + gap = 880）。

## TBD 处理
TBD 一方时（home 或 away 缺席）：旗位置渲染虚线圈，名字显示 "TBD"，价格留空。其余结构不变。

## 影响范围
仅 `src/components/sports/league/BracketView.tsx`。`/style-guide` 自动跟随。

## 验收
- 1021vp：bracket 撑满内容区无大面积留白；每张卡两个国家全名（短名）完整。
- 决赛卡仍 🏆 + 紫色 glow，居中。
- 不再出现 ARG/BRA 这种代码。
- 移动端 LinearBracket fallback 同步用新 versus 卡片。
- 数据结构不变。

OK 就开做。
