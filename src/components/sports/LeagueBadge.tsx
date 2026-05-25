import { cn } from "@/lib/utils";

const PRESETS: Record<string, { label: string; from: string; to: string; mono: string }> = {
  epl: { label: "EPL", from: "oklch(0.55 0.2 295)", to: "oklch(0.35 0.15 290)", mono: "PL" },
  laliga: { label: "La Liga", from: "oklch(0.7 0.22 25)", to: "oklch(0.55 0.2 350)", mono: "LL" },
  ucl: { label: "UCL", from: "oklch(0.65 0.2 250)", to: "oklch(0.45 0.18 280)", mono: "UCL" },
  seriea: { label: "Serie A", from: "oklch(0.65 0.22 145)", to: "oklch(0.45 0.18 200)", mono: "SA" },
  nba: { label: "NBA", from: "oklch(0.7 0.22 40)", to: "oklch(0.55 0.18 20)", mono: "NBA" },
};

interface LeagueBadgeProps {
  league: keyof typeof PRESETS;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function LeagueBadge({ league, size = "sm", showLabel = true, className }: LeagueBadgeProps) {
  const p = PRESETS[league];
  const dim = size === "sm" ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-[11px]";
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn("inline-flex items-center justify-center rounded-full font-mono font-semibold text-white shadow-card", dim)}
        style={{ backgroundImage: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
      >
        {p.mono}
      </span>
      {showLabel && <span className="text-xs text-muted-foreground font-medium">{p.label}</span>}
    </div>
  );
}

export const LEAGUE_KEYS = Object.keys(PRESETS) as Array<keyof typeof PRESETS>;