import type { ReactNode } from "react";
import type { SubmittedTicket } from "@/components/sports/promo/combo/useComboState";

/**
 * Discriminated union of everything on the site that can be shared.
 * Builder helpers (below) normalize each kind into the same target shape so
 * the global ShareDialog / ShareTrigger doesn't care where the target came from.
 */
export type ShareChannel = "copy" | "twitter" | "native" | "download";

export interface ShareTargetBase {
  /** Section label shown above the dialog title, e.g. "EVENT" / "COMBO TICKET". */
  kindLabel: string;
  /** Primary line — match question, combo headline, etc. */
  title: string;
  /** Secondary line under the title. */
  subtitle?: string;
  /** Absolute or root-relative URL the share buttons point at. */
  url: string;
  /** Pre-filled text for the X / Twitter intent. */
  tweet: string;
  /** Optional rich preview node rendered inside the dialog. */
  poster?: ReactNode;
  /**
   * When provided, the "Download poster" button is enabled and calls this.
   * Targets without artwork yet leave it undefined and the button is hidden.
   */
  onDownload?: () => void | Promise<void>;
  /** Optional analytics hook, fires whenever a channel is used. */
  onShared?: (channel: ShareChannel) => void;
}

/* ---------- Builders ---------- */

function absolute(path: string): string {
  if (typeof window === "undefined") return path;
  try {
    return new URL(path, window.location.origin).toString();
  } catch {
    return path;
  }
}

export interface ShareEventInput {
  id: string;
  title: string;
  subtitle?: string;
  outcomeId?: string;
  poster?: ReactNode;
}
export function shareEvent(input: ShareEventInput): ShareTargetBase {
  const params = input.outcomeId ? `?outcome=${encodeURIComponent(input.outcomeId)}` : "";
  const url = absolute(`/event/${input.id}${params}`);
  return {
    kindLabel: "EVENT",
    title: input.title,
    subtitle: input.subtitle,
    url,
    tweet: `${input.title} — trade it on OMENX`,
    poster: input.poster,
  };
}

export interface ShareLeagueInput {
  slug: string;
  title: string;
  subtitle?: string;
  poster?: ReactNode;
}
export function shareLeague(input: ShareLeagueInput): ShareTargetBase {
  return {
    kindLabel: "LEAGUE",
    title: input.title,
    subtitle: input.subtitle,
    url: absolute(`/league/${input.slug}`),
    tweet: `Following ${input.title} on OMENX`,
    poster: input.poster,
  };
}

export interface SharePlayerInput {
  id: string;
  title: string;
  subtitle?: string;
  poster?: ReactNode;
}
export function sharePlayer(input: SharePlayerInput): ShareTargetBase {
  return {
    kindLabel: "PLAYER",
    title: input.title,
    subtitle: input.subtitle,
    url: absolute(`/player/${input.id}`),
    tweet: `${input.title} props on OMENX`,
    poster: input.poster,
  };
}

export interface ShareComboInput {
  ticket: SubmittedTicket;
  poster?: ReactNode;
  onDownload?: () => void | Promise<void>;
}
export function shareCombo({ ticket, poster, onDownload }: ShareComboInput): ShareTargetBase {
  const headline =
    ticket.status === "SETTLED_WON"
      ? `4/4 correct — won ${ticket.grossPayoutU.toFixed(0)} U on a ${ticket.lockedActivityOdds.toFixed(2)}× combo`
      : `My ${ticket.lockedActivityOdds.toFixed(2)}× 4-leg combo`;
  return {
    kindLabel: "COMBO TICKET",
    title: headline,
    subtitle: ticket.legs.map((l) => l.teamLabel).join(" · "),
    url: absolute(`/promo/world-cup?tab=combo&ticket=${encodeURIComponent(ticket.ticketId)}`),
    tweet: `${headline} on OMENX — beat me ↘`,
    poster,
    onDownload,
  };
}

export interface ShareLuckyBoxInput {
  prizeId: string;
  title: string;
  subtitle?: string;
  poster?: ReactNode;
}
export function shareLuckyBox(input: ShareLuckyBoxInput): ShareTargetBase {
  return {
    kindLabel: "LUCKY BOX",
    title: input.title,
    subtitle: input.subtitle,
    url: absolute(`/promo/world-cup?tab=luckybox&prize=${encodeURIComponent(input.prizeId)}`),
    tweet: `Won "${input.title}" from the OMENX Lucky Box`,
    poster: input.poster,
  };
}

export interface SharePromoInput {
  slug: string;
  title: string;
  subtitle?: string;
  poster?: ReactNode;
}
export function sharePromo(input: SharePromoInput): ShareTargetBase {
  return {
    kindLabel: "PROMO",
    title: input.title,
    subtitle: input.subtitle,
    url: absolute(`/promo/${input.slug}`),
    tweet: `${input.title} — join on OMENX`,
    poster: input.poster,
  };
}

export interface ShareCustomInput {
  kindLabel?: string;
  title: string;
  subtitle?: string;
  url: string;
  tweet?: string;
  poster?: ReactNode;
  onDownload?: () => void | Promise<void>;
}
export function shareCustom(input: ShareCustomInput): ShareTargetBase {
  return {
    kindLabel: input.kindLabel ?? "SHARE",
    title: input.title,
    subtitle: input.subtitle,
    url: absolute(input.url),
    tweet: input.tweet ?? input.title,
    poster: input.poster,
    onDownload: input.onDownload,
  };
}

export type ShareTarget = ShareTargetBase;