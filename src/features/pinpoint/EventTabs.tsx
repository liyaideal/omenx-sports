import type { SportsMarket } from "@/data/sports-markets";

interface Props {
  events: SportsMarket[];
  activeEventId: string;
  onPick: (id: string) => void;
  openCountByEvent: Record<string, number>;
}

export function EventTabs({ events, activeEventId, onPick, openCountByEvent }: Props) {
  if (events.length === 0) return null;
  return (
    <div className="relative z-10 flex items-center gap-3 overflow-x-auto px-4 pb-2">
      <div className="flex shrink-0 items-center gap-2">
        <span
          className="size-2 animate-pulse rounded-full"
          style={{ background: "var(--pp-red)", boxShadow: "2px 2px 0 #000" }}
        />
        <span
          className="pp-stencil text-[10px]"
          style={{ color: "var(--pp-red)" }}
        >
          LIVE
        </span>
      </div>
      <div className="flex items-center gap-2">
        {events.map((m) => {
          const isActive = m.id === activeEventId;
          const home = m.fixture?.home;
          const away = m.fixture?.away;
          const score = m.liveScore;
          const openCount = openCountByEvent[m.id] ?? 0;
          return (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              className={`pp-chip relative flex shrink-0 items-center gap-2.5 px-3 py-2 ${
                isActive ? "pp-chip-active-yellow" : ""
              }`}
            >
              <span
                className="pp-stencil text-[10px]"
                style={{ color: isActive ? "var(--pp-yellow)" : "var(--pp-mute)" }}
              >
                {home?.short ?? "—"}
              </span>
              {score && (
                <span
                  className="pp-num text-[12px] tabular-nums"
                  style={{ color: isActive ? "#fff" : "#aaa" }}
                >
                  {score.home}–{score.away}
                </span>
              )}
              <span
                className="pp-stencil text-[10px]"
                style={{ color: isActive ? "var(--pp-yellow)" : "var(--pp-mute)" }}
              >
                {away?.short ?? "—"}
              </span>
              {m.liveClock && (
                <span
                  className="pp-stencil text-[8px]"
                  style={{ color: "var(--pp-mute)" }}
                >
                  · {m.liveClock}
                </span>
              )}
              {openCount > 0 && (
                <span
                  className="pp-stencil absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px]"
                  style={{
                    color: "#fff",
                    background: "var(--pp-red)",
                    boxShadow: "2px 2px 0 #000",
                  }}
                >
                  {openCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}