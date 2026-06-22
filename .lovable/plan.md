Remove the yellow LED beam below "only this vault applies" in `LuckyBoxSection.tsx`.

Context:
- The user is asking about the short yellow vertical line that currently appears under the caption "only this vault applies" on the Lucky Box section.
- That line is the `LED beam from token → active card` (lines 190-209 of `src/components/sports/promo/LuckyBoxSection.tsx`), a purely decorative pointer from the Volume Ladder token down toward the active vault.
- The user chose option 1: remove it; the caption itself already communicates that only one vault applies.

Change:
- Delete the `LED beam from token → active card` block so the caption sits directly under the ladder without the extra vertical light stroke.
- Keep the Volume Ladder, tier cards, captions, and all other behavior unchanged.

File:
- `src/components/sports/promo/LuckyBoxSection.tsx`

No new dependencies.