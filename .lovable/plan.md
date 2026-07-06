## Fix Stage 2 card height mismatch

In `src/routes/style-guide.tsx`, the `CoachMarkStage` grid in Stage 2 shows the two task cards at different heights because the claimed `T-01` card has less content (shorter progress area, no CTA button) than the claimable `T-02` card.

Stage 1 doesn't have this problem because its target card (claimable) is on the left and the sibling card layout happens to balance.

### Change

- In `CoachMarkStage`, make the two card wrappers stretch to equal height:
  - Ensure the grid uses `items-stretch` (grid default, but make explicit).
  - Give each card slot `h-full` and ensure the inner task card component fills its container (`h-full flex flex-col`), pushing the CTA/footer row to the bottom with `mt-auto`.
- Apply the same treatment in Stage 1 so both stages render identical, equal-height cards regardless of which side holds the claimable card.

No changes to `/promo/world-cup`, `NewbieRewardsSection`, `CoachMarkOverlay`, or the rules copy.