## 改动

把用户上传的真实 FIFA World Cup 2026 logo (`user-uploads://2026-FIFA-Logo.png`) 复制到 `src/assets/leagues/world-cup-2026.png`,把全站对旧 `world-cup-2026.svg` 的引用全部切到这个新 PNG,并在 `/style-guide` 里专门加一块"品牌资产"展示位强调这是唯一正确的 WC2026 logo 来源。

### 文件改动

1. **新增** `src/assets/leagues/world-cup-2026.png` —— 用户上传的真实 logo(深绿"26"+金奖杯+FIFA 字样)。
2. **`src/data/leagues.ts`** —— `import` 路径从 `.svg` 改为 `.png`。
3. **`src/components/sports/LeagueBadge.tsx`** —— `PRESETS.wc.logo` 指向新 PNG。
4. **`src/data/tournament.ts`** —— 同上。
5. **`src/routes/league.$slug.tsx`** —— 同上。
6. **`src/components/sports/league/WorldCupAmbience.tsx`** —— 同上。
7. **`src/routes/style-guide.tsx`** —— ①已有的 svg 引用切到新 PNG;②**新增**一个 "Brand assets — League logos" 小节,把 WC2026 logo 用三种尺寸(crest 24px / hero 80px / coming-soon 40px)摆出来,并在标题下写一行强调:**"FIFA World Cup 2026 — 全站只能使用这张真实 logo(`@/assets/leagues/world-cup-2026.png`),不要再生成或替换占位图。"** 顺手把 EPL / UCL / La Liga 几个 preset crest 也放一排,作为"league logo source of truth"的总览,避免以后又出现"重画一个奖杯叠加"那种事。
8. **删除** `src/assets/leagues/world-cup-2026.svg` —— 旧占位资产不再使用,清理掉避免误用。

### 不动

- 不改 logo 容器的尺寸 / 圆角 / ring 样式 —— `LeagueBadge` 现有的 `object-contain` + 透明容器对新 PNG 同样适用。
- 不改 `LeagueHubHero`、`LeagueComingSoonCard` 等消费方,它们都通过 `league.logo` / preset 读取,自动跟着切。
