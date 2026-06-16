/** Pure helpers for share channels — no React, easy to unit-test. */

export function copyText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallback(text));
  }
  return Promise.resolve(fallback(text));
}

function fallback(text: string): void {
  if (typeof document === "undefined") return;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    /* ignore */
  }
  document.body.removeChild(ta);
}

export function openTwitter(tweet: string, url: string): void {
  if (typeof window === "undefined") return;
  const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(url)}`;
  window.open(href, "_blank", "noopener,noreferrer");
}

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare(payload: { title: string; text: string; url: string }): Promise<boolean> {
  if (!canNativeShare()) return false;
  try {
    await navigator.share(payload);
    return true;
  } catch (e) {
    // User cancel → AbortError, swallow silently
    if ((e as DOMException)?.name === "AbortError") return false;
    console.warn("nativeShare failed", e);
    return false;
  }
}