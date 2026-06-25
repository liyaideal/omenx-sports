/**
 * Bettle-style glowing price capsule that floats next to the Y-axis at the
 * current price level. A short stem connects the capsule to a dot on the
 * axis. Smoothly transitions vertically as price ticks.
 */
interface Props {
  /** Current price in cents (0..100). */
  price: number;
  /** Y-axis range visible: [minPrice, maxPrice] (cents). */
  range: [number, number];
  /** Height of the chart area in px (must match Grid body height). */
  height: number;
}

export function PriceCapsule({ price, range, height }: Props) {
  const [min, max] = range;
  const clamped = Math.max(min, Math.min(max, price));
  const ratio = (max - clamped) / (max - min); // 0=top, 1=bottom
  const top = ratio * height;

  return (
    <div
      className="pointer-events-none absolute left-0 z-30 flex items-center"
      style={{
        top: `${top}px`,
        transform: "translateY(-50%)",
        transition: "top 900ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className="sz-pill sz-display flex items-center px-3 py-1.5 text-xl"
        style={{ color: "var(--sz-green)" }}
      >
        <span className="sz-glow-green">{price.toFixed(1)}¢</span>
      </div>
      {/* stem */}
      <div
        className="h-[2px]"
        style={{
          width: "18px",
          background:
            "linear-gradient(90deg, var(--sz-green) 0%, rgba(0,255,157,0.2) 100%)",
          boxShadow: "0 0 8px rgba(0,255,157,0.6)",
        }}
      />
      <div
        className="size-2.5 rounded-full"
        style={{
          background: "var(--sz-green)",
          boxShadow: "0 0 12px rgba(0,255,157,0.9)",
        }}
      />
    </div>
  );
}