import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function PricePill({
  price,
  delta,
  size = "md",
}: {
  price: number;
  delta?: number;
  size?: "sm" | "md" | "lg";
}) {
  const cents = Math.round(price * 100);
  const up = (delta ?? 0) > 0;
  const down = (delta ?? 0) < 0;
  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/10 font-mono tabular-nums text-foreground ${sizes[size]}`}>
      <span className="font-semibold">{cents}¢</span>
      {delta !== undefined && (
        <span className={`inline-flex items-center text-[10px] ${up ? "text-[oklch(0.78_0.18_155)]" : down ? "text-[oklch(0.7_0.22_25)]" : "text-muted-foreground"}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : down ? <ArrowDownRight className="h-3 w-3" /> : null}
          {delta !== 0 ? `${Math.abs(Math.round(delta * 100))}` : "0"}
        </span>
      )}
    </span>
  );
}