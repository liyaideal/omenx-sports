import { cn } from "@/lib/utils";
import { BET_SIZE_OPTIONS } from "./hooks/useStrikezoneSession";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function BetSizeBar({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        Bet size
      </span>
      {BET_SIZE_OPTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "rounded border px-2.5 py-1 font-mono text-xs tabular-nums transition-colors",
            value === s
              ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
          )}
        >
          ${s >= 1000 ? `${s / 1000}k` : s}
        </button>
      ))}
    </div>
  );
}