import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";

export type OutcomeTone = "yes" | "no";

export interface OutcomePillProps {
  /** Label — usually a team name. For neutral markets use "Yes" / "No". */
  label: string;
  /** 0–100 probability percent, also displayed as price in ¢. */
  probability: number;
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
const TONE_TAG: Record<OutcomeTone, string> = {
  yes: "bg-primary/15 text-primary",
  no: "bg-neon/15 text-neon",
};

const SIZES = {
  sm: { box: "px-3 py-2 gap-2", label: "text-xs", price: "text-sm", crest: "xs" },
  md: { box: "px-4 py-3 gap-3", label: "text-sm", price: "text-lg", crest: "sm" },
  lg: { box: "px-5 py-4 gap-3", label: "text-base", price: "text-2xl", crest: "md" },
} as const;

export function OutcomePill({
  label,
  probability,
  tone,
  size = "md",
  selected,
  showCrest = true,
  onClick,
  className,
}: OutcomePillProps) {
  const s = SIZES[size];
  const payout = probability > 0 ? (100 / probability).toFixed(2) : "—";
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
        <div className="flex flex-col items-start leading-tight min-w-0">
          <span className={cn("font-display font-semibold text-foreground truncate", s.label)}>{label}</span>
          <span className={cn("rounded-full px-1.5 py-0.5 mt-0.5 text-[9px] font-mono uppercase tracking-widest", TONE_TAG[tone])}>
            {tone}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end leading-tight">
        <span className={cn("font-mono font-bold tabular-nums", s.price, TONE_TEXT[tone])}>
          {Math.round(probability)}¢
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">×{payout}</span>
      </div>
    </button>
  );
}