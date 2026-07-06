## Change
Update the coach-mark demo in `/style-guide` so the highlighted T-01 Complete Registration card reflects the actual trigger moment: user has **already completed registration** and the overlay is nudging them to click **Claim**.

## Edits (style-guide only)
`src/routes/style-guide.tsx` → `CoachMarkDemo`:
- Change the demo target task from `status: "in-progress"` / `progress: 0` / `cta: "Register now"` to:
  - `status: "claimable"`
  - `progress: 1`
  - `cta: "Claim 10 U"` (matches the real `TaskCard` claimable CTA formatting)
  - Drop `ctaHref` / `ctaExternal` (claimable state renders the Claim button, not a link)
- Tweak the coach-mark description to match the new intent, e.g.  
  `"Registration complete — tap Claim to add your 10 U position voucher to your wallet."`
- Keep title `Claim Your 10U Sign-Up Reward`, CTA label `Got it`, eyebrow `Step · 01`.
- Second card (T-02 First deposit) stays `locked` as visual context.

No changes to `CoachMarkOverlay`, `/promo/world-cup`, `NewbieRewardsSection`, or fixtures.
