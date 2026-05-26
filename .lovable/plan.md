# 左侧英雄槽：Featured event → Fans Zone（带 fallback）

## 现状回顾

- 左列（340px 宽，跨两行高）现在塞了一张 `MatchMarketCard market={FEATURED_MATCH}`（Chelsea vs PSG UCL），编辑硬选。
- 已有但未启用的组件：`FanZoneHeader`、`FanPollCard`、`FanPostCard`。
- 已有 mock 数据：`FAN_POLL`、`FAN_POST`、`TEAMS`。

## 目标

左侧变成 **Fans Zone**：基于"关注的球队"个性化呈现，社交 + 交易拼盘。

## 变更

### 1. 新增 follow 状态（mock）

`src/data/sports-mock.ts` 末尾加：

```ts
export const FOLLOWED_TEAMS: TeamLite[] = [TEAMS.chelsea, TEAMS.manCity];
// 切到 [] 即可演示空状态
```

并加一组"推荐关注"球队 `SUGGESTED_TEAMS`（5 支，用于空状态）。

### 2. 改造左列结构（`src/routes/index.tsx`）

```
<section>  ← 左列，跨两行
  <FanZoneHeader title="Fans zone" />     ← H1 + Following 下拉
  {FOLLOWED_TEAMS.length > 0 ? (
    // happy path（垂直 stack，社交+交易交错）
    <>
      <MatchMarketCard market={FEATURED_MATCH} />   ← "你关注的球队下一场"
      <FanPollCard {...FAN_POLL} />                  ← 球迷投票
      <FanPostCard {...FAN_POST} />                  ← 球迷帖子
    </>
  ) : (
    // fallback
    <FansZoneEmpty suggested={SUGGESTED_TEAMS} />
  )}
</section>
```

`FanZoneHeader` 把"Newest 排序"改成 **"Following · 2 teams" 下拉**（含 Manage 链接），更贴合 Fans Zone 语义。

### 3. 新组件 `FansZoneEmpty.tsx`

未关注时的空状态卡，结构：
- 上半：和现在 `MatchMarketCard market={FEATURED_MATCH}` 一样的编辑精选大卡（不浪费视觉），但顶上盖一条 `Editor's pick — follow your team to personalize` 小条
- 下半：5 支推荐球队的圆形头像横排 + 每个下方 `Follow` 按钮（mock 状态，点了变 `Following`，本地 state 即可）
- 底部：`Skip for now` 文字按钮

这样既不显得空，又把 onboarding 自然嵌进去。

### 4. 文案 / 微调

- 把原来 `SectionHeader title="Featured" accent="event"` 整段删掉，由 `FanZoneHeader` 接管
- `MatchMarketCard` 顶部加一条小 kicker `Following · Chelsea`（如果该卡比赛涉及关注球队）—— 这条逻辑放在 index.tsx 里推导，不改 `MatchMarketCard` 组件

### 5. style-guide 同步

在 Section 12 "Multi-Market Event" 后面加 Section 13 "Personalized Zone"：写明 Fans Zone 的 3 层堆叠规则（关注比赛卡 → 投票 → 帖子）和空状态规则（Editor's pick + Follow chips）。

## 不动的部分

- 中部 `Live & upcoming events` 网格
- 中下 League Winner + Top Scorer
- 右侧 Mbappé spotlight
- TopBar、Page rhythm

## 结果

左列从一张匿名 hero 卡变成"你的球迷主页"：关注的球队比赛 + 球迷讨论 + 投票，所有人看到的都不一样。空状态有一张正经卡 + 5 支球队 onboarding，不会一片白。
