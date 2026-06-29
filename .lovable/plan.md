## Plan

1. Update `RegulationTimeNotice` tooltip trigger so it blocks the parent card link at the earliest interaction phase without breaking Radix Popover open/close behavior.
2. Add keyboard-safe handling so Enter/Space still opens the tooltip but does not activate the card link.
3. Apply the fix only inside the shared tooltip component so both Games-tab card types (`EventMarketTileCard` and `LiveStreamCard`) inherit it without changing their UI structure.
4. Verify by clicking the tooltip on a games card: the popover opens and the URL stays on the current page/card list instead of navigating to `/event/...`.