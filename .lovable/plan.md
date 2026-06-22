目标：Combo 下单金额只支持固定 10U，不允许用户输入、拖动或选择其他金额。

实施计划：
1. 更新 `ComboChallengeSection.tsx` 的 Stake 区域：
   - 移除可编辑 number input。
   - 移除 1U / 5U / 10U 预设按钮。
   - 展示固定金额 `10U`，视觉上保持当前 scoreboard/carnival 风格，但明确是不可编辑状态。
2. 更新移动端 sticky bar 中的 stake 展示：
   - 同样显示固定 `10U`，不出现任何可交互金额控件。
3. 更新 combo 状态逻辑：
   - stake 固定为 10U。
   - stake 校验恒定有效，不再接受其他金额。
   - quote / ticket / payout 继续使用 10U 作为 stake。
4. 同步文案：
   - 把 “valid stake / enter valid stake / 1–10 step 0.1” 等提示移除或改成 “Fixed 10U”。

不做：不增加滑块、不增加金额输入、不支持 10U 以外下注金额。