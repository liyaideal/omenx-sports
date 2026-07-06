# Activation 弹窗 — 简化交付

## 1. 替换 desktop-voucher 主图
- 用新上传的完整沙漏图 `image-352.png` 替换旧的裁切版
- 做法：`lovable-assets delete` 旧指针 → `lovable-assets create` 新图写回 `src/assets/activation/desktop-voucher.png.asset.json`
- 组件代码零改动

## 2. 写一份精简的交付说明

写入 `/mnt/documents/activation-dialogs-spec.md`，只讲清一件事：**Lovable 里的实现只是大致样式，研发以 Figma 为准直接照 Figma 写代码，不要拿 Lovable 和 Figma 对稿**。

文档骨架（预计 30–50 行）：

```
# Activation 弹窗（x3）— 交付说明

> Lovable /style-guide#activation 里的 3 个弹窗只是大致样式演示，
> 用于确认结构和文案。研发实现请直接以 Figma 为准，不要拿 Lovable 对稿。

## Figma 稿
<Figma 链接>

Node 对照：
| Variant       | Desktop | Mobile |
| reward-pool   | 3:34    | 3:52   |
| voucher       | 3:41    | 3:59   |
| deposit-match | 3:47    | 3:65   |

## 结构（三个 variant 一致）
Hero 图 → Eyebrow → Title → Subtitle → Primary CTA
Desktop：居中 Dialog；Mobile：底部 Sheet

## 文案 & accent 词
| Variant       | Title                 | Subtitle                        | CTA              |
| reward-pool   | 3M Reward Pool Live   | Cold visitor · New users …     | Claim now        |
| voucher       | 10U Voucher Is Here   | Claim within 24 hours · …      | Grab voucher     |
| deposit-match | Deposit 20U, Get 20U  | 500 spots daily · first …      | Deposit now      |

## 交互
- 点击 × / 遮罩 / ESC 关闭
- 点击 CTA 触发业务回调，弹窗不自动关闭
- Mobile 下拉 grabber 关闭

## Hero 素材
6 张 PNG 已交付（3 desktop 卡通 + 3 mobile 霓虹），保存在项目 CDN。
研发不必复用，可直接从 Figma 重新导出。
```

用 `<presentation-artifact>` 交付。

不动任何业务代码、不动 style-guide。
