/**
 * Pure-CSS confetti / spark layer for the World Cup Carnival hub.
 * Renders 24 absolutely-positioned squares with randomized delay, color
 * and horizontal offset. Decorative only — `pointer-events-none`.
 *
 * Seeded by index so server + client render identical positions (no
 * hydration mismatch).
 */
const COLORS = [
  "oklch(0.7 0.18 145)",
  "#facc15",
  "#60a5fa",
  "#f87171",
  "#ffffff",
];

function pseudo(i: number, salt: number) {
  const x = Math.sin(i * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

export function ConfettiLayer({
  count = 28,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={"pointer-events-none absolute inset-0 overflow-hidden " + className}
    >
      {Array.from({ length: count }).map((_, i) => {
        const left = pseudo(i, 1) * 100;
        const delay = pseudo(i, 2) * 12;
        const duration = 6 + pseudo(i, 3) * 8;
        const color = COLORS[i % COLORS.length];
        const size = 4 + Math.floor(pseudo(i, 4) * 6);
        const rotate = Math.floor(pseudo(i, 5) * 360);
        return (
          <span
            key={i}
            className="animate-confetti-fall absolute block"
            style={{
              left: `${left}%`,
              top: `-${10 + pseudo(i, 6) * 20}%`,
              width: size,
              height: size * 1.4,
              backgroundColor: color,
              transform: `rotate(${rotate}deg)`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: 0.7,
            }}
          />
        );
      })}
    </div>
  );
}

/** Static star/twinkle field — small radiating dots. */
export function TwinkleField({
  count = 18,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={"pointer-events-none absolute inset-0 overflow-hidden " + className}
    >
      {Array.from({ length: count }).map((_, i) => {
        const left = pseudo(i, 11) * 100;
        const top = pseudo(i, 12) * 100;
        const delay = pseudo(i, 13) * 4;
        const size = 1 + Math.floor(pseudo(i, 14) * 2);
        const color = i % 3 === 0 ? "#facc15" : "oklch(0.85 0.2 145)";
        return (
          <span
            key={i}
            className="animate-carnival-twinkle absolute block rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              backgroundColor: color,
              boxShadow: `0 0 ${4 + size * 2}px ${color}`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}