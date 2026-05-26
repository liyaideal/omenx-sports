import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function PricePill({
  price,
  delta,
  size = "md",
  showTimeframe = false,
}: {
  price: number;
  delta?: number;
  size?: "sm" | "md" | "lg";
  showTimeframe?: boolean;
}) {
  const cents = Math.round(price * 100);
  const deltaCents = Math.round((delta ?? 0) * 100);
  const up = deltaCents > 0;
  const down = deltaCents < 0;
  const signed = up ? `+${deltaCents}¢` : down ? `−${Math.abs(deltaCents)}¢` : "0¢";
  const aria =
    delta === undefined
      ? `${cents} cents`
      : `${cents} cents, ${up ? "up" : down ? "down" : "unchanged"} ${Math.abs(deltaCents)} cents in 24 hours`;
  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  } as const;
  return (
    <span
      aria-label={aria}
      className={`inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/10 font-mono tabular-nums text-foreground ${sizes[size]}`}
    >
      <span className="font-semibold">{cents}¢</span>
      {delta !== undefined && (
        <span
          title="24h change"
          className={`inline-flex items-center gap-0.5 text-[10px] ${up ? "text-[oklch(0.78_0.18_155)]" : down ? "text-[oklch(0.7_0.22_25)]" : "text-muted-foreground"}`}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : down ? <ArrowDownRight className="h-3 w-3" /> : null}
          {signed}
          {showTimeframe && <span className="text-muted-foreground"> · 24h</span>}
        </span>
      )}
    </span>
  );
}