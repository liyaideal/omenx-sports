import { useEffect, useRef, useState } from "react";
import { Maximize2, Pause, PictureInPicture2, Play, Volume2, VolumeX } from "lucide-react";
import type { SportsMarket, Outcome } from "@/data/sports-markets";
import { TeamName } from "@/components/sports/TeamName";
import { cn } from "@/lib/utils";
import { AudioTrackToggle } from "@/components/sports/live/AudioTrackToggle";

interface EventLiveStageProps {
  market: SportsMarket;
  selected: Outcome;
  /** Forwarded to the wrapper so the page can observe viewport visibility
   *  and decide when to show the floating mini player. */
  stageRef?: React.RefObject<HTMLDivElement | null>;
  /** Callback for the bottom-right Fullscreen button. */
  onFullscreen?: () => void;
  className?: string;
}

/**
 * 16:9 live broadcast stage used at the top of the event detail page when
 * the underlying market is being streamed (`market.isLiveStream`). Renders
 * the live poster as a faux video surface with broadcast-style scoreboard,
 * LIVE pill, match clock, and player controls. Real stream wiring is left
 * as a TODO — `streamSrc` will be added on `SportsMarket` later and the
 * `<video>` element below can swap from poster-only to `src={streamSrc}`.
 */
export function EventLiveStage({
  market,
  selected,
  stageRef,
  onFullscreen,
  className,
}: EventLiveStageProps) {
  const fixture = market.fixture;
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const internalRef = useRef<HTMLDivElement | null>(null);
  const ref = stageRef ?? internalRef;
  // Slow ambient ken-burns on the poster so the surface feels alive while
  // we don't have a real stream attached.
  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[color:var(--accent)]/40 bg-black shadow-card ring-1 ring-[color:var(--accent)]/20",
        className,
      )}
    >
      <div className="relative aspect-[16/9] w-full">
        {market.livePoster ? (
          <img
            src={market.livePoster}
            alt={fixture ? `${fixture.home.name} vs ${fixture.away.name} live` : market.title}
            className={cn(
              "h-full w-full object-cover transition-transform duration-[12000ms] ease-out",
              playing ? "scale-[1.04]" : "scale-100",
            )}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.08] to-transparent" />
        )}

        {/* vignette + bottom gradient so overlay chrome stays legible */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_55%,rgba(0,0,0,0.55))]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

        {/* faux scan-line shimmer while "playing" */}
        {playing && (
          <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20 [background:repeating-linear-gradient(0deg,transparent_0_2px,rgba(255,255,255,0.06)_2px_3px)]" />
        )}

        {/* Top-left LIVE pill */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--accent-foreground)]">
            <span className="relative grid h-1.5 w-1.5 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            LIVE
          </span>
          {market.stage && (
            <span className="rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/80 ring-1 ring-white/15 backdrop-blur">
              {market.stage}
            </span>
          )}
        </div>

        {/* Top-right clock */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <AudioTrackToggle size="md" />
          {market.liveClock && (
            <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] tabular-nums text-white ring-1 ring-white/20 backdrop-blur">
              {market.liveClock}
            </span>
          )}
        </div>

        {/* Center play / pause */}
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? "Pause stream" : "Play stream"}
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background/60 ring-1 ring-white/30 backdrop-blur-md transition hover:scale-105"
        >
          {playing ? (
            <Pause className="h-5 w-5 fill-foreground text-foreground" />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5 fill-foreground text-foreground" />
          )}
        </button>

        {/* Bottom-left broadcast scoreboard */}
        {fixture && market.liveScore && (
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-3 rounded-full bg-black/65 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur">
              <img src={fixture.home.logo} alt="" className="h-7 w-7 shrink-0 object-contain" />
              <TeamName
                short={fixture.home.short}
                full={fixture.home.name}
                className="font-mono text-[11px] uppercase tracking-widest text-white/80"
              />
              <span className="font-display text-xl font-semibold leading-none tabular-nums text-white">
                {market.liveScore.home}
              </span>
              <span className="text-white/50">–</span>
              <span className="font-display text-xl font-semibold leading-none tabular-nums text-white">
                {market.liveScore.away}
              </span>
              <TeamName
                short={fixture.away.short}
                full={fixture.away.name}
                className="font-mono text-[11px] uppercase tracking-widest text-white/80"
              />
              <img src={fixture.away.logo} alt="" className="h-7 w-7 shrink-0 object-contain" />
            </div>
          </div>
        )}

        {/* Bottom-right controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
          <ControlBtn label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((v) => !v)}>
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </ControlBtn>
          <ControlBtn label="Picture in picture" onClick={() => {}}>
            <PictureInPicture2 className="h-3.5 w-3.5" />
          </ControlBtn>
          <ControlBtn label="Fullscreen" onClick={() => onFullscreen?.()}>
            <Maximize2 className="h-3.5 w-3.5" />
          </ControlBtn>
        </div>
      </div>
    </div>
  );
}

function ControlBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-black/75"
    >
      {children}
    </button>
  );
}

/**
 * Hook: observe the EventLiveStage's wrapper element and return `true`
 * once at least `threshold` of it has scrolled out of view. Used by the
 * page to decide whether to show the floating `StreamMiniPlayer`.
 */
export function useStageOffscreen(
  ref: React.RefObject<HTMLDivElement | null>,
  threshold = 0.15,
) {
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setOffscreen(entry.intersectionRatio < threshold),
      { threshold: [0, threshold, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return offscreen;
}