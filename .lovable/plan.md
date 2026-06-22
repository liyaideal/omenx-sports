## 目标
统一 Combo 下注成功弹窗底部两个操作按钮（Share my combo / Build another combo）的视觉样式，消除当前的高度、圆角、图标位置不一致带来的违和感。

## 当前问题（见用户截图）
- **高度不同**：Share 按钮使用 `ShareTrigger variant="wide"`，内边距 `py-4`；Build another 按钮是手写 `<button>`，`py-2`。
- **圆角不同**：Share 是 `rounded-2xl`；Build another 是直角/方角。
- **图标位置相反**：Share 图标在文字右侧；Build another 图标在文字左侧。

## 修改方案
仅修改 `src/components/sports/promo/ComboChallengeSection.tsx` 中 `SuccessModal` 的底部按钮区。

1. **统一按钮结构**
   - 两个按钮都使用相同外层结构：`w-full`、相同垂直内边距（`py-4`）、相同圆角（`rounded-2xl`）、相同字体排版（`font-mono text-[11px] font-bold uppercase tracking-[0.25em]`）。
2. **图标统一放在右侧**
   - 与当前 Share 按钮保持一致，两个按钮的文字在左、图标在右。
   - 图标外都套 `h-6 w-6 rounded-lg` 的容器井，保持视觉重量一致。
3. **保留语义色**
   - Share 按钮保持 amber 描边/背景（强调主操作）。
   - Build another 按钮保持 zinc/中性描边与背景（次要操作）。
4. **代码组织**
   - 不新增共享组件；将 Build another 按钮改为内联 JSX，与 Share 按钮的 DOM 结构对齐，避免引入抽象层。

## 预期结果
弹窗底部两个按钮等高、等圆角、图标同侧，视觉上形成统一的操作面板，不再割裂。

## 不涉及的范围
- 不改动分享逻辑、海报生成、`ShareTrigger` 其他变体。
- 不改动成功弹窗其余文案、赔率数字、关闭逻辑。
- 不改动 `/style-guide`（这不是新增可复用组件，只是局部对齐两个现有按钮）。