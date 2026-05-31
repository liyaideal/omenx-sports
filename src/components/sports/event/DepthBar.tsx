import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface DepthBarProps {
  /** Mark price for the YES side, in ¢ (1..99). */
  mark: number;
  /** Optional team labels for the two sides. */
  sideLabels?: { yes: string; no: string };
  className?: string;
}

/**
 * Compact alternative to the full OrderBook — shows YES/NO depth as a single
 * stacked bar plus best bid/ask + spread. Used inline above the chart so the
 * user gets a sense of liquidity without giving up vertical space to the
 * full 6×2 grid.
 */
export function DepthBar({ mark, sideLabels, className }: DepthBarProps) {
  // Deterministic mocked book depth around the mark.
  const { yesDepth, noDepth, bestYes, bestNo, spread } = useMemo(() => {
    const yes = Math.max(800, Math.min(9800, 2200 + (mark % 17) * 320));
    const no = Math.max(800, Math.min(9800, 2600 + ((100 - mark) % 13) * 280));
    const bYes = Math.max(1, Math.min(99, mark - 1));
    const bNo = Math.max(1, Math.min(99, 100 - mark - 1));
    const sp = Math.max(0, 100 - bYes - bNo);
    return { yesDepth: yes, noDepth: no, bestYes: bYes, bestNo: bNo, spread: sp };
  }, [mark]);

  const total = yesDepth + noDepth;
  const yesPct = (yesDepth / total) * 100;
  const yesLabel = sideLabels?.yes ?? "YES";
  const noLabel = sideLabels?.no ?? "NO";

  const [hover, setHover] = useState<"yes" | "no" | null>(null);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface px-3 py-2.5 shadow-card",
        className,
      )}
    >
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Depth</span>
          <span className="text-foreground/70">
            {yesLabel}{" "}
            <span className="text-primary tabular-nums">
              {bestYes}¢ · {yesDepth.toLocaleString()}
            </span>
          </span>
          <span className="text-foreground/70">
            {noLabel}{" "}
            <span className="text-neon tabular-nums">
              {bestNo}¢ · {noDepth.toLocaleString()}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>
            Spread <span className="text-foreground tabular-nums">{spread}¢</span>
          </span>
        </div>
      </div>
      <div
        className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.04] ring-1 ring-white/5"
        onMouseLeave={() => setHover(null)}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-opacity",
            hover === "no" ? "opacity-40" : "opacity-100",
          )}
          style={{
            width: `${yesPct}%`,
            background: "var(--primary)",
            boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--primary) 50%, transparent)",
          }}
          onMouseEnter={() => setHover("yes")}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 transition-opacity",
            hover === "yes" ? "opacity-40" : "opacity-100",
          )}
          style={{
            width: `${100 - yesPct}%`,
            background: "var(--neon)",
            boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--neon) 50%, transparent)",
          }}
          onMouseEnter={() => setHover("no")}
        />
      </div>
    </div>
  );
}