### 移除卡片图标

文件：`src/components/sports/promo/OverviewSection.tsx`

两组 SVG 装饰都删掉：
1. **头图右上角**的 Lucide 角标（Sparkles / Zap / Trophy）
2. **正文左上角**的形状图标（圆形 / 菱形 / 柱状）

连带清理：
- `SeriesEntry` 接口移除 `icon`、`iconShape`、`ornament` 字段
- `SERIES` 数组移除对应值
- `lucide-react` 中未使用的图标导入（Circle、Diamond、BarChart3、Sparkles、Zap、Trophy）
- `cn` 工具若后续不再使用也一并移除

清理后卡片结构：头图 + SEC 编号 → 标题 / 亮点 / 描述 / CTA。