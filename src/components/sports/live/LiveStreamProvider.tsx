import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouterState } from "@tanstack/react-router";
import { ALL_MARKETS, getMarketById } from "@/data/sports-markets";
import { GlobalStreamMiniPlayer } from "./GlobalStreamMiniPlayer";
import { FullscreenStreamOverlay } from "./FullscreenStreamOverlay";

/**
 * Global live-stream session. Lifts the mini player out of the event
 * detail page so the stream keeps following the user across routes
 * (homepage, /events, /league/...) until they explicitly dismiss it or
 * start watching a different match.
 */
export interface LiveStreamActive {
  marketId: string;
  outcomeId?: string;
}

export type AudioTrack = "en" | "cn";

const AUDIO_STORAGE_KEY = "omenx.live.audio";

interface LiveStreamCtx {
  active: LiveStreamActive | null;
  startWatching: (marketId: string, outcomeId?: string) => void;
  stopWatching: () => void;
  setOutcome: (outcomeId: string) => void;
  /** True when the active stream should be shown as a floating mini
   *  player. Set to false while the user is on the event detail page and
   *  the in-page Stage is visible. */
  minimized: boolean;
  setMinimized: (v: boolean) => void;
  fullscreen: boolean;
  openFullscreen: () => void;
  closeFullscreen: () => void;
  /** Global broadcast audio language. Persisted to localStorage so the
   *  preference follows the user across sessions. */
  audioTrack: AudioTrack;
  setAudioTrack: (t: AudioTrack) => void;
}

const Ctx = createContext<LiveStreamCtx | null>(null);

export function LiveStreamProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<LiveStreamActive | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [audioTrack, setAudioTrackState] = useState<AudioTrack>("en");

  // Hydrate persisted preference on mount (client-only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(AUDIO_STORAGE_KEY);
    if (saved === "en" || saved === "cn") setAudioTrackState(saved);
  }, []);

  const setAudioTrack = useCallback((t: AudioTrack) => {
    setAudioTrackState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUDIO_STORAGE_KEY, t);
    }
    // TODO: when a real HLS/<video> source is wired up, switch the
    // player's audioTracks to the matching language here.
  }, []);

  // Per-session dismiss flag; reset whenever the active marketId changes.
  const [dismissed, setDismissed] = useState(false);
  const dismissedForRef = useRef<string | null>(null);

  const startWatching = useCallback((marketId: string, outcomeId?: string) => {
    setActive((prev) => {
      if (prev?.marketId === marketId) {
        return outcomeId ? { marketId, outcomeId } : prev;
      }
      return { marketId, outcomeId };
    });
    if (dismissedForRef.current !== marketId) {
      setDismissed(false);
      dismissedForRef.current = marketId;
    }
  }, []);

  const stopWatching = useCallback(() => {
    setActive(null);
    setMinimized(false);
    setFullscreen(false);
    setDismissed(false);
    dismissedForRef.current = null;
  }, []);

  const setOutcome = useCallback((outcomeId: string) => {
    setActive((a) => (a ? { ...a, outcomeId } : a));
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  // Auto-minimize when the user navigates away from the matching event
  // detail page. The event page itself drives minimized while on-page.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!active) return;
    const onEventPage = pathname === `/event/${active.marketId}`;
    if (!onEventPage) setMinimized(true);
  }, [pathname, active]);

  const openFullscreen = useCallback(() => setFullscreen(true), []);
  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  // Auto-surface a live stream on first load so users immediately see
  // what's on right now. Picks the first market flagged `isLiveStream`
  // and starts it minimized (mini player bottom-right). Skipped if the
  // user already dismissed something this session or is already watching.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (active || dismissed) return;
    const liveMarket = ALL_MARKETS.find((m) => m.isLiveStream);
    if (!liveMarket) return;
    autoStartedRef.current = true;
    setActive({ marketId: liveMarket.id });
    setMinimized(true);
  }, [active, dismissed]);

  const value = useMemo<LiveStreamCtx>(
    () => ({
      active,
      startWatching,
      stopWatching,
      setOutcome,
      minimized,
      setMinimized,
      fullscreen,
      openFullscreen,
      closeFullscreen,
      audioTrack,
      setAudioTrack,
    }),
    [
      active,
      startWatching,
      stopWatching,
      setOutcome,
      minimized,
      fullscreen,
      openFullscreen,
      closeFullscreen,
      audioTrack,
      setAudioTrack,
    ],
  );

  const market = active ? getMarketById(active.marketId) ?? null : null;
  const showMini =
    !!market && !!active && minimized && !fullscreen && !dismissed;

  return (
    <Ctx.Provider value={value}>
      {children}
      {showMini && market && active && (
        <GlobalStreamMiniPlayer
          market={market}
          outcomeId={active.outcomeId}
          onDismiss={dismiss}
          onFullscreen={openFullscreen}
          onSelectOutcome={setOutcome}
        />
      )}
      {fullscreen && market && active && (
        <FullscreenStreamOverlay
          market={market}
          outcomeId={active.outcomeId}
          onClose={closeFullscreen}
          onSelectOutcome={setOutcome}
        />
      )}
    </Ctx.Provider>
  );
}

export function useLiveStream(): LiveStreamCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      active: null,
      startWatching: () => {},
      stopWatching: () => {},
      setOutcome: () => {},
      minimized: false,
      setMinimized: () => {},
      fullscreen: false,
      openFullscreen: () => {},
      closeFullscreen: () => {},
      audioTrack: "en",
      setAudioTrack: () => {},
    };
  }
  return ctx;
}