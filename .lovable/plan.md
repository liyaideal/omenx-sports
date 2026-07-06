## Change
Add a second playground stage to the Coach-Mark Overlay section in `/style-guide`, mirroring the T-01 example but for T-02 **First Deposit ≥ 20 U** after the user has completed a 20 U+ deposit.

## Edits (style-guide only)
`src/routes/style-guide.tsx` → `CoachMarkDemo`:
- Rename the current stage internally to "Stage 1 · Complete Registration" (keep it exactly as-is).
- Add a second stage below it, "Stage 2 · First Deposit":
  - Own `useState` for open + own `useRef` for the target.
  - "Replay guide" button + `TARGET → T-02 FIRST DEPOSIT ≥ 20 U` kicker, same visual as stage 1.
  - Stage container mirrors SEC-01 header ("SEC-01 · WELCOME PACK") and grid.
  - **T-02 card in `claimable` state**: `progress: 1`, `status: "claimable"`, `cta: "Claim 20 U"`, `newOnly: true`, no `ctaHref`.
  - Sibling T-01 card stays visible as context in `claimed` state (`progress: 1`, `status: "claimed"`, `cta: "Claimed"`).
  - `CoachMarkOverlay` with:
    - `targetRef` → the T-02 card wrapper
    - `title="Claim Your 20U Deposit Reward"`
    - `description="Deposit received — tap Claim to add your 20 U position voucher to your wallet."`
    - `ctaLabel="Got it"`
    - No `step` / `totalSteps` (single-step guide → chip stays hidden per the rule we just added).
- Keep the existing Rules block once at the bottom of the section (no duplication).

No changes to `CoachMarkOverlay`, `/promo/world-cup`, `NewbieRewardsSection`, fixtures, or any other file.
