import type { LeagueHub } from "@/data/leagues";

/**
 * Tournament/season hub hero. Big crest + name + tagline on a tinted
 * ambient surface. The accent OKLCH triplet drives the gradient so each
 * league has its own visual identity.
 */
export function LeagueHubHero({
  league,
  matchCount,
}: {
  league: LeagueHub;
  matchCount: number;
}) {
  const accent = league.accent;
  return (
    <header
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-card md:p-8"
      style={{
        backgroundImage: `
          radial-gradient(circle at 15% 20%, oklch(${accent} / 0.25), transparent 55%),
          radial-gradient(circle at 90% 80%, oklch(${accent} / 0.15), transparent 50%)
        `,
      }}
    >
      <div className="flex items-center gap-5 md:gap-7">
        <span
          className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/[0.06] p-2 ring-1 ring-white/15 md:h-20 md:w-20"
          style={{ boxShadow: `0 0 32px -8px oklch(${accent} / 0.6)` }}
        >
          <img src={league.logo} alt="" className="h-full w-full object-contain" loading="eager" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
              style={{
                backgroundColor: `oklch(${accent} / 0.18)`,
                color: `oklch(${accent})`,
                boxShadow: `inset 0 0 0 1px oklch(${accent} / 0.4)`,
              }}
            >
              {league.kind === "tournament" ? "Tournament" : "Season league"}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {matchCount} {matchCount === 1 ? "event" : "events"}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            {league.name}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {league.tagline}
          </p>
        </div>
      </div>
    </header>
  );
}