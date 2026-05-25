import { cn } from "@/lib/utils";

interface CountdownPillProps {
  /** Pre-formatted countdown e.g. "2d 14h 32m" — static display only. */
  value: string;
  tone?: "muted" | "live";
  className?: string;
}

export function CountdownPill({ value, tone = "muted", className }: CountdownPillProps) {
  const live = tone === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono tabular-nums ring-1",
        live
          ? "bg-neon/10 text-neon ring-neon/30"
          : "bg-white/[0.04] text-muted-foreground ring-white/5",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          live ? "bg-neon animate-pulse" : "bg-muted-foreground/60",
        )}
      />
      {value}
    </span>
  );
}