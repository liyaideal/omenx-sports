## 海报视觉重做

针对你提的三件事重做 `ShareCardPreview`（`src/components/sports/promo/ComboChallengeSection.tsx` 第 1160–1460 行）。

### 1. 换背景为你上传的体育场图
- 把 `user-uploads://image-224.png` 通过 `lovable-assets create` 注册成 CDN 资源 → `src/assets/poster-bg-stadium.jpg.asset.json`。
- 在 `ShareCardPreview` 顶层渲染一张绝对定位的 `<img>` 铺满海报（`absolute inset-0 h-full w-full object-cover`），下面叠一层很轻的暗色蒙版（rgba(0,0,0,0.35)）保证文字对比度。
- **删掉**当前用 `radial-gradient` 模拟的体育场灯光（第 1175–1179 行的 `backgroundImage`），因为新背景图已经自带灯光锥和粒子，再叠会脏。
- 保留顶层的点阵纹理 `.poster-dot-grid`，但把 opacity 从 `0.30` 降到 `0.15`，让它只做微弱叠层。
- 保留 `inset-[3%]` 的霓虹绿外框。

### 2. OMENX logo 更大气
- Logo 当前 `height: 7.4cqw`，约占海报宽度 18%。改成 `height: 12cqw`，约占宽度 30%，整体居中加 drop-shadow 让它更"压得住"上半部分。
- 顶部 padding `pt-[3.5%]` 提到 `pt-[5%]`，给 logo 留呼吸空间。
- 给 logo 加 `style={{ filter: "drop-shadow(0 0 14px rgba(0,0,0,0.6))" }}`，避免在球场亮光区被冲淡。

### 3. 重新整理间距（核心问题）
当前所有 section 之间都被压成 `mt-[1%]` ~ `mt-[1.6%]`，每块内部 padding 也太挤，所以看起来"丑"。重做节奏如下：

| 区块 | 现在 | 调整后 |
|---|---|---|
| 整体内边距 | `px-[6%] pt-[3.5%] pb-[3%]` | `px-[7%] pt-[5%] pb-[4.5%]` |
| Logo → Trophy 徽章 | `mt-[1.5%]` | `mt-[4%]` |
| Trophy → Hero 数字 | `mt-[1.5%]` | `mt-[4%]` |
| Hero → 副标题 | `mt-[0.8%]` | `mt-[1.5%]` |
| 副标题 → 主 ticket | `mt-[1.6%]` | `mt-[4.5%]` |
| 主 ticket → SHARE ticket | `mt-[1%]` | `mt-[3.5%]` |
| 主 ticket 内 padding | `px-[3.5%] py-[2%]` | `px-[4%] py-[3.5%]` |
| 每条 leg 行 padding | `py-[1.2%]` | `py-[1.8%]` |
| stats 行 `py` | `py-[1.5%]` | `py-[2.2%]` |
| 主 ticket 内 legs ↔ stats 间距 | `mt-[2%]` | `mt-[3%]` |
| SHARE ticket padding | `px-[3%] py-[2%]` | `px-[4%] py-[3.5%]` |
| Trophy 与文字 gap | `gap-0.5` | `gap-[1.5%]` |

为了让多出来的纵向空间放得下，海报比例从 `4 / 5` 改为 `4 / 5.3`（仍然比最早的 1080×1400 矮，整体观感介于之前两次之间，刚好够新的呼吸感）。`ShareDialog` 的 preview 容器宽高 clamp 同步微调，确保 modal 里依然完整可见、不被 channel 按钮压。

### 4. 同步 `/style-guide`
`/style-guide` 内 ShareCardPreview 的演示沿用 `ShareCardPreview` 组件本身，无需另外改 markup —— 但要打开 `/style-guide` 确认新的 aspect-ratio 和背景图在 demo 容器里没有溢出。

### 5. 验证
- 打开 `/promo/world-cup?tab=combo` → 完成一张 ticket → 打开 share modal，确认：
  - 背景是新的球场图、不再有原来 radial 灯光叠出来的脏感；
  - OMENX logo 明显比之前大、居中、有阴影压底；
  - 各 section 之间有清晰的呼吸感，没有挤在一起；
  - 底部 SHARE & INVITE 仍然完整可见，QR 不被裁。
- 在 `/style-guide` 的 ShareCardPreview demo 中再确认一次相同观感。

不动任何业务逻辑，只改海报视觉。
