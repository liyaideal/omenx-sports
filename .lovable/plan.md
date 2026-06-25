## 模型确认

Pinpoint 是**独立子账户**，与主站 wallet 分离：
- 主站 wallet = 总资金池（出入金、其它产品共用）。
- Pinpoint account = 玩家自己划出的"游戏本金"，爆仓只影响这部分。
- 充值 = 主站 wallet → Pinpoint account 的**内部划转**（不是出入金）。
- 主站 wallet 余额不足时 → 跳 `https://omenx.lovable.app/wallet` 走完整出入金。
- （提现 / 划回主 wallet 不在本期范围，先不做。）

## 诊断（同前）

不是计算 bug。冻结前 balance 已被前一局打到 ~$29.5（持久化在 localStorage）→ $25/1× 一开，equity 几乎清零 → MMR ≫ 100% → 触发 `liquidateAll`。冻结后 open=0、mm=0 → 告警条回弹显示 `MMR 0%`，是 UI 误导。

## 修复范围

### 1. `usePinpointSession.ts`
- State 加 `frozenMmr?: number` / `frozenAt?: number`。
- `liquidateAll(mmrAtTrigger)` 保存触发瞬间的真实 MMR；UI 不再读平仓后回弹的 0%。
- 新增 `deposit(amountUsd)`：`balance += amount`；若 `frozen` 且新 balance > 0 → 切回 `active`、清 `frozenMmr/frozenAt`。**这是"到账回执"，真正的资金从主站 wallet 划过来，见 #3。**

### 2. `src/routes/pinpoint.tsx`
- `liquidateAll(mmr)` 传真实数据。
- LIQUIDATED 弹窗重写：
  - 副标题：`Pinpoint account wiped. MMR hit {frozenMmr}% with $X carrying balance.`
  - 真实资金提示：`Pinpoint is a separate account from your OmenX wallet — top up to keep playing.`
  - 主按钮：**`TOP UP PINPOINT`** → 打开 DepositSheet（#3）。
  - 次按钮：`VIEW HISTORY` 关闭弹窗，留在 frozen 状态查看历史。

### 3. 充值面板 = 主站 wallet → Pinpoint 子账户内部划转
新建 `src/features/pinpoint/DepositSheet.tsx`（mobile=bottom Sheet / desktop=Dialog，遵循 mobile-bottom-sheet 规则）。

UI：
- 顶部两行余额展示：
  - `OmenX Wallet · $X.XX` （主站可用）
  - `Pinpoint Account · $Y.YY` （当前子账户）
- 金额快选：`$50 / $100 / $500 / MAX / Custom`。
- 主按钮逻辑：
  - 主站 wallet ≥ amount → `TRANSFER TO PINPOINT`，执行划转 → `deposit(amount)` → 关闭、toast 成功。
  - 主站 wallet < amount → 按钮变 `WALLET LOW · ADD FUNDS`，点击 `window.location.href = "https://omenx.lovable.app/wallet"`（同窗，便于回流；不开新 tab）。
  - 未登录主站 / 拉取失败 → toast + 同一个跳转按钮兜底。
- 文案明确："Funds move between your wallet and Pinpoint instantly. Pinpoint losses don't touch your main wallet."

数据接入：
- 新建 `src/features/pinpoint/wallet-bridge.ts`：
  - `getWalletBalance()` 读主站 OmenX wallet 当前用户可用 USDC（共享 Supabase / Lovable Cloud 身份，走 OmenX 既有 `wallets` 表 + RLS）。
  - `transferToPinpoint(amount)`：在 OmenX 后端调既有内部划转通道 / RPC，原子地从主 wallet 扣款 + 给 Pinpoint 子账户加款，写一条 ledger。**不在 Pinpoint 侧自建出入金。**
- 实施期再到 OmenX 项目读具体表/RPC 名；本计划只承诺：充值流程的所有"链上 / 出入金"环节都交回 `omenx.lovable.app/wallet`。
- 如果当前阶段后端 RPC 还没就绪，wallet-bridge 先用一个 `simulateTransfer` 实现（仅前端 mock，明确 TODO），UI/UX 完全到位，后续接口接上即可，不阻塞用户验收。

Pinpoint 子账户存储：
- 当前 `balance` 已是 Pinpoint 账户余额（localStorage `pp_session_v1`），结构无需改。
- 后续接 OmenX 后端时，把 `balance` 改成从后端 `pinpoint_accounts` 表读取并镜像到本地缓存即可，state 结构保持不变。

### 4. Sidebar
- `MMR` 改读 `state.frozenMmr ?? mmr`，不再回弹 0%。
- 告警条第二行点击文案 → `TAP TO TOP UP`，打开 DepositSheet。
- `Balance` 行右侧加常驻 `+` 小按钮，所有状态都能打开 DepositSheet（不止 frozen）。
- Balance label 微调为 `PINPOINT BAL`，强调子账户身份。

### 5. 防止"低余额单飞"再次悄悄爆仓
- `placeBet` 加软保护：下单后 equity 缓冲 < `notional × MM_RATE × 2` → 返回 `reason: "thin"`，Sidebar toast：`Balance too thin — one tick can liquidate. Lower size or top up.` 用户仍可强行下注，但知情。

### 6. 不做
- 不动 AMM / MM_RATE / fee / leverage 经济模型。
- 不动 localStorage key。
- 不做 Pinpoint → wallet 提现（本期）。
- 不在 Pinpoint 内复刻链上出入金 / 收款地址 / 提现地址等任何 UI。

## 验证
- localStorage balance 改到 $30，下 $25/1× → 冻结弹窗显示真实 MMR + 爆仓前余额，主按钮唤出 DepositSheet。
- 主站 wallet 有 $500：选 $100 → Wallet 变 $400、Pinpoint 变 $100、状态回 active、告警条消失。
- 主站 wallet 只有 $20：选 $100 → 按钮变 `WALLET LOW · ADD FUNDS`，点击跳 `https://omenx.lovable.app/wallet`。
- 余额充足时下注：无 thin 警告、玩法流程不变。
