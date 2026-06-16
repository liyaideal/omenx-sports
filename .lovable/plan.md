## Goal

Replace the ad-hoc "Share" buttons scattered across the app (event, league, players, combo tickets, lucky box, promo cards, etc.) with one cohesive, professional share component. Any "shareable" object on the site funnels through the same surface — desktop Dialog, mobile BottomSheet, embedded poster preview, four channels.

This pass builds the **share component infrastructure** only. The poster artwork stays as it is; you'll restyle it later via the slot the share component exposes.

## Files

New (under `src/components/sports/share/`):

- `ShareProvider.tsx` — top-level provider that owns the open/closed state for the global dialog and the current `ShareTarget`.
- `useShare.ts` — `const { share, close } = useShare(); share(target)` opens the dialog from anywhere.
- `ShareDialog.tsx` — the dialog itself. Picks `Dialog` on `md+`, `Sheet side="bottom"` on mobile (via `useIsMobile`). Contains poster preview slot + channel row + URL row.
- `ShareTrigger.tsx` — `<ShareTrigger target={...} variant="icon|wide|ghost|chip" />`. Internally calls `useShare().share(target)`. Replaces every existing inline "Share" button.
- `channels.ts` — pure helpers: `buildShareUrl`, `openTwitter`, `nativeShare`, `copyToClipboard`, `downloadPoster` (calls the poster's `onDownload` callback).
- `share-targets.ts` — `ShareTarget` discriminated union + small builders (`shareEvent`, `shareLeague`, `sharePlayer`, `shareCombo`, `shareLuckyBox`, `sharePromo`).

Touched:

- `src/routes/__root.tsx` — wrap the app in `<ShareProvider>`.
- `src/components/sports/event/ShareButton.tsx` — re-export `ShareTrigger` with `variant="wide"|"icon"` as the public API; old prop shape preserved (`outcomeId`, `label`, `variant`).
- `src/components/sports/promo/ComboChallengeSection.tsx` — drop the bespoke `openShare` state + `ShareCardPreview` rendering inside `TicketSuccessPanel`. Replace ticket-row and success-modal "Share" buttons with `<ShareTrigger target={shareCombo(ticket)} />`. The existing `ShareCardPreview` component stays exported and is wired as the poster slot for combo targets — that's the artwork you'll restyle later.
- `src/routes/style-guide.tsx` — new "Share" section showing the dialog open with each target type.

## ShareTarget shape

```ts
type ShareTarget =
  | { kind: "event";    id: string; title: string; subtitle?: string; outcomeId?: string; image?: string }
  | { kind: "league";   slug: string; title: string; subtitle?: string; image?: string }
  | { kind: "player";   id: string; title: string; subtitle?: string; image?: string }
  | { kind: "combo";    ticket: SubmittedTicket } // poster = <ShareCardPreview ticket={...} />
  | { kind: "luckybox"; prizeId: string; title: string; image?: string }
  | { kind: "promo";    slug: string; title: string; subtitle?: string; image?: string }
  | { kind: "custom";   title: string; subtitle?: string; url: string; poster?: ReactNode; tweet?: string };
```

Each target resolves to:
- `url` — canonical deep link (`/event/:id?outcome=...`, `/league/:slug`, `/promo/world-cup?tab=combo&ticket=...`, etc.)
- `tweet` — pre-filled X copy (e.g. "I locked a 14.20× 4-leg combo on OMENX — beat me ↘"). Per-kind sensible default; overridable.
- `Poster` — React node rendered in the preview slot. Combo uses the existing `ShareCardPreview`; other kinds use a lightweight `<DefaultPoster title subtitle image />` placeholder we'll restyle later.

## Dialog anatomy (md+ Dialog, mobile Sheet)

```text
┌──────────────────────────────────────┐
│  SHARE                            ✕  │   header: small uppercase label, close
├──────────────────────────────────────┤
│                                      │
│        [ POSTER PREVIEW SLOT ]       │   scales to fit (max-w ≈ 360 mobile / 400 desktop)
│        4:5 aspect by default         │
│                                      │
├──────────────────────────────────────┤
│  [ Copy ]  [ X ]  [ Native ]  [ ⬇ ]  │   channel row (icon + label, equal width)
├──────────────────────────────────────┤
│  https://omenx…/event/123?outcome=y  │   readonly URL field + inline Copy
└──────────────────────────────────────┘
```

- Channels: **Copy Link**, **X / Twitter**, **Native Share** (hidden if `navigator.share` undefined, e.g. desktop), **Download Poster** (calls poster ref's `toPng` — for now the combo poster wires it; other targets show the button disabled with a tooltip "Coming soon" until the artwork lands).
- Copy success → channel button briefly swaps to ✓ + "Copied" (1.6s). Same pattern as today's `ShareButton`.
- X button: `window.open(\`https://twitter.com/intent/tweet?text=${tweet}&url=${url}\`, "_blank")`.
- Native Share: `navigator.share({ title, text: tweet, url })`, falls back silently on AbortError.
- Download: hidden on targets without a downloadable poster.
- All actions fire an `onShared(channel)` callback on the target (optional) — useful for future analytics; no analytics wiring this round.

## API recap

Imperative:
```tsx
const { share } = useShare();
<Button onClick={() => share(shareCombo(ticket))}>Share</Button>
```

Declarative:
```tsx
<ShareTrigger target={shareEvent({ id, title, outcomeId })} variant="icon" />
<ShareTrigger target={shareCombo(ticket)} variant="wide" />
```

`variant`s:
- `icon` — 32px square ghost icon button (used in card headers, ticket rows)
- `chip` — pill with "Share" label + icon (used inside tables/lists)
- `wide` — full-width cinematic CTA (preserves today's `event/ShareButton` wide look)
- `ghost` — bare icon, no border (for compact toolbars)

## Out of scope

- Redesigning the poster artwork — only the preview slot is wired; existing `ShareCardPreview` stays untouched.
- Real download (`html-to-image`). The download button is wired through a `onDownload` callback the poster can provide; combo poster will still log a "coming soon" toast for now to keep this round focused on the share frame.
- Telegram / WhatsApp / FB / QR / Embed.
- Analytics events.

## Style guide

Add a "Share" section to `/style-guide` with: every `ShareTrigger` variant inline, and a "Open dialog" button per kind (event, league, player, combo, luckybox, promo) so the dialog states are all reachable from one playground.
