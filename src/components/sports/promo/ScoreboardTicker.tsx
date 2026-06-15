import { CARNIVAL_TICKER_LINES } from "@/data/world-cup-carnival";

/**
 * LED perimeter board — horizontally scrolling marquee with bullet-separated
 * lines. Reuses the carnival ticker keyframes defined in styles.css.
 */
export function ScoreboardTicker({ lines = CARNIVAL_TICKER_LINES }: { lines?: string[] }) {
  // Duplicate so the seamless scroll loops cleanly.
  const items = [...lines, ...lines];
  return (
    <div className="relative overflow-hidden rounded-md border border-zinc-900 bg-black">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-black to-transparent" />
      <div className="flex whitespace-nowrap py-2 animate-carnival-ticker">
        {items.map((line, i) => (
          <span
            key={i}
            className="mx-6 font-pitch text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400"
          >
            <span className="text-[oklch(0.7_0.18_145)]">{line.slice(0, 1)}</span>
            <span>{line.slice(1)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}