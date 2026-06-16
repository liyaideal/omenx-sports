## Plan

1. **Make the poster inherently less tall**
   - Change `ShareCardPreview` from the current tall poster ratio to a wider 4:5-style ratio.
   - Keep the official OMENX logo and existing visual system.
   - Tighten vertical spacing inside the poster so the bottom `Share & Invite` / QR section remains visible without feeling cramped.

2. **Fix the dialog preview area so it never hides the poster bottom**
   - Increase the desktop share dialog width so the poster can render wider instead of tall and skinny.
   - Give the poster preview area a fixed available height calculation, then scale the poster to fit inside it.
   - Prevent the channel buttons / URL row from covering the poster by making them non-overlapping layout sections.

3. **Keep `/style-guide` in sync**
   - Update the style-guide share poster preview container to match the new wider poster proportions, so the playground reflects the real share dialog.

4. **Validate visually**
   - Reopen `/promo/world-cup?tab=combo`, open the combo share modal, and confirm the full poster bottom section is visible above the action buttons at the current desktop viewport.