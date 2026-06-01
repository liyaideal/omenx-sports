import { cn } from "@/lib/utils";
import { useLiveStream, type AudioTrack } from "./LiveStreamProvider";

interface AudioTrackToggleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Two-option segmented pill (EN / CN) for switching the live broadcast
 * audio track. Reads/writes the global `audioTrack` on
 * `LiveStreamProvider` so the choice survives across the mini player,
 * fullscreen overlay, and event page stage.
 *
 * The actual HLS audio-track swap is wired up where a real `<video>` is
 * mounted; this control just owns the UI + persisted preference.
 */
export function AudioTrackToggle({ size = "md", className }: AudioTrackToggleProps) {
  const { audioTrack, setAudioTrack } = useLiveStream();

  const dims =
    size === "sm"
      ? "h-5 text-[9px] px-1.5 gap-0.5"
      : size === "lg"
        ? "h-9 text-[11px] px-2 gap-1"
        : "h-7 text-[10px] px-1.5 gap-0.5";
  const segDims =
    size === "sm" ? "px-1.5" : size === "lg" ? "px-3" : "px-2";

  return (
    <div
      role="group"
      aria-label="Audio language"
      className={cn(
        "inline-flex items-center rounded-full bg-black/55 ring-1 ring-white/15 backdrop-blur",
        dims,
        className,
      )}
    >
      {(["en", "cn"] as AudioTrack[]).map((track) => {
        const active = audioTrack === track;
        return (
          <button
            key={track}
            type="button"
            onClick={() => setAudioTrack(track)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-full items-center justify-center rounded-full font-mono font-semibold uppercase tracking-widest transition",
              segDims,
              active
                ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                : "text-white/60 hover:text-white",
            )}
          >
            {track.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}