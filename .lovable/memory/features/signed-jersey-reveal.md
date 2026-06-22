---
name: Guess the Legend — country-by-country reveal
description: /promo/world-cup `legend` tab — per-round 1 country + 4 candidates + 3 progressive clues; correct guess grants 1× Tier-01 Basic Vault spin
type: feature
---

## Scope

Independent tab `legend` on `/promo/world-cup` (SEC-04). Owned by
`GuessTheLegendTab` + data fixtures in `src/data/world-cup-carnival.ts`
(`LEGEND_ROUNDS`, `LEGEND_COUNTRIES`, `PREWARM_LEGENDS`).

## Hard rules

- 8-country main pool only: BRA / ESP / FRA / ARG / GER / ENG / NED / POR.
- Same country MAY repeat in the queue (Brazil could surface Kaká one
  round and Roberto Carlos another). Treat country as a tag, not a key.
- Per round: exactly 1 country + exactly 4 candidate cards + exactly 3
  clues (`revealed` or `locked`).
- Distractor candidates: real retired legends of that country, picked by
  the frontend (mock pool documented in the plan file). Never invent
  fictional players. Never use distractors who are actual signees.
- Reveal cadence is intentionally random (depends on player availability).
  UI MUST display `next reveal · TBA` and `clue X of 3 live` — never a
  numeric countdown.
- Clue unlocks gated on community-vote thresholds (mock %), not timers.
- Reward on correct guess: `1× Tier-01 Basic Vault spin` on reveal day.
  NEVER grant the signed jersey itself (jerseys ship via LuckyBox Tier-03).
- Pre-warm strip: shows already-signed bonus memorabilia. Bonus legends
  outside the 8-country pool (e.g. Yaya Touré) are flagged `BONUS` and
  MUST NOT enter the round queue.

## Round state machine

`upcoming → voting → locked-in → revealed-hit | revealed-miss`

- `voting`: candidates clickable, CTA armed.
- `locked-in`: user picked & confirmed; siblings dim; CTA disabled with
  "Pick locked · waiting for reveal".
- `revealed-hit`: correct candidate crowned, success banner grants spin.
- `revealed-miss`: correct candidate crowned, user's wrong pick marked ✗.
- `upcoming`: country not yet announced; show `?` + locked dashed card.

## Cross-links

- LuckyBox Tier-03 card has a small "GUESS WHO'S NEXT →" link to this tab.
- Style-guide demos: RoundCard 4-state playground + RevealWall demo.

## Don't

- Don't expose all 8 legends at once (rejected: too dense, 1/8 hit rate).
- Don't put this module back inside LuckyBox — container is too small.
- Don't show a numeric countdown for next reveal.
- Don't add an "Other / write-in" candidate option (4-fixed by design).
- Don't promote a pre-warm bonus legend into the round queue.