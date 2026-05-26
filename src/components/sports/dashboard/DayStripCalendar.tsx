/**
 * DayStripCalendar — horizontal 7-day strip (past 3 / today / future 3).
 *
 * Rules:
 * - Today is the default selection (offset 0).
 * - Active day uses bg-neon with primary-foreground numerals and an 8px glow.
 * - Inactive days are quiet text-muted-foreground over the surface.
 * - Fixed 7-day window — no horizontal scroll, no week pagination (the
 *   feed in this template is mock data; broaden later).
 */
import { useMemo } from "react";

export interface DayStripCalendarProps {
  /** null = "All" (no day filter). */
  selectedOffset: number | null;
  onSelect: (offset: number | null) => void;
  /** Map of offset → count of events that day, used to render the dot indicator. */
  countsByOffset?: Record<number, number>;
}

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export function DayStripCalendar({
  selectedOffset,
  onSelect,
  countsByOffset = {},
}: DayStripCalendarProps) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const offset = i - 3; // -3..+3
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      return {
        offset,
        dow: DOW[d.getDay()],
        date: d.getDate(),
      };
    });
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-surface p-2">
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-pressed={selectedOffset === null}
          className={[
            "flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 transition",
            selectedOffset === null
              ? "bg-neon text-primary-foreground shadow-[0_0_8px_var(--primary)]"
              : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
          ].join(" ")}
        >
          <span
            className={[
              "font-mono text-[10px] uppercase tracking-wider",
              selectedOffset === null ? "text-primary-foreground/80" : "text-muted-foreground/80",
            ].join(" ")}
          >
            ALL
          </span>
          <span
            className={[
              "font-display text-lg font-semibold leading-none",
              selectedOffset === null ? "text-primary-foreground" : "text-foreground",
            ].join(" ")}
          >
            ★
          </span>
          <span aria-hidden className="mt-0.5 h-1 w-1 rounded-full bg-transparent" />
        </button>
        <div aria-hidden className="my-2 w-px self-stretch bg-border/60" />
        <div className="grid flex-1 grid-cols-7 gap-1">
        {days.map((d) => {
          const active = d.offset === selectedOffset;
          const count = countsByOffset[d.offset] ?? 0;
          return (
            <button
              key={d.offset}
              type="button"
              onClick={() => onSelect(d.offset)}
              className={[
                "group relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition",
                active
                  ? "bg-neon text-primary-foreground shadow-[0_0_8px_var(--primary)]"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              ].join(" ")}
              aria-pressed={active}
            >
              <span
                className={[
                  "font-mono text-[10px] uppercase tracking-wider",
                  active ? "text-primary-foreground/80" : "text-muted-foreground/80",
                ].join(" ")}
              >
                {d.dow}
              </span>
              <span
                className={[
                  "font-display text-lg font-semibold leading-none",
                  active ? "text-primary-foreground" : "text-foreground",
                ].join(" ")}
              >
                {d.date}
              </span>
              <span
                aria-hidden
                className={[
                  "mt-0.5 h-1 w-1 rounded-full",
                  count > 0
                    ? active
                      ? "bg-primary-foreground/80"
                      : "bg-neon shadow-[0_0_6px_var(--primary)]"
                    : "bg-transparent",
                ].join(" ")}
              />
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
