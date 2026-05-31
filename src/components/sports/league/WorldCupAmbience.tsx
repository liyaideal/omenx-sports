/**
 * Tournament-only page atmosphere for the World Cup 2026 hub.
 * Renders `WorldCupBackdrop` — a fixed, page-wide decorative layer with
 * radial accent glows and floating confetti dots. `pointer-events-none`,
 * sits behind all content.
 *
 * Isolated in a single file so removing the World Cup atmosphere
 * post-tournament is a single delete.
 */

const ACCENT = "0.7 0.18 145"; // mirrors LEAGUES["world-cup-2026"].accent

export function WorldCupBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 8% 12%, oklch(${ACCENT} / 0.18), transparent 40%),
            radial-gradient(circle at 92% 88%, oklch(0.78 0.16 80 / 0.12), transparent 45%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(115deg, oklch(${ACCENT}) 0 40px, transparent 40px 96px)`,
        }}
      />
      {/* Confetti dots */}
      {[
        { l: "6%", t: "14%", c: "amber", s: 6 },
        { l: "18%", t: "62%", c: "accent", s: 5 },
        { l: "32%", t: "28%", c: "white", s: 4 },
        { l: "48%", t: "78%", c: "amber", s: 5 },
        { l: "64%", t: "18%", c: "accent", s: 6 },
        { l: "78%", t: "54%", c: "white", s: 4 },
        { l: "88%", t: "26%", c: "amber", s: 5 },
        { l: "94%", t: "72%", c: "accent", s: 6 },
      ].map((d, i) => {
        const bg =
          d.c === "amber"
            ? "rgba(252,211,77,0.55)"
            : d.c === "accent"
              ? `oklch(${ACCENT} / 0.6)`
              : "rgba(255,255,255,0.5)";
        return (
          <span
            key={i}
            className="absolute rounded-full motion-safe:animate-pulse"
            style={{
              left: d.l,
              top: d.t,
              width: d.s,
              height: d.s,
              background: bg,
              boxShadow: `0 0 ${d.s * 2}px ${bg}`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        );
      })}
    </div>
  );
}