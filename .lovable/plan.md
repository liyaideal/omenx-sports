## 方案 C：删掉 Fan Status 模块

### 改动范围
1. **`src/components/sports/promo/OverviewSection.tsx`**
   - 移除第 65 行的 `<FanStatusPanel />` 使用。
   - 删掉第 130–189 行整个 `FanStatusPanel` 组件定义。
   - 清理 `USER_CARNIVAL_STATE` 的 import（如果删完之后这个文件不再用到，否则保留——`OverviewSection` 里其他地方可能还在用，先 grep 确认）。

2. **`src/data/world-cup-carnival.ts`**
   - 从 `USER_CARNIVAL_STATE` 里删掉只服务于 Fan Status 的两个字段：`fanLevel`、`qualificationPercent`。
   - 保留 `followedTeams`（其他地方还会用到，且本身有意义）。

3. **`/style-guide`**：当前没有 Fan Status 的独立 demo，无需改动。

### 不做的事
- 不动 `followedTeams` 本身、不动 LuckyBox / Predictions / Combo 等其他模块。
- 不引入新的"参与度"组件——按你的选择，先彻底拿掉，等之后有明确等级/奖励规则再补。

### 验证
- 打开 `/promo/world-cup?tab=overview`，确认顶部那条 LVL 24 / Qualification Phase 进度条已经消失，下方的 Lucky Box、Predictions、Combo 等模块布局没有错位或留下空隙。
- 跑一遍 typecheck，确认没有遗留的未使用 import / 字段引用。
