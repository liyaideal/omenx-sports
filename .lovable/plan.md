## Change
`CoachMarkOverlay` currently always renders the "STEP · 01" eyebrow. That chip should only appear when the guide has multiple steps.

## Rule
- Single-step guide → no step eyebrow.
- Multi-step guide → eyebrow shows `STEP · N / TOTAL` (e.g. `STEP · 1 / 3`).

## Edits

**`src/components/sports/activation/CoachMarkOverlay.tsx`**
- Replace the `eyebrow?: string` prop with a stepper:
  - `step?: number` (1-based)
  - `totalSteps?: number`
- Show the eyebrow chip only when `totalSteps && totalSteps > 1 && step`.  
  Rendered text: `Step · {step} / {totalSteps}` (uppercased by CSS as today).
- Update the JSDoc to state the rule explicitly.

**`src/routes/style-guide.tsx` → `CoachMarkDemo`**
- Drop the `eyebrow="Step · 01"` prop from the demo call (single-step guide → chip hidden).
- Add a second "Rules" bullet documenting the rule:  
  "Step eyebrow only renders when `totalSteps > 1`; single-step guides hide it."
- Optionally add a small note showing the multi-step form (`step={1} totalSteps={3}`) in the rules block so devs see both shapes — pure copy, no extra demo launcher.

No other files touched. No changes to `/promo/world-cup`.
