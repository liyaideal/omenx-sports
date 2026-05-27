import { Link } from "@tanstack/react-router";
import { ChevronRight, Radio } from "lucide-react";

/**
 * One-line live indicator for mobile home — tap to jump straight into the
 * Events tab where the full MobileLiveHero lives. Renders nothing when
 * `count === 0` so the home page collapses cleanly.
 */
export function MobileLiveStatusBar({
  count,
  topLabel,
}: {
  count: number;
  /** e.g. "Chelsea vs Paris SG" — most prominent live fixture for context. */
  topLabel?: string;
}) {
  if (count <= 0) return null;
  return (
    <Link
      to="/events"
      className="flex items-center gap-3 rounded-2xl border border-[oklch(0.7_0.22_25)]/30 bg-[oklch(0.7_0.22_25)]/10 px-4 py-3 transition active:scale-[0.99]"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.7_0.22_25)] opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.22_25)] shadow-[0_0_8px_oklch(0.7_0.22_25)]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_25)]">
          <Radio className="h-3 w-3" />
          {count} live now
        </div>
        {topLabel && (
          <div className="truncate font-display text-sm font-medium text-foreground">
            {topLabel}
          </div>
        )}
      </div>
      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-foreground">
        Watch <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}