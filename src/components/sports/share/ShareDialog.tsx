import { useEffect, useState } from "react";
import { Check, Copy, Download, Link2, Share2, X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { canNativeShare, copyText, nativeShare, openTwitter } from "./channels";
import type { ShareChannel, ShareTarget } from "./share-targets";

interface ShareDialogProps {
  target: ShareTarget | null;
  onClose: () => void;
}

/** Single global share surface: Dialog on md+, BottomSheet on mobile. */
export function ShareDialog({ target, onClose }: ShareDialogProps) {
  const isMobile = useIsMobile();
  const open = !!target;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-2xl border-t-2 border-amber-400/40 bg-[#0a0a0a] p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Share</SheetTitle>
          <SheetDescription className="sr-only">
            Share this on OMENX
          </SheetDescription>
          {target && <ShareBody target={target} onClose={onClose} />}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex h-[min(94vh,820px)] w-[min(94vw,36rem)] max-w-none flex-col gap-0 overflow-hidden border-2 border-amber-400/40 bg-[#0a0a0a] p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Share</DialogTitle>
        <DialogDescription className="sr-only">
          Share this on OMENX
        </DialogDescription>
        {target && <ShareBody target={target} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function ShareBody({ target, onClose }: { target: ShareTarget; onClose: () => void }) {
  const isMobile = useIsMobile();
  const [copiedField, setCopiedField] = useState<"channel" | "url" | null>(null);
  const showNative = isMobile && canNativeShare();
  const showDownload = typeof target.onDownload === "function";

  // Reset copied flag on target change.
  useEffect(() => {
    setCopiedField(null);
  }, [target.url]);

  function notify(channel: ShareChannel) {
    target.onShared?.(channel);
  }

  async function handleCopy(source: "channel" | "url") {
    await copyText(target.url);
    setCopiedField(source);
    notify("copy");
    window.setTimeout(() => setCopiedField((cur) => (cur === source ? null : cur)), 1600);
  }

  function handleTwitter() {
    openTwitter(target.tweet, target.url);
    notify("twitter");
  }

  async function handleNative() {
    const ok = await nativeShare({ title: target.title, text: target.tweet, url: target.url });
    if (ok) notify("native");
  }

  async function handleDownload() {
    try {
      await target.onDownload?.();
      notify("download");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't download poster — please try again.");
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-800 px-5 pb-3 pt-4">
        <div className="min-w-0 flex-1 pr-3">
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
            SHARE · {target.kindLabel}
          </div>
          <h3 className="mt-1 truncate font-pitch text-sm font-bold text-white">
            {target.title}
          </h3>
          {target.subtitle && (
            <p className="mt-0.5 truncate font-pitch text-[11px] font-semibold text-zinc-500">
              {target.subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-7 w-7 place-items-center rounded-full text-zinc-500 ring-1 ring-zinc-800 hover:text-white hover:ring-zinc-600"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Poster preview */}
      {target.poster && (
        <div className="flex min-h-0 flex-1 items-center justify-center border-b border-zinc-800 bg-black/40 p-3">
          {/* Width clamped so the 4:5 poster fits above the channel and URL rows. */}
          <div className="w-[min(360px,calc((94vh-250px)*4/5.85))] max-w-full shrink-0">
            {target.poster}
          </div>
        </div>
      )}

      {/* Channel row */}
      <div className={cn("grid gap-2 px-4 py-4", showNative ? "grid-cols-4" : "grid-cols-3")}>
        <ChannelButton
          icon={copiedField === "channel" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          label={copiedField === "channel" ? "Copied" : "Copy link"}
          tone={copiedField === "channel" ? "success" : "default"}
          onClick={() => handleCopy("channel")}
        />
        <ChannelButton
          icon={<TwitterGlyph className="h-4 w-4" />}
          label="Post on X"
          onClick={handleTwitter}
        />
        {showNative && (
          <ChannelButton
            icon={<Share2 className="h-4 w-4" />}
            label="More…"
            onClick={handleNative}
          />
        )}
        {showDownload ? (
          <ChannelButton
            icon={<Download className="h-4 w-4" />}
            label="Poster"
            onClick={handleDownload}
          />
        ) : (
          <ChannelButton
            icon={<Download className="h-4 w-4" />}
            label="Poster"
            disabled
            hint="Poster download coming soon."
          />
        )}
      </div>

      {/* URL row */}
      <div className="flex items-stretch gap-2 border-t border-zinc-800 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center rounded-md border border-zinc-800 bg-black px-3 py-2">
          <span className="truncate font-mono text-[11px] text-zinc-400">{target.url}</span>
        </div>
        <button
          type="button"
          onClick={() => handleCopy("url")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 font-pitch text-[11px] font-bold uppercase tracking-widest transition",
            copiedField === "url"
              ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
              : "border-amber-400/60 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20",
          )}
        >
          {copiedField === "url" ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ChannelButton({
  icon,
  label,
  tone = "default",
  disabled,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "default" | "success";
  disabled?: boolean;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-lg border bg-zinc-950 px-2 py-3 transition",
        tone === "success"
          ? "border-emerald-500/60 text-emerald-400"
          : "border-zinc-800 text-zinc-200 hover:border-amber-400/60 hover:text-amber-400",
        disabled && "cursor-not-allowed opacity-40 hover:border-zinc-800 hover:text-zinc-500",
      )}
    >
      {icon}
      <span className="font-pitch text-[10px] font-bold uppercase tracking-widest">
        {label}
      </span>
    </button>
  );
}

function TwitterGlyph({ className }: { className?: string }) {
  // Simple "X" glyph (post-rebrand). Inline SVG to avoid pulling another icon set.
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.9l-5.4-7.05L4.5 22H1.24l8.05-9.2L1 2h7.06l4.88 6.45L18.244 2Zm-2.42 18h1.9L7.27 4H5.27l10.554 16Z" />
    </svg>
  );
}