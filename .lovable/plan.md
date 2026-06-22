`SheetContent` always renders its own Radix close (X top-right), and `ShareBody` also draws its own X in the header. On mobile the share sheet shows two close buttons. Fix:

1. **`src/components/sports/share/ShareDialog.tsx`** — on the mobile `SheetContent`, hide the built-in close by adding `[&>button]:hidden` to its className (matches the same trick already used on the desktop `DialogContent`). Body's custom X stays.

2. **`src/components/sports/promo/ComboChallengeSection.tsx`** — `ResponsiveModal`'s mobile `SheetContent` currently has no custom close in body, so the default Radix X is the only one (good). No change needed unless the body adds its own X — verified, none of the three modals (SubmitConfirm / Requote / TicketAccepted) draw a custom close, they rely on action buttons + the sheet's X.

Only ShareDialog is affected.