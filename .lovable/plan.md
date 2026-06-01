我理解：binary event 本身只有两个 outcome，不应该再在每个 outcome 下面生成一层 YES/NO；多选项 event 才需要对每个 option 提供 YES/NO 两侧交易。

检查到的主要问题：
- 当前详情页 `/event/wc26-bih-advance` 把 binary event 的两个 outcome（Yes / No）又渲染成每行 `YES/NO` 两个按钮，所以变成了截图里的 `Yes` 行里还有 `YES 32¢ / NO 68¢`。
- `src/components/sports/event/EventOutcomesPanel.tsx` 是核心错误点：它对所有 outcomes 都统一渲染 `Buy YES / Buy NO` 和 `${label} YES / ${label} NO` 的 order book。
- `src/routes/event.$id.tsx` 也写着“binary 2-outcome markets treat outcomes[0] = YES, outcomes[1] = NO”，会让交易表单状态继续沿用错误模型。
- 数据里仍有不少 binary event 用 `outcomes: Yes/No`：包括 `wc26-bih-advance`、`wc26-can-advance`、`wc26-can-clean-sheet`、`messi-hattrick`、`haaland-2g`、部分 player prop / group outcome / top scorer stub，以及 style-guide fixtures。
- style-guide 里还有多处旧规则文案（binary = Yes/No、每行 Buy YES/NO），需要同步，否则之后还会按旧规范做回去。

实施计划：
1. 补充项目记忆
   - 新增/更新 memory：`binary event` 是 2-outcome event，两个 outcome 就是可交易 market；不能再给每个 outcome 嵌套 YES/NO。
   - 明确：只有 3+ outcomes 的多选项 event 才在单个 outcome 下有 YES/NO 两侧。

2. 修正交易详情页核心逻辑
   - `EventOutcomesPanel` 根据 `market.outcomes.length === 2` 分支：
     - binary event：只显示两个 outcome 行，每行一个交易按钮（例如 `TRADE 32¢` 或 outcome label + price），不显示每行 YES/NO 双按钮。
     - 多选项 event：保留每个 outcome 的 Buy YES / Buy NO 逻辑。
   - OrderBook：
     - binary event 展开某个 outcome 时展示该 outcome 自己的 book，不再用 `${label} YES / ${label} NO`。
     - 多选项 event 才使用 `${label} YES / ${label} NO`。

3. 修正 `event.$id.tsx` 交易表单映射
   - binary event：选择哪个 outcome，就把该 outcome 直接传给交易表单，隐藏/固定 side，不再允许对该 outcome 选择 YES/NO。
   - 多选项 event：继续用 selected outcome + side（YES/NO）模式。

4. 清理数据错误
   - 把新增的相关 events（`wc26-can-advance`、`wc26-bih-advance`、`wc26-can-clean-sheet`）从 literal `Yes/No` 数据改成更明确的两个 outcome：例如 `Advance / Miss out`、`Clean sheet / Concede`。
   - 扫描并修正核心产品数据里其它 binary literal Yes/No，避免首页卡片、league tab、详情页再次出现同类问题。
   - 对自动生成的 tournament per-candidate binary stub 做同样处理，避免 group card 跳转后出现嵌套 Yes/No。

5. 同步 style-guide
   - 更新相关 demo 和文案：binary event 不再是“每个 outcome 再买 YES/NO”；多选项 event 才是 outcome + side。
   - 新共享/修改后的真实页面模块会同步到 `/style-guide`，保持项目规则一致。

6. 验证
   - 全局重新扫描 `label: "Yes"/"No"`、`Buy YES / Buy NO` 等模式，确认只剩技术性或多选项场景允许的位置。
   - 检查当前 `/event/wc26-bih-advance` 不再出现截图里的嵌套 Yes/No 行。