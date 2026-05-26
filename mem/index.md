# Project Memory

## Core
`DESIGN.md` at repo root is the single source of truth for the visual system. Read it before any UI change; write new locked rules back into it and mirror to `/style-guide`.
Section headers across columns share `min-h-9 leading-9`. Never `leading-none` on a section h2.
Cards in a grid row equal height via `flex h-full flex-col` + `mt-auto` footer; pass `h-full` through any wrapper.
Events grid defaults to 1 row, expands via dashed `ShowMoreEventsButton`. Resets on day-strip change.
Magenta `--neon` is the only signature accent; green/red are reserved for win/loss semantics only.

## Memories
- [DESIGN.md workflow](.agents/skills/design-md/SKILL.md) — read DESIGN.md first, write rules back, mirror to style-guide