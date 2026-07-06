## 目标

按 Figma 稿(https://www.figma.com/design/uJcLNbrCwofKGRfhKc6UgQ)重做 `ActivationDialog` 的 3 个变体 `reward-pool` / `voucher` / `deposit-match`,desktop 和 mobile 都覆盖。当前实现是"图标 + halo"版本,与设计稿差异较大。

## Figma 关键规格

**Desktop 版 (`pc`, 420×380 px)**
- 卡片: `bg #161023` · `border #382b53` · `radius 14px`
- 顶部 148 px 高插画 hero(3 张卡通图: 奖杯 + 3,000,000U / 沙漏 + 10U 券 / 存钱罐 + 20U 券),右上 × 悬浮其上
- 插画底部有 alpha mask 淡出到卡片背景
- Eyebrow pill: `bg rgba(255,255,255,0.05)` + 4 px 圆点/图标 + `Inter Medium 12px uppercase #9697a8`
- 标题: **Jersey 25 42px**,首词彩色 `#f5ba38`(3M / 10U / Get 20U),其余白色
- Subtitle: `Inter Regular 14px #9697a8`
- CTA: 46 px 高胶囊 · `linear-gradient(111deg, #FF8D93 0%, #C67AFF 43.89%, #FFC80E 100%)` · `Jersey 25 24px #F7F8F8` · 无投影
- 间距: 内边距 32 px,内容块之间 16 px

**Mobile 版 (`mobile_底部弹窗`, 390×448 px, bottom sheet)**
- 顶部 172 px 霓虹绿风格 3D 插画(奖杯 / 沙漏 + 10U / 存钱罐 + 20U)
- 顶部 grabber(36×4 px 圆条,居中)
- Eyebrow: 小圆点/图标为绿色,首词标题也用绿色(app 主色 `--neon`)
- CTA: 绿色渐变胶囊(与 app `bg-gradient-neon` 对齐),`Jersey 25 24px`
- 关闭 × 在插画右上,27×28 圆角方块
- 底部 sheet `rounded-t-3xl`,不改现有 `Sheet` 结构

**共用**
- 3 组文案(标题/副标题/CTA/eyebrow)与现有 preset 一致,无需改
- 圆点/沙漏图标: 现有 lucide 可复用,不必切图

## 实施步骤

1. **让你从 Figma 导出 6 张插画 PNG**(desktop 3 张 420×148,mobile 3 张 390×172,建议 @2x 透明背景 PNG),上传后我用 `lovable-assets` 生成 CDN 指针,放 `src/assets/activation/`。这是唯一必须外部提供的资源。
2. **引入 Jersey 25 字体**: `bun add @fontsource/jersey-25`,在 `src/main.tsx` 或 `src/styles.css` 顶部 `@import`,tailwind theme 里加 `font-jersey`。
3. **重写 `src/components/sports/activation/ActivationDialog.tsx`**:
   - 用 `useIsMobile` 分叉 desktop `Dialog` / mobile `Sheet` 的骨架(现有结构保留)。
   - Body 由两部分组成: `<HeroImage variant={variant} device={isMobile ? 'mobile' : 'desktop'} />` + 文案块。
   - 文案块顺序: eyebrow pill → 标题(首词 span 用 accent 色) → subtitle → CTA。
   - 删掉现有 `VARIANT_PRESETS.highlight` 高亮条(Figma 里没有)、halo 渐变(Figma 用插画代替)、图标 well + Sparkles 徽章。
   - Desktop 用 Figma 的 pink→purple→yellow 渐变 CTA(新 class `bg-gradient-carnival`);mobile 继续用 `bg-gradient-neon`。Accent 色同理: desktop `#f5ba38`,mobile `--neon`。
4. **在 `src/styles.css`** 加两个 token:
   - `--gradient-carnival: linear-gradient(111.273deg, #FF8D93 0%, #C67AFF 43.89%, #FFC80E 100%);`
   - 对应 `.bg-gradient-carnival` utility。
5. **`presets.tsx` 不改**(文案已一致),`onCta` / 跳转逻辑维持。
6. **/style-guide `activation` 板块** 已有 3 个预览卡,不动,只会自动跟随新样式渲染。同时新加一条 desktop/mobile 对照小提示。
7. **验收**: 用 preview_ui 切 desktop / mobile 各截一张,与 Figma 侧栏比对间距、字体、颜色。

## 交付给研发的规格清单(如果你要走人工外包)

如果不用我实现、要给外部研发一份说明,把以上"Figma 关键规格 + 实施步骤 3~5"整段发给他们就够,加上:
- Figma 链接 + 每个弹窗的 node-id: 桌面 `2:6` / `2:25` / `3:2`,移动 `3:178` / `3:100` / `3:202`
- 插画切图命名规范: `activation-{variant}-{device}.png` (variant = reward-pool | voucher | deposit-match)
- 交互: CTA 回调保持现有 `onCta`,`Maybe later` 与 × 都调 `onOpenChange(false)`,mobile 支持下拉关闭

## 需要你确认

- 我按上面步骤直接开做,你只需 **导出 6 张插画 PNG 并上传**,可以吗?
- 或者你只想要"给研发的规格文档",我不动代码?
