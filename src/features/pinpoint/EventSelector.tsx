import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";

interface Props {
  events: SportsMarket[];
  activeEventId: string;
  onPick: (id: string) => void;
  openCountByEvent: Record<string, number>;
}

/**
 * Top card of the per-bet stack. Closed state shows the active matchup +
 * live clock. Click to open a popover listing every live event with score
 * + time; clicking one switches the grid to that event.
 */
export function EventSelector({ events, activeEventId, onPick, openCountByEvent }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const active = events.find((m) => m.id === activeEventId) ?? events[0];

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setRect({ left: r.left, top: r.bottom + 4, width: r.width });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!active) return null;
  const home = active.fixture?.home;
  const away = active.fixture?.away;
  const score = active.liveScore;
  const activeOpen = openCountByEvent[active.id] ?? 0;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="pp-card flex w-full flex-col gap-1.5 p-3 text-left"
        title="Switch event"
      >
        {/* Row 1 — LIVE marker + clock + chevron */}
        <div className="flex w-full items-center gap-2">
          <span
            className="size-1.5 shrink-0 animate-pulse rounded-full"
            style={{ background: "var(--pp-red)", boxShadow: "1px 1px 0 #000" }}
          />
          <span className="pp-stencil text-[10px]" style={{ color: "var(--pp-red)" }}>
            LIVE
          </span>
          <span
            className="pp-stencil ml-auto text-[10px] tabular-nums"
            style={{ color: "var(--pp-mute)" }}
          >
            {active.liveClock ?? ""}
          </span>
          {activeOpen > 0 && (
            <span
              className="pp-stencil flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]"
              style={{ color: "#fff", background: "var(--pp-red)", boxShadow: "1px 1px 0 #000" }}
            >
              {activeOpen}
            </span>
          )}
          <ChevronDown
            className="size-3.5 shrink-0"
            style={{
              color: "var(--pp-mute)",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 160ms",
            }}
          />
        </div>
        {/* Row 2 — matchup + score */}
        <div className="flex w-full items-baseline gap-2">
          <span
            className="pp-stencil truncate text-[12px]"
            style={{ color: "var(--pp-yellow)" }}
          >
            {home?.short ?? "—"} <span style={{ color: "var(--pp-mute)" }}>vs</span>{" "}
            {away?.short ?? "—"}
          </span>
          {score && (
            <span
              className="pp-num ml-auto text-[12px] tabular-nums"
              style={{ color: "#fff" }}
            >
              {score.home}–{score.away}
            </span>
          )}
        </div>
      </button>

      {open && rect && typeof document !== "undefined" && createPortal(
        <div
          ref={popRef}
          className="pp-card flex max-h-[60vh] flex-col gap-1 overflow-y-auto p-1.5"
          style={{
            position: "fixed",
            left: rect.left,
            top: rect.top,
            width: rect.width,
            zIndex: 60,
            background: "#0e1a13",
            boxShadow: "3px 3px 0 #000, 0 0 0 1px #000, 0 6px 24px rgba(0,0,0,0.6)",
          }}
        >
          {events.map((m) => {
            const isActive = m.id === activeEventId;
            const h = m.fixture?.home;
            const a = m.fixture?.away;
            const s = m.liveScore;
            const c = openCountByEvent[m.id] ?? 0;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onPick(m.id);
                  setOpen(false);
                }}
                className={`pp-chip flex items-center gap-1.5 px-2 py-1.5 ${
                  isActive ? "pp-chip-active-yellow" : ""
                }`}
              >
                <span
                  className="pp-stencil text-[9px]"
                  style={{ color: isActive ? "var(--pp-yellow)" : "var(--pp-mute)" }}
                >
                  {h?.short ?? "—"}
                </span>
                {s && (
                  <span
                    className="pp-num text-[10px] tabular-nums"
                    style={{ color: isActive ? "#fff" : "#aaa" }}
                  >
                    {s.home}–{s.away}
                  </span>
                )}
                <span
                  className="pp-stencil text-[9px]"
                  style={{ color: isActive ? "var(--pp-yellow)" : "var(--pp-mute)" }}
                >
                  {a?.short ?? "—"}
                </span>
                <span
                  className="pp-stencil ml-auto text-[8px] tabular-nums"
                  style={{ color: "var(--pp-mute)" }}
                >
                  {m.liveClock ?? ""}
                </span>
                {c > 0 && (
                  <span
                    className="pp-stencil flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px]"
                    style={{
                      color: "#fff",
                      background: "var(--pp-red)",
                      boxShadow: "1px 1px 0 #000",
                    }}
                  >
                    {c}
                  </span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}