import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { TeamLite } from "@/data/sports-mock";
import type { SportsMarket } from "@/data/sports-markets";
import { MatchMarketCard } from "./MatchMarketCard";

/**
 * Shown in the Fans Zone slot when the user has not followed any teams
 * yet. Combines an editorial featured match (so the visual real estate
 * is not wasted) with one-tap follow chips for onboarding.
 */
export function FansZoneEmpty({
  editorPick,
  suggested,
}: {
  editorPick: SportsMarket;
  suggested: TeamLite[];
}) {
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const toggle = (name: string) =>
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Editor's pick · follow your team to personalize
      </div>

      <MatchMarketCard market={editorPick} />

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <h3 className="font-display text-base font-semibold text-foreground">Follow your team</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a few clubs and we&apos;ll surface their matches, polls, and fan posts here.
        </p>

        <ul className="mt-4 grid grid-cols-5 gap-2">
          {suggested.map((team) => {
            const isFollowing = followed.has(team.name);
            return (
              <li key={team.name}>
                <button
                  type="button"
                  onClick={() => toggle(team.name)}
                  aria-pressed={isFollowing}
                  className="group flex w-full flex-col items-center gap-1.5"
                >
                  <span
                    className="relative grid h-12 w-12 place-items-center rounded-full bg-white/[0.05] p-1.5 ring-1 ring-white/10 transition group-hover:ring-white/25"
                    style={{ boxShadow: `0 0 18px -6px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
                  >
                    <img src={team.logo} alt="" className="h-full w-full object-contain" />
                    <span
                      className={`absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full ring-2 ring-surface transition ${
                        isFollowing
                          ? "bg-gradient-neon text-primary-foreground"
                          : "bg-white/[0.08] text-muted-foreground"
                      }`}
                    >
                      {isFollowing ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                    </span>
                  </span>
                  <span className="truncate text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                    {team.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-mono text-muted-foreground">
            {followed.size > 0 ? `${followed.size} selected` : "Tap a crest to follow"}
          </span>
          <button
            type="button"
            disabled={followed.size === 0}
            className="rounded-full bg-gradient-neon px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-glow transition disabled:opacity-40"
          >
            Save preferences
          </button>
        </div>
      </section>
    </div>
  );
}