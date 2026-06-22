Establish "mobile = bottom sheet, never modal" as a core project rule, then apply it to the World Cup combo flow.

## Memory

1. **Update `mem://index.md`** — add a Core rule: "Mobile has no center modals. Any Dialog used in the app must render as a bottom sheet on mobile (Sheet `side="bottom"`) and Dialog only on md+. Mirror the existing `ShareDialog` pattern via `useIsMobile`."
2. **Create `mem://rules/mobile-bottom-sheet`** — detailed entry referencing `ShareDialog` as the canonical pattern, with the Sheet styling we use (`rounded-t-2xl`, `border-t-2`, safe-area, `max-h-[92vh]`).

## Code

3. **`src/components/sports/promo/ComboChallengeSection.tsx`** — convert the three remaining center modals to the responsive pattern:
   - `SubmitConfirmModal`
   - `RequoteModal`
   - `TicketAcceptedModal`

   For each: import `Sheet`/`SheetContent`/`SheetTitle` and `useIsMobile`. When `isMobile`, render the same body inside a bottom `SheetContent` (`rounded-t-2xl`, colored top border matching the modal's accent, `max-h-[92vh] overflow-y-auto`, `pb-[max(env(safe-area-inset-bottom),1rem)]`). Otherwise keep the existing `Dialog`/`DialogContent`. Body markup stays identical.

4. **`src/routes/style-guide.tsx`** — add a short note under the mobile behavior section: campaign confirm / requote / ticket-accepted surfaces use bottom sheet on mobile, dialog on md+, per the global rule.

No business logic, data, or desktop styling changes.