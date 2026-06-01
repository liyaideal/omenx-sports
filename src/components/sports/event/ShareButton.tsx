import { useCallback, useState } from "react";
import { ArrowUpRight, Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  /** Selected outcome id to embed in the share URL as `?outcome=…`. */
  outcomeId?: string;
  className?: string;
  label?: string;
  /** `icon` = compact pill (default). `wide` = full-width cinematic CTA. */
  variant?: "icon" | "wide";
}

/**
 * Copy-to-clipboard share button. Builds a deep link with the current
 * `?outcome=…` so opening the URL pre-selects the outcome the user was on.
 * Stays visible in the event header regardless of whether the page is live.
 */
export function ShareButton({
  outcomeId,
  className,
  label,
  variant = "icon",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (outcomeId) url.searchParams.set("outcome", outcomeId);
    else url.searchParams.delete("outcome");
    const href = url.toString();

    const onDone = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(href).then(onDone).catch(onDone);
    } else {
      const ta = document.createElement("textarea");
      ta.value = href;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
      onDone();
    }
  }, [outcomeId]);

  if (variant === "wide") {
    const wideLabel = label ?? "Share match snapshot";
    return (
      <button
        type="button"
        onClick={copy}
        className={cn(
          "group flex w-full items-center justify-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] py-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.06] active:scale-[0.98]",
          className,
        )}
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground transition-colors group-hover:text-foreground">
          {copied ? "Link copied" : wideLabel}
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-win" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          )}
        </span>
      </button>
    );
  }

  const iconLabel = label ?? "Share";
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-foreground ring-1 ring-white/10 transition hover:bg-white/[0.1]",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-win" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          {iconLabel}
        </>
      )}
    </button>
  );
}