import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface PriceChartProps {
  tone?: "yes" | "no";
  /** Optional pre-built series. If omitted, a deterministic mock is generated. */
  seed?: number;
  className?: string;
}

const RANGES = ["1H", "6H", "1D", "1W", "ALL"] as const;

function genSeries(seed: number, n = 60) {
  const out: { t: number; p: number }[] = [];
  let p = 35 + (seed % 30);
  for (let i = 0; i < n; i++) {
    const s = Math.sin((i + seed) * 0.37) * 3;
    const r = ((seed * (i + 7)) % 7) - 3;
    p = Math.max(5, Math.min(95, p + s * 0.4 + r * 0.6));
    out.push({ t: i, p: Number(p.toFixed(2)) });
  }
  return out;
}

export function PriceChart({ tone = "yes", seed = 7, className }: PriceChartProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1D");
  const data = useMemo(() => genSeries(seed + RANGES.indexOf(range)), [seed, range]);
  const color = tone === "yes" ? "var(--primary)" : "var(--neon)";
  const last = data[data.length - 1]?.p ?? 0;
  const first = data[0]?.p ?? 0;
  const delta = (last - first).toFixed(2);
  const positive = Number(delta) >= 0;

  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 shadow-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Price</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl tabular-nums" style={{ color }}>
              {Math.round(last)}¢
            </span>
            <span
              className={cn(
                "text-xs font-mono tabular-nums",
                positive ? "text-win" : "text-loss",
              )}
            >
              {positive ? "+" : ""}
              {delta}¢
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/5">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-mono transition-colors",
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${tone}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(v: number) => [`${v}¢`, "Price"]}
              labelFormatter={() => ""}
            />
            <Area
              type="monotone"
              dataKey="p"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${tone})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}