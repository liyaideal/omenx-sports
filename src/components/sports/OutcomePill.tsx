import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";

export type OutcomeTone = "yes" | "no";

export interface OutcomePillProps {
  /** Label — usually a team name. For neutral markets use "Yes" / "No". */
  label: string;
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
  sm: { box: "px-3 py-2 gap-2", label: "text-xs", price: "text-sm", crest: "xs" },
  md: { box: "px-4 py-3 gap-3", label: "text-sm", price: "text-lg", crest: "sm" },
  lg: { box: "px-5 py-4 gap-3", label: "text-base", price: "text-2xl", crest: "md" },
} as const;

export function OutcomePill({
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between rounded-2xl bg-white/[0.03] ring-1 transition-all",
        s.box,
        selected ? TONE_SELECTED[tone] : TONE_RING[tone],
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {showCrest && <TeamCrest name={label} size={s.crest as "xs" | "sm" | "md"} />}
        <span className={cn("font-display font-semibold text-foreground truncate", s.label)}>{label}</span>
      </div>
      <div className="flex flex-col items-end leading-tight">
        <span className={cn("font-mono font-bold tabular-nums", s.price, TONE_TEXT[tone])}>
          {Math.round(probability)}¢
        </span>
        {hasDelta && (
          <span
            className={cn(
              "text-[10px] font-mono tabular-nums",
              positive ? "text-win" : "text-loss",
            )}
          >
            {positive ? "+" : ""}
            {delta24h}¢ 24h
          </span>
        )}
      </div>
    </button>
  );
}