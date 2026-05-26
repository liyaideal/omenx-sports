import { cn } from "@/lib/utils";

interface RatioBarProps {
  /** 0–100 — share of the LEFT side. Right side is the remainder. */
  value: number;
  leftTone?: "win" | "primary";
  rightTone?: "loss" | "neon";
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

const TONE_BG: Record<string, string> = {
  win: "bg-win",
  loss: "bg-loss",
  primary: "bg-primary",
  neon: "bg-neon",
};
const TONE_TEXT: Record<string, string> = {
  win: "text-win",
  loss: "text-loss",
  primary: "text-primary",
  neon: "text-neon",
};

/**
 * Continuous two-sided ratio bar. Used for Long/Short position ratios,
 * order flow imbalance, or any zero-sum split. NOT a polling/vote bar.
 */
export function RatioBar({
  value,
  leftTone = "win",
  rightTone = "loss",
  leftLabel,
  rightLabel,
  className,
}: RatioBarProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-1.5", className)}>
      {(leftLabel || rightLabel) && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className={cn(TONE_TEXT[leftTone])}>{leftLabel}</span>
          <span className={cn(TONE_TEXT[rightTone])}>{rightLabel}</span>
        </div>
      )}
      <div className="relative flex h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
        <div className={cn("h-full", TONE_BG[leftTone])} style={{ width: `${v}%` }} />
        <div className={cn("h-full flex-1", TONE_BG[rightTone])} style={{ opacity: 0.9 }} />
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-muted-foreground">
        <span>{v}%</span>
        <span>{100 - v}%</span>
      </div>
    </div>
  );
}