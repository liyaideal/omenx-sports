## 问题

`/league/world-cup-2026` 头部三处需要清理:

1. **"5 EVENTS" chip** —— 跟下方 `HubTabs` 的 "Games · 5" 重复,而且只反映当前 mock 数据条数。
2. **stats 条数字失真** —— "5 Matches" 用的是 mock `matches.length`(实际 104),"$1.00B Volume" 是凭空编的假数据。
3. **`RoadToFinalStrip`** —— kickoff 日期、host 国家、tournament 标签 hero 里已经全说过,整条横幅重复。

## 改动

### `src/components/sports/league/LeagueHubHero.tsx`
- 删掉 `{matchCount} events` chip 及对应 `matchCount` prop。
- `stats` 渲染块**保留**。

### `src/routes/league.$slug.tsx`
把 `heroStats` 改成真实静态数据(不再依赖 mock `matches.length` / `groups.length`),并去掉假的 volume,补一个真实的第四项:

```ts
const heroStats = isWorldCup
  ? [
      { label: "Nations", value: "48" },
      { label: "Matches", value: "104" },
      { label: "Groups", value: "12" },
      { label: "Host cities", value: "16" },
    ]
  : undefined;
```

其它改动:
- 删除 `matchCount={matches.length}` 传参。
- 删除 `{isWorldCup && <RoadToFinalStrip />}` 这一行。

### `src/components/sports/league/WorldCupAmbience.tsx`
- 移除 `RoadToFinalStrip` 导出(及未再用到的 `Trophy` 引入)。`WorldCupBackdrop` 保留。

### `src/routes/style-guide.tsx`
- `LeagueHubHero` 演示位:`matchCount` 参数删掉;`stats` 换成上面那组真实数据。
- 删除 `RoadToFinalStrip` 演示块及其 import。

## 不动

- Hero 的 `kickoffLabel`、`hostFlags`、tagline。
- `WorldCupBackdrop` 全页氛围。
