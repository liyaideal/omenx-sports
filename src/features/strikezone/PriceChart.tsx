import { useMemo } from "react";

interface Props {
  history: number[]; // last 60s prices (0..100)
  current: number;
}

const WIDTH = 600;
const HEIGHT = 80;
const PAD_X = 4;
const PAD_Y = 6;

export function PriceChart({ history, current }: Props) {
  const { d, area } = useMemo(() => {
    if (history.length === 0) return { d: "", area: "" };
    const min = Math.min(...history, current) - 1;
    const max = Math.max(...history, current) + 1;
    const range = Math.max(max - min, 1);
    const stepX = (WIDTH - PAD_X * 2) / Math.max(1, history.length - 1);
    const pts = history.map((p, i) => {
      const x = PAD_X + i * stepX;
      const y = HEIGHT - PAD_Y - ((p - min) / range) * (HEIGHT - PAD_Y * 2);
      return [x, y] as const;
    });
    const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area =
      d +
      ` L${(PAD_X + (pts.length - 1) * stepX).toFixed(1)},${(HEIGHT - PAD_Y).toFixed(1)} L${PAD_X.toFixed(1)},${(HEIGHT - PAD_Y).toFixed(1)} Z`;
    return { d, area };
  }, [history, current]);

  return (
    <div className="relative h-[80px] w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="sz-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(52 211 153)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(52 211 153)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sz-area)" />
        <path d={d} fill="none" stroke="rgb(110 231 183)" strokeWidth="1.5" />
      </svg>
      <div className="absolute right-2 top-1 font-mono text-[10px] tabular-nums text-emerald-300/80">
        past 60s
      </div>
    </div>
  );
}