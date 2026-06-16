## 问题原因

`src/components/sports/promo/CarnivalFlagsMarquee.tsx` 里两个问题叠加：

1. `<img loading="lazy">` + `width: "auto"` —— 国旗未加载完之前每张图宽度为 0，整条轨道宽度不够覆盖视口；动画基于 `translateX(-50%)` 工作，但前 100~300ms 轨道本身就比一屏还窄，于是右侧（reverse 那条就是左侧）露出黑底。
2. 轨道只复制了 1 份（`[...FLAGS, ...FLAGS]`，32 面旗 × 2）。在窄屏下勉强够，但在宽屏（如截图里 ~1900px）单份 ~720px 就不够，加载完成后右侧仍然会有空。

## 修复方案

只改 `CarnivalFlagsMarquee.tsx`，不动其它文件：

1. 给每张 `<img>` 加一个**显式宽度**（`width = Math.round(height * 1.5)`），这样布局在图片加载完成前就已经稳定，不再出现 0 宽度坍缩。
2. 把 `loading="lazy"` 改成 `loading="eager"` + `decoding="async"`，确保首屏立刻请求所有旗帜（32 张 w40 PNG，体积很小，不会造成性能压力）。
3. 按视口需要**重复多份**再拼接为无缝循环：以 `FLAG_CODES` 估算单份宽度（32 × (height*1.5 + 8)），如果不够 ~2400px 就先重复到 ≥1200px 再 ×2 复制。简单起见，直接把单份重复 3 次（96 面）再 ×2 = 192 张，保证任何常见桌面宽度都铺满。
4. 关键帧 `flag-marquee` 是 `translateX(0) → translateX(-50%)`，这条逻辑不变 —— 只要轨道是「单份×N」再 ×2 拼接，-50% 永远把第二组无缝接到第一组的位置。

## 不改动

- `styles.css` 里的 `@keyframes flag-marquee` / `animate-flag-marquee[-reverse]`
- 调用方 `ScoreboardHero` 传入的 `opacity` / `height` / `reverse`
- 旗帜列表本身
- 其它 carnival 视觉模块
