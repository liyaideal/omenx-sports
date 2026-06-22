## 问题

`My Tickets` 里 ticket 结算后，赢钱/输钱都只反映在 OmenX 主站的 `/wallet`。当前 UI 完全没暴露这个链路，用户看到 `4/4 Correct — WON · pays 142 U` 也不知道 142 U 去了哪 → 转客服；输了 10U 也不知道去哪查账单。

## 整体规划

把 ticket 的资金动线**三段全部显式化**，对应三个 ticket 状态，所有跳转目标都走 `omenxUrl.wallet()`（已在 `src/lib/omenx.ts`，跨域时只改一处）。

| 状态 | 资金事件 | UI 表达 | tone |
|---|---|---|---|
| `ACCEPTED`（waiting） | 下注时 stake 已扣留 | `−10 U held` + Wallet link（次要） | zinc, 小字 |
| `SETTLED_WON` | payout 进 wallet | `+142 U credited to Wallet ↗`（主） | emerald，可点 |
| `SETTLED_LOST` | stake 不退（10U 已在下注时扣） | `−10 U from stake · View in Wallet ↗`（次） | zinc，可点 |

整块 `My Tickets` 区底部再加 1 行兜底说明：

> All winnings and stake deductions appear in your **Wallet ↗** on OmenX.

链接全部 `target="_blank" rel="noopener noreferrer"`，因为跳的是另一个域（`omenx.lovable.app`）。

## 具体改动

### 1. `TicketRow`（`src/components/sports/promo/ComboChallengeSection.tsx`）

在 ticket 卡片当前的「腿列表」下方新加一行 `WalletLine`，按 status 渲染：

- 引入 `Wallet` icon（lucide）、`ArrowUpRight`、`omenxUrl`。
- 抽 `WalletLine({ ticket })` 内联子组件：
  - WON：
    ```
    [Wallet ✓]  +{grossPayoutU} U credited to your Wallet  [View ↗]
    ```
    样式：`flex items-center gap-2 border-t border-zinc-900 pt-2 mt-2`，文字 `text-emerald-300 font-pitch text-[10px] uppercase tracking-widest`，整行 `<a href={omenxUrl.wallet()} target="_blank" rel="noopener noreferrer">`，hover 加 `text-emerald-200 underline-offset-4 hover:underline`。
  - LOST：
    ```
    [Wallet]  −{stakeU} U deducted from stake  ·  View in Wallet ↗
    ```
    样式同上，色 `text-zinc-400 hover:text-zinc-200`。
  - ACCEPTED：
    ```
    [Wallet]  −{stakeU} U held · settles on result  ·  Wallet ↗
    ```
    色 `text-zinc-500 hover:text-zinc-300`。
- 不替换右上角已有的 `lockedActivityOdds × / pays N U` 数据，wallet 行是新增的资金动线说明。

### 2. `TicketStatusList` section 兜底

在 `MY TICKETS` 标题右侧新增一个轻量 link，desktop / mobile 都可见：

```
MY TICKETS                                  Manage in Wallet ↗
```

- `<a>` 走 `omenxUrl.wallet()`，target=_blank，文字 `font-pitch text-[10px] uppercase tracking-widest text-zinc-500 hover:text-amber-400`。
- 用 `flex items-center justify-between` 包标题与链接。

### 3. `TicketAcceptedModal` 也补一句（最容易被看到的场景）

在弹窗"Locked odds / All correct pays"数据区下方加一行 amber 说明（不影响新做的 2 行按钮布局）：

> Payouts settle automatically to your **Wallet ↗** on OmenX.

`<a target="_blank" rel="noopener noreferrer">` → `omenxUrl.wallet()`，`font-pitch text-[10px] uppercase tracking-widest text-amber-300/80 hover:text-amber-300`，居中。

### 4. style-guide §「Post-submit ticket reveal」 追加

> Ticket 资金动线对照表（同上 3 行表格），统一跳 `omenxUrl.wallet()`，新窗口。WON=emerald 强提示，LOST=zinc 次提示，ACCEPTED=zinc 极轻提示；`TicketStatusList` 头部 + `TicketAcceptedModal` 数据区也各补一处 Wallet 跳转，覆盖三层入口（成功瞬间 → 列表项 → 列表区块）。

### 5. DESIGN.md

§7 Do's and Don'ts 追加：

> 任何在 OmenX 主站结算的资金事件（payout、扣款、refund）必须在 sports 子域 UI 里显式给出 `Wallet ↗`（新窗口）跳转——不要只显示金额。降低客服咨询量是产品规约，不是可选 polish。

## 不在范围

- 不接入真实 wallet 余额（仍是跳转）。
- 不动 ticket 数据结构 / `useComboState`。
- 不调整 `/wallet` URL（已抽到 `omenxUrl`，未来改域名只改 `src/lib/omenx.ts`）。

## 验证

- Playwright desktop + mobile 截图 `My Tickets`：4 张 ticket 分别对应 WON / LOST / ACCEPTED 三态，wallet 行按 tone 正确渲染；MY TICKETS 标题右侧出现 `Manage in Wallet ↗`。
- 点击其中一条 → 新标签打开 `https://omenx.lovable.app/wallet`。
- 弹窗截图确认数据区下方有 amber Wallet 链接。
