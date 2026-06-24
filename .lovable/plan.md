我理解这次的核心问题：现在实现仍然是 DOM 格子 + CSS 动画，所以天然做不出“空格先没、下注格继续滑、命中爆裂飘钱”的真实交互。接下来要把网格主体重做成 canvas。

## 目标

- 网格、价格线、倍数、下注格、结算动画全部在一块 `<canvas>` 上用 `requestAnimationFrame` 每帧重画。
- 空格和下注格走不同生命周期：
  - 未下注 cell 到 NOW 线：原地快速淡出并移除。
  - 已下注 cell 到 NOW 线：继续往左滑入历史/价格区域，500-800ms 慢慢淡出。
  - 赢的 cell：先播放强烈 HIT 爆闪、缩放弹跳、外扩光圈，并弹出绿色 `+$xxx` 飘字。
- 点击未来格子下注；再次点击同一个未结算下注格取消并退款。
- 保留现有左侧下注金额、杠杆、余额、STOP、事件/market 选择逻辑。

## 实施计划

1. **重写 `Grid.tsx` 为 Canvas 渲染器**
   - 用 `canvasRef + ResizeObserver + requestAnimationFrame` 管理绘制。
   - DPR 适配：`canvas.width/height = cssSize * devicePixelRatio`，绘制前 scale。
   - 建立虚拟坐标系：

```text
NOW_X = 左侧价格历史区宽度
timeToX(expiryT) = NOW_X + (expiryT - now) * PX_PER_MS
priceToY(price) = canvasH / 2 - (price - smoothCenter) * PX_PER_CENT
```

2. **实现 cell 数据和独立状态机**
   - 每帧按当前时间生成/维护未来列 cell，不再把一列 DOM 一起移动。
   - 每个 cell 用数据描述：`expiryT / bandCenter / multiplier / state / anim / bet`。
   - 到期时逐格处理：空格进入 `dying`；下注格进入 `resolving_win` 或 `resolving_lose`。

3. **绘制分层效果**
   - 背景星点/暗网格。
   - 左侧价格刻度与发光价格折线。
   - 右侧未来倍率格子，暖橙色圆角矩形，数字在 canvas 绘制。
   - NOW 线、顶部倒计时胶囊、当前价格 pill。
   - 下注格三行信息：`$stake`、`multiplier x`、`+$profit`。
   - 结算特效层：HIT 爆闪、光圈、绿色收益飘字。

4. **点击命中检测改为 canvas 坐标**
   - 监听 canvas click/mousemove。
   - 用鼠标像素坐标反查未来 cell：`hitTest(x, y) -> cell`。
   - hover 高亮也在 canvas 内绘制，不再依赖 DOM hover。

5. **补齐取消下注能力**
   - 在 `useStrikezoneSession` 增加按 position id 取消并退款的函数。
   - `Grid` 点击已下注 cell 时调用取消；点击空未来 cell 时下注。

6. **调整结算数据流**
   - 保留现有 `settlePosition` 的余额/盈亏逻辑。
   - `Grid` 内维护短生命周期 settled/effects cache，让已经从 open 列表移除或状态变更的下注格还能继续滑动并播放动画。
   - 移除或弱化 toast HIT，主要反馈放回 canvas 的爆裂和飘钱上，提升博彩刺激感。

7. **清理 CSS 动画依赖**
   - `sz-theme.css` 只保留页面、侧栏、按钮、字体和少量容器样式。
   - 删除/停用原先 DOM cell 动画，避免和 canvas 方案混在一起。

8. **同步 `/style-guide`**
   - 按项目记忆要求，给新的 StrikeZone canvas 网格增加一个可视化 demo/入口，保证 playground 与真实页面同步。

9. **验证**
   - 用浏览器打开 `/strikezone`，确认：
     - 网格是 canvas 渲染。
     - 点击下注后格子锁定三行信息。
     - 到期时空格先消失，下注格继续左滑。
     - 命中时有明显 HIT、光圈、绿色 `+$xxx` 飘字。
     - 再点已下注格可取消退款。
     - 桌面与当前预览宽度下不重叠、不空白。