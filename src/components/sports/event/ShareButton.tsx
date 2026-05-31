import { useCallback, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  /** Selected outcome id to embed in the share URL as `?outcome=…`. */
  outcomeId?: string;
  className?: string;
  label?: string;
}

/**
 * Copy-to-clipboard share button. Builds a deep link with the current
 * `?outcome=…` so opening the URL pre-selects the outcome the user was on.
 * Stays visible in the event header regardless of whether the page is live.
 */
export function ShareButton({ outcomeId, className, label = "Share" }: ShareButtonProps) {
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
          {label}
        </>
      )}
    </button>
  );
}