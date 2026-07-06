# 世界杯活动 · 用户路径引导 — 交付说明

写一份**单一交付文档**，把三个信息源接起来给研发：
1. **CSV**（附件）→ 触发条件、频控、跳转、蒙层文案
2. **Lovable style-guide** → 交互原型演示（弹窗 + 蒙层长啥样、怎么动）
3. **Figma** → 具体像素级视觉细节

## 文档位置
`/mnt/documents/world-cup-activation-spec.md`，用 `<presentation-artifact>` 交付。

## 骨架（预计 80–120 行）

```
# 世界杯活动 · 用户路径引导 — 交付说明

> 三份参考的分工：
> - CSV（本文档 §2 表格）：触发条件、频控、跳转、文案
> - Lovable style-guide：交互演示原型（弹窗弹出方式、蒙层聚光效果、CTA 回调）
> - Figma：弹窗的视觉细节（尺寸、色值、hero 图、字号、间距）
> Lovable 只能演示交互，无法完全还原 Figma 视觉，研发实现以 Figma 为准。

## 1. 参考链接
- 弹窗交互演示: https://omenx-sports.lovable.app/style-guide#activation
- 蒙层交互演示: https://omenx-sports.lovable.app/style-guide#coachmark
- 弹窗视觉稿 (Figma): <link>
  | Variant       | Desktop | Mobile |
  | reward-pool   | 3:34    | 3:52   |
  | voucher       | 3:41    | 3:59   |
  | deposit-match | 3:47    | 3:65   |

## 2. 三条引导路径（对应 CSV 三行）

### 2.1 引导注册 (reward-pool)
| 项目 | 内容 |
| 用户状态 | 未登录（含 utm / referral） |
| 触发页面 | /en, /en/sports, /en/sports/promo/world-cup?tab=overview |
| 触发条件 | 页面停留 5s |
| 弹窗视觉 | Figma node 3:34 (desktop) / 3:52 (mobile) |
| 弹窗交互 | style-guide#activation — reward-pool |
| 标题 | 3M Reward Pool Live / New users claim 10-560U |
| CTA  | Claim Up to 560U |
| CTA 行为 | ① 点击 → 打开注册弹窗 ② 注册成功 → 跳转 /en/sports/promo/world-cup?tab=newbie，触发蒙层引导 |
| 蒙层交互 | style-guide#coachmark |
| 蒙层文案 | "Claim Your 10U Sign-Up Reward"，按钮 "Got It" |
| 频控 | 同设备累计 ≤ 5 次 |

### 2.2 引导领取仓位券 (voucher)
（同结构表格，状态 A/B 分别说明；文案含 {}U 与 {}h 占位符；频控：同券未领取 ≤ 1 次，同用户未领取类 ≤ 3 次；跳转 /en/vouchers）

### 2.3 引导首充 (deposit-match)
（同结构；触发条件：已登录 + 无券 + 未充或 <20U，停留 5s；CTA "Deposit & Grab 20U"；跳转 → 充值弹窗 → 首充成功后 tab=newbie；频控 ≤ 6 次）

## 3. 通用规则
- 弹窗关闭：×、遮罩、ESC（Desktop）、下拉 grabber（Mobile）
- 弹窗与蒙层为两个独立组件，先弹窗后蒙层
- 频控在设备/用户维度统计，前端负责埋点上报，具体计数持久化方案由研发定
- 移动端弹窗自动切换成底部 sheet，无需单独设计

## 4. 未包含
- 三个业务弹窗（注册 / 充值 / 券列表）本身的视觉，不在此次交付范围
- 埋点字段清单
```

## 不做的事
- 不重复贴 Figma 里的字号色值（Figma 就是权威）
- 不重复贴 Lovable 里已实现的交互代码
- 不动任何代码
