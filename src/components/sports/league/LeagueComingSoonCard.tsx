import { Bell, BellRing } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { LeagueHub } from "@/data/leagues";

/**
 * Compact secondary card for leagues whose hubs aren't actively pushed
 * yet. Used on the homepage alongside `LeagueSpotlightCard` to honestly
 * signal "this is coming, not live" without faking volume.
 *
 * Still clickable so curious users can peek at the empty hub.
 */
export function LeagueComingSoonCard({
  league,
}: {
  league: LeagueHub;
}) {
  const startsLabel = league.startsLabel;
  const [subscribed, setSubscribed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (subscribed) {
          setSubscribed(false);
          toast(`Unsubscribed from ${league.name}`);
          return;
        }
        setSubscribed(true);
        toast.success(`You're on the list for ${league.name}`, {
          description: `We'll email you the moment it goes live${
            startsLabel ? ` — opens ${startsLabel}.` : "."
          }`,
        });
      }}
      aria-pressed={subscribed}
      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-border/80 bg-surface/60 p-3.5 text-left transition hover:border-white/15 hover:bg-surface"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.04] p-1.5 ring-1 ring-white/10">
        <img
          src={league.logo}
          alt=""
          className="h-full w-full object-contain opacity-60 grayscale transition group-hover:opacity-90 group-hover:grayscale-0"
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-semibold text-foreground/85">
          {league.name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {startsLabel ? `Opens ${startsLabel}` : "Coming soon"}
        </div>
      </div>
      <span
        className={
          subscribed
            ? "inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-primary ring-1 ring-primary/40 transition"
            : "inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.05] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/10 transition group-hover:text-foreground"
        }
        aria-hidden
      >
        {subscribed ? (
          <>
            <BellRing className="h-3 w-3" /> Notifying
          </>
        ) : (
          <>
            <Bell className="h-3 w-3" /> Notify
          </>
        )}
      </span>
    </button>
  );
}