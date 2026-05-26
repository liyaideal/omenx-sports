import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Team } from "@/lib/teams";

export type OutcomeTone = "yes" | "no";

export interface OutcomePillProps {
  /** Either pass a `team` (preferred — shows short code + tooltip + logo) or a raw `label`. */
  team?: Team;
  /** Fallback label when `team` is omitted. */
  label?: string;
  /** 0–100 probability percent, also displayed as price in ¢. */
  probability: number;
  /** Optional 24h price change in ¢ (e.g. +3, -1). Shown under the price. */
  delta24h?: number;
  tone: OutcomeTone;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  showCrest?: boolean;
  onClick?: () => void;
  className?: string;
}

const TONE_RING: Record<OutcomeTone, string> = {
  yes: "ring-primary/30 hover:ring-primary/60",
  no: "ring-neon/30 hover:ring-neon/60",
};
const TONE_SELECTED: Record<OutcomeTone, string> = {
  yes: "ring-primary bg-primary/15 shadow-[0_0_30px_-10px_var(--primary)]",
  no: "ring-neon bg-neon/15 shadow-glow",
};
const TONE_TEXT: Record<OutcomeTone, string> = {
  yes: "text-primary",
  no: "text-neon",
};
const SIZES = {
  // Crest is intentionally one notch smaller than the legacy circle crest:
  // real logos use their full bounding box (no inner padding), so a "sm" real
  // logo reads visually larger than a "sm" letter circle.
  sm: { box: "px-2.5 py-2 gap-2", code: "text-xs", price: "text-sm", crest: "xs" },
  md: { box: "px-2.5 py-2 gap-2", code: "text-sm", price: "text-base", crest: "xs" },
  lg: { box: "px-3.5 py-2.5 gap-3", code: "text-base", price: "text-xl", crest: "sm" },
} as const;

export function OutcomePill({
  team,
  label,
  probability,
  delta24h,
  tone,
  size = "md",
  selected,
  showCrest = true,
  onClick,
  className,
}: OutcomePillProps) {
  const s = SIZES[size];
  const hasDelta = typeof delta24h === "number";
  const positive = (delta24h ?? 0) >= 0;
  const displayShort = team?.short ?? label ?? "";
  const fullName = team?.name ?? label ?? "";
  // Neutral Yes/No outcomes don't need a tooltip — the code IS the full name.
  const showTooltip = !!team && team.name.toLowerCase() !== team.short.toLowerCase();

  const button = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between rounded-2xl bg-white/[0.03] ring-1 transition-all text-left",
        s.box,
        selected ? TONE_SELECTED[tone] : TONE_RING[tone],
        className,
      )}
      aria-label={fullName}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {showCrest && (
          <TeamCrest
            name={fullName}
            abbr={team?.short}
            logoUrl={team?.logo}
            size={s.crest as "xs" | "sm" | "md"}
          />
        )}
        <span className={cn("font-display font-bold tracking-wide text-foreground uppercase truncate", s.code)}>
          {displayShort}
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className={cn("font-mono font-bold tabular-nums leading-none", s.price, TONE_TEXT[tone])}>
          {Math.round(probability)}¢
        </span>
        {hasDelta && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-mono tabular-nums leading-none",
              positive ? "bg-win/10 text-win" : "bg-loss/10 text-loss",
            )}
          >
            {positive ? "+" : ""}
            {delta24h}¢
          </span>
        )}
      </div>
    </button>
  );

  if (!showTooltip) return button;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top">{fullName}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}