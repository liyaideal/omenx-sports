import { cn } from "@/lib/utils";

/**
 * Real league logos sourced from ESPN's public CDN. PNGs with transparent
 * backgrounds so they sit cleanly on the dark surface. `from`/`to` stay as
 * a fallback gradient when an image fails to load or when the league has no
 * registered preset.
 */
const PRESETS: Record<
  string,
  { label: string; from: string; to: string; mono: string; logo: string }
> = {
  epl: {
    label: "EPL",
    from: "oklch(0.55 0.2 295)",
    to: "oklch(0.35 0.15 290)",
    mono: "PL",
    logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/23.png",
  },
  laliga: {
    label: "La Liga",
    from: "oklch(0.7 0.22 25)",
    to: "oklch(0.55 0.2 350)",
    mono: "LL",
    logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/15.png",
  },
  ucl: {
    label: "UCL",
    from: "oklch(0.65 0.2 250)",
    to: "oklch(0.45 0.18 280)",
    mono: "UCL",
    logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/2.png",
  },
  seriea: {
    label: "Serie A",
    from: "oklch(0.65 0.22 145)",
    to: "oklch(0.45 0.18 200)",
    mono: "SA",
    logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/12.png",
  },
  mls: {
    label: "MLS",
    from: "oklch(0.55 0.18 235)",
    to: "oklch(0.45 0.16 250)",
    mono: "MLS",
    logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/19.png",
  },
  nba: {
    label: "NBA",
    from: "oklch(0.7 0.22 40)",
    to: "oklch(0.55 0.18 20)",
    mono: "NBA",
    logo: "https://a.espncdn.com/i/leaguelogos/nba/500/nba.png",
  },
};

const FALLBACK = { from: "oklch(0.55 0.12 295)", to: "oklch(0.35 0.08 290)" } as const;

/**
 * Resolve a free-form league short label (e.g. "EPL", "La Liga", "MLS") to
 * a preset key. Falls back to a generic gradient crest using the first
 * 1–3 characters of the short label.
 */
function resolvePreset(short: string): { label: string; from: string; to: string; mono: string; logo?: string } {
  const norm = short.replace(/\s+/g, "").toLowerCase();
  if (norm === "epl" || norm === "premierleague") return PRESETS.epl;
  if (norm === "laliga") return PRESETS.laliga;
  if (norm === "ucl" || norm === "championsleague") return PRESETS.ucl;
  if (norm === "seriea") return PRESETS.seriea;
  if (norm === "mls") return PRESETS.mls;
  if (norm === "nba") return PRESETS.nba;
  return {
    label: short,
    from: FALLBACK.from,
    to: FALLBACK.to,
    mono: short.slice(0, 3).toUpperCase(),
  };
}

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
      <LeagueCrest preset={p} className={dim} />
      {showLabel && <span className="text-xs text-muted-foreground font-medium">{p.label}</span>}
    </div>
  );
}

export const LEAGUE_KEYS = Object.keys(PRESETS) as Array<keyof typeof PRESETS>;

/**
 * Canonical league chip for card headers. One pill, used everywhere a league
 * is named at the top of a card. See DESIGN.md §4 — never render
 * `{market.league.short}` as bare text in a header.
 *
 * Accepts either a known preset key (`league`) or a free-form short label
 * (`short`); the short form resolves to a preset when possible and falls back
 * to a neutral gradient crest.
 */
interface LeagueChipProps {
  league?: keyof typeof PRESETS;
  short?: string;
  className?: string;
}

export function LeagueChip({ league, short, className }: LeagueChipProps) {
  const p = league ? PRESETS[league] : resolvePreset(short ?? "");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
        className,
      )}
    >
      <LeagueCrest preset={p} className="h-3.5 w-3.5" />
      {p.label}
    </span>
  );
}

/**
 * Renders the league crest. Prefers the real logo when available (PNG on
 * transparent background, sat in a subtle ring); falls back to the gradient
 * monogram for unknown leagues.
 */
function LeagueCrest({
  preset,
  className,
}: {
  preset: { label: string; from: string; to: string; mono: string; logo?: string };
  className?: string;
}) {
  if (preset.logo) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/10",
          className,
        )}
      >
        <img
          src={preset.logo}
          alt=""
          loading="lazy"
          className="h-[78%] w-[78%] object-contain"
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold text-white",
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
    >
      {preset.mono.slice(0, 3)}
    </span>
  );
}