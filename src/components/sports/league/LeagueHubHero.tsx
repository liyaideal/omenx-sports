import { CalendarDays } from "lucide-react";
import type { LeagueHub } from "@/data/leagues";

/**
 * Tournament/season hub hero. Big crest + name + tagline on a tinted
 * ambient surface. The accent OKLCH triplet drives the gradient so each
 * league has its own visual identity.
 *
 * For tournament-kind leagues the hero layers in extra atmosphere:
 * pitch-stripe background, a trophy glow behind the crest, a kickoff
 * countdown pill, host-nation flag chips, and a live stat strip.
 */
export function LeagueHubHero({
  league,
  matchCount,
  kickoffLabel,
  hostFlags,
  stats,
}: {
  league: LeagueHub;
  matchCount: number;
  /** Tournament-only: short kickoff/venue label, e.g. "Jun 11 · MetLife". */
  kickoffLabel?: string;
  /** Tournament-only: ISO-2 codes for host flags, rendered as chips. */
  hostFlags?: { code: string; name: string }[];
  /** Tournament-only: small stat strip ("48 nations", "104 matches", ...). */
  stats?: { label: string; value: string }[];
}) {
  const accent = league.accent;
  const isTournament = league.kind === "tournament";
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
      {isTournament && (
        <>
          {/* Pitch stripes — very subtle diagonal bands in accent green. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
            style={{
              backgroundImage: `repeating-linear-gradient(115deg, oklch(${accent}) 0 28px, transparent 28px 64px)`,
            }}
          />
        </>
      )}

      <div className="flex items-center gap-5 md:gap-7">
        <span
          className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/[0.06] p-2 ring-1 ring-white/15 md:h-20 md:w-20"
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
            {isTournament && kickoffLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-200 ring-1 ring-amber-300/30">
                <CalendarDays className="h-3 w-3" />
                {kickoffLabel}
              </span>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            {league.name}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {league.tagline}
          </p>
          {isTournament && hostFlags && hostFlags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Hosts</span>
              {hostFlags.map((f) => (
                <span
                  key={f.code}
                  title={f.name}
                  className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-1.5 py-0.5 ring-1 ring-white/10"
                >
                  <img
                    src={`https://flagcdn.com/w40/${f.code.toLowerCase()}.png`}
                    alt=""
                    className="h-3 w-4 rounded-[2px] object-cover"
                  />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    {f.name}
                  </span>
                </span>
              ))}
            </div>
          )}
          {isTournament && stats && stats.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-3">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <span className="font-display text-base font-semibold text-foreground">{s.value}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}