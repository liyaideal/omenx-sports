import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "win" | "loss";
  icon?: LucideIcon;
  className?: string;
}

const TONE: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "text-foreground",
  win: "text-win",
  loss: "text-loss",
};

export function StatTile({ label, value, hint, tone = "default", icon: Icon, className }: StatTileProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-4 shadow-card", className)}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className={cn("mt-2 font-display font-bold text-2xl tabular-nums", TONE[tone])}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] font-mono text-muted-foreground">{hint}</div>}
    </div>
  );
}