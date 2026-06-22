## 改动

在 `src/components/sports/promo/GuessTheLegendTab.tsx` 的 Active Round Bay 国旗大图覆盖层里，删除右下角渲染 `country.region`（UEFA / CONMEBOL）的那一块角标 JSX。左下角的国家名（SPAIN 等）保留不动。

## 不动的部分

- `LEGEND_COUNTRIES[*].region` 字段本身保留在 `src/data/world-cup-carnival.ts`，以便未来如果想再用作筛选/弱提示可以直接复用。
- `/style-guide` 的 Legend playground / Assets inventory 不需要改 —— 它展示的是 flag 资源本身，没有单独陈列 region 角标。
- 其它模块（HUD、Scoreboard、Signed portraits）均不受影响。

## 验证

改完后到 `/promo/world-cup?tab=legend` 截图确认：Active Bay 国旗右下角应只剩空白，左下角国家名仍在。