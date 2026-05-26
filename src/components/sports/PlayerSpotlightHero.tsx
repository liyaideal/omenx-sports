import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NeonRing } from "./NeonRing";

export interface PlayerSpotlightHeroProps {
  handle: string;
  monogram: string;
  jersey: number;
  className?: string;
}

/**
 * Bento-hero variant: a near-square panel dominated by the NeonRing
 * monogram. Stripped of name/stats and prev/next nav so the ring stays
 * the visual anchor in a ~340px column.
 */
export function PlayerSpotlightHero({
  handle,
  monogram,
  jersey,
  className,
}: PlayerSpotlightHeroProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface bg-ambient p-5 shadow-card",
        "min-h-[360px]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          @ {handle}
        </span>
        <button
          className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-muted-foreground hover:text-foreground"
          aria-label="Compare"
        >
          <BarChart3 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 grid place-items-center">
        <NeonRing size={260} dashed>
          <div className="grid h-48 w-48 place-items-center rounded-full bg-gradient-to-br from-surface-elevated to-surface text-center">
            <div>
              <div className="font-display font-bold text-6xl text-foreground tracking-tight">
                {monogram}
              </div>
              <div className="mt-1 font-mono text-base text-muted-foreground">#{jersey}</div>
            </div>
          </div>
        </NeonRing>
      </div>
    </div>
  );
}