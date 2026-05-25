import { cn } from "@/lib/utils";

interface VoteBarProps {
  label?: string;
  /** 0–100 — share of votes for this side. */
  value: number;
  tone?: "primary" | "neon" | "blue" | "win" | "loss";
  count?: number;
  className?: string;
}

const TONES: Record<NonNullable<VoteBarProps["tone"]>, string> = {
  primary: "from-primary/80 to-primary",
  neon: "from-neon/70 to-neon",
  blue: "from-[oklch(0.65_0.18_250)] to-[oklch(0.75_0.16_270)]",
  win: "from-win/70 to-win",
  loss: "from-loss/70 to-loss",
};

export function VoteBar({ label, value, tone = "primary", count, className }: VoteBarProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-1", className)}>
      {(label || count !== undefined) && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">{label}</span>
          {count !== undefined && <span className="font-mono text-foreground">{count}</span>}
        </div>
      )}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", TONES[tone])}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}