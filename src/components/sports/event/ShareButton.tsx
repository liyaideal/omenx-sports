import { ShareTrigger } from "@/components/sports/share/ShareTrigger";
import { shareCustom } from "@/components/sports/share/share-targets";

interface ShareButtonProps {
  /** Selected outcome id to embed in the share URL as `?outcome=…`. */
  outcomeId?: string;
  className?: string;
  label?: string;
  /** `icon` = compact pill (default). `wide` = full-width cinematic CTA. */
  variant?: "icon" | "wide";
}

/**
 * Legacy wrapper that funnels the per-event Share into the global ShareDialog.
 * Kept around so the dozens of existing `<ShareButton outcomeId={...} />`
 * call sites keep working. New code should import `ShareTrigger` directly.
 */
export function ShareButton({
  outcomeId,
  className,
  label,
  variant = "icon",
}: ShareButtonProps) {
  const target = buildEventTargetFromLocation(outcomeId);
  return (
    <ShareTrigger
      target={target}
      variant={variant}
      label={label ?? (variant === "wide" ? "Share match snapshot" : undefined)}
      className={className}
    />
  );
}

function buildEventTargetFromLocation(outcomeId?: string) {
  let pageTitle = "OmenX event";
  let url = "/";
  if (typeof window !== "undefined") {
    const u = new URL(window.location.href);
    if (outcomeId) u.searchParams.set("outcome", outcomeId);
    else u.searchParams.delete("outcome");
    url = u.toString();
    pageTitle = document?.title || pageTitle;
  }
  return shareCustom({
    kindLabel: "EVENT",
    title: pageTitle,
    url,
    tweet: `${pageTitle} — trade it on OMENX`,
  });
}