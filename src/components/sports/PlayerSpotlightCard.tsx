import { ArrowLeft, ArrowRight, X, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NeonRing } from "./NeonRing";

export interface PlayerSpotlightCardProps {
  handle: string;
  name: string;
  position: string;
  jersey: number;
  stats: { label: string; value: number }[];
  /** Initials or short text rendered in lieu of a portrait. */
  monogram?: string;
  className?: string;
}

export function PlayerSpotlightCard({
  handle,
  name,
  position,
  jersey,
  stats,
  monogram,
  className,
}: PlayerSpotlightCardProps) {
  const mono = monogram ?? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card bg-ambient",
        className,
      )}
    >
      {/* top row */}
      <div className="flex items-start justify-between">
        <button className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <div className="text-center">
          <div className="text-xs font-mono text-muted-foreground tracking-widest">@ {handle}</div>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-muted-foreground hover:text-foreground" aria-label="Compare">
          <BarChart3 className="h-4 w-4" />
        </button>
      </div>

      {/* hero */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-muted-foreground hover:text-foreground" aria-label="Previous">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <NeonRing size={240} dashed>
          <div className="grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-surface-elevated to-surface text-5xl font-display font-bold text-foreground">
            <div className="text-center">
              <div>{mono}</div>
              <div className="font-mono text-lg text-muted-foreground">#{jersey}</div>
            </div>
          </div>
        </NeonRing>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-muted-foreground hover:text-foreground" aria-label="Next">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* name */}
      <div className="mt-5 text-center">
        <h3 className="font-serif-display text-3xl text-foreground">{name}</h3>
        <div className="mt-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">{position}</div>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white/[0.03] px-3 py-3 text-center">
            <div className="font-display font-bold text-2xl text-foreground tabular-nums">{s.value}</div>
            <div className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}