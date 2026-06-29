## 更新三个 Lucky Box 奖池内容

仅修改 `src/data/world-cup-carnival.ts` 中 `LUCKY_BOX_TIERS[*].prizes` 数组,其它逻辑保持不变。

### Basic Vault(6 项)


| 奖励                    | 概率  |
| --------------------- | --- |
| 2 U Position Voucher  | 35% |
| 10 U Position Voucher | 18% |
| 20 U Position Voucher | 7%  |
| 1 U Cash              | 25% |
| 2 U Cash              | 10% |
| 5 U Cash              | 5%  |


### Premium Vault(7 项)


| 奖励                      | 概率  |
| ----------------------- | --- |
| 20 U Position Voucher   | 28% |
| 50 U Position Voucher   | 16% |
| 100 U Position Voucher  | 6%  |
| 5 U Cash                | 25% |
| 10 U Cash               | 15% |
| 20 U Cash               | 8%  |
| World Cup Jersey `hero` | 2%  |


### Grand Trophy Vault(8 项)


| 奖励                             | 概率  |
| ------------------------------ | --- |
| 100 U Position Voucher         | 26% |
| 200 U Position Voucher         | 14% |
| 500 U Position Voucher         | 5%  |
| 10 U Cash                      | 25% |
| 50 U Cash                      | 16% |
| 100 U Cash                     | 8%  |
| World Cup Jersey `hero`        | 5%  |
| Signed World Cup Jersey `hero` | 1%  |


### 备注

- 概率为按层级稀缺度自洽分配,每池累加 = 100%。如有偏好(更松/更紧的命中、不同的实物概率)请告知,我会调整后再生成代码。
- `hero: true` 触发金色高亮与 Trophy 图标;Grand 池 hero 行旁的 “GUESS WHO'S NEXT →” 入口逻辑保留(锚到 signed jersey 那条)。
- 不改动 `LuckyBoxPrize` 类型、奖池标题、`poolLabel`、解锁阈值或抽奖动效。