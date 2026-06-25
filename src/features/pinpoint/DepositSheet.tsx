import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import {
  OMENX_WALLET_URL,
  debitWallet,
  useWalletBalance,
} from "./wallet-bridge";
import { sndClick, sndCoin } from "./sounds";

/**
 * Bottom sheet for moving cash from the OmenX main wallet into the Pinpoint
 * sub-account. Pinpoint is intentionally isolated — users pre-allocate a
 * "play budget" so a liquidation only ever wipes this pocket, never their
 * main holdings.
 *
 * Flow:
 *  1. Show main-wallet balance + Pinpoint balance side by side.
 *  2. Pick a preset or type a custom amount (capped at wallet balance).
 *  3. TRANSFER → `debitWallet(amount)` + `onDeposit(amount)` (Pinpoint credit).
 *  4. If wallet has < $1 → CTA flips to "GO TO OMENX WALLET" (external link
 *     to https://omenx.lovable.app/wallet for the full deposit pipeline).
 */

const PRESETS = [50, 200, 500, 1000] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  pinpointBalance: number;
  onDeposit: (amount: number) => void;
  /** Optional context shown at the top (e.g. liquidation summary). */
  intro?: React.ReactNode;
  /** Default amount preselected when the sheet opens. */
  defaultAmount?: number;
}

export function DepositSheet({
  open,
  onClose,
  pinpointBalance,
  onDeposit,
  intro,
  defaultAmount = 200,
}: Props) {
  const wallet = useWalletBalance();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [custom, setCustom] = useState<string>("");

  useEffect(() => {
    if (open) {
      const a = Math.min(defaultAmount, wallet);
      setAmount(a > 0 ? a : 0);
      setCustom("");
    }
  }, [open, defaultAmount, wallet]);

  const insufficient = wallet < 1;
  const finalAmount = useMemo(() => {
    const n = custom ? Number(custom) : amount;
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(Math.floor(n), wallet);
  }, [custom, amount, wallet]);

  if (!open) return null;

  const onConfirm = () => {
    if (finalAmount <= 0) return;
    const r = debitWallet(finalAmount);
    if (!r.ok) {
      toast.error(r.reason === "insufficient" ? "Wallet has insufficient funds" : "Invalid amount");
      return;
    }
    onDeposit(finalAmount);
    sndCoin();
    toast.success(`Transferred $${finalAmount.toFixed(0)} to Pinpoint`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pp-card w-full max-w-md p-5"
        style={{ borderColor: "var(--pp-yellow)" }}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="pp-stencil flex items-center gap-1.5 text-xs" style={{ color: "var(--pp-yellow)" }}>
            <Wallet className="size-3.5" />
            FUND PINPOINT
          </span>
          <button onClick={() => { sndClick(); onClose(); }} aria-label="Close">
            <X className="size-4" style={{ color: "var(--pp-mute)" }} />
          </button>
        </div>

        {intro ? <div className="mb-3">{intro}</div> : null}

        {/* From / To strip */}
        <div className="pp-lcd grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5">
          <div className="text-left">
            <div className="pp-stencil text-[9px]" style={{ color: "var(--pp-mute)" }}>OMENX WALLET</div>
            <div className="pp-num text-base" style={{ color: "var(--pp-yellow)" }}>
              ${wallet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <ArrowRight className="size-4" style={{ color: "var(--pp-green-2)" }} />
          <div className="text-right">
            <div className="pp-stencil text-[9px]" style={{ color: "var(--pp-mute)" }}>PINPOINT</div>
            <div className="pp-num text-base" style={{ color: "var(--pp-green)" }}>
              ${pinpointBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {insufficient ? (
          <>
            <p className="pp-stencil mt-4 text-[10px] leading-relaxed" style={{ color: "var(--pp-red)" }}>
              YOUR MAIN WALLET IS EMPTY. TOP IT UP IN THE OMENX WALLET TO FUND PINPOINT.
            </p>
            <a
              href={OMENX_WALLET_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => sndClick()}
              className="pp-btn pp-btn-mint mt-4 flex w-full items-center justify-center gap-2 py-3 text-[10px]"
            >
              GO TO OMENX WALLET
              <ExternalLink className="size-3" />
            </a>
          </>
        ) : (
          <>
            {/* Preset chips */}
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {PRESETS.map((p) => {
                const disabled = p > wallet;
                const active = !custom && amount === p;
                return (
                  <button
                    key={p}
                    onClick={() => { setCustom(""); setAmount(p); sndClick(); }}
                    disabled={disabled}
                    className={`pp-chip pp-stencil py-2.5 text-[11px] ${active ? "pp-chip-active" : ""}`}
                    style={{
                      color: active ? "var(--pp-yellow)" : "var(--pp-mute)",
                      opacity: disabled ? 0.35 : 1,
                    }}
                  >
                    ${p >= 1000 ? `${p / 1000}K` : p}
                  </button>
                );
              })}
            </div>

            {/* Custom input */}
            <div className="mt-3 flex items-center gap-2">
              <span className="pp-stencil text-[10px]" style={{ color: "var(--pp-mute)" }}>CUSTOM</span>
              <div
                className="flex flex-1 items-center gap-1 px-2 py-1.5"
                style={{ background: "#000", border: "1px solid var(--pp-card-border)", borderRadius: 4 }}
              >
                <span className="pp-num text-[12px]" style={{ color: "var(--pp-yellow)" }}>$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={wallet}
                  step={1}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="0"
                  className="pp-num w-full bg-transparent text-[13px] outline-none tabular-nums"
                  style={{ color: "var(--pp-yellow)" }}
                />
                <button
                  onClick={() => { setCustom(String(Math.floor(wallet))); sndClick(); }}
                  className="pp-stencil text-[9px]"
                  style={{ color: "var(--pp-green-2)" }}
                >
                  MAX
                </button>
              </div>
            </div>

            <p className="pp-stencil mt-3 text-[9px] leading-relaxed" style={{ color: "var(--pp-mute)" }}>
              YOUR PINPOINT BALANCE IS A SEPARATE PLAY POCKET — KEEP IT TOPPED UP FOR HOT STREAKS, MAIN WALLET STAYS UNTOUCHED.
            </p>

            <button
              onClick={onConfirm}
              disabled={finalAmount <= 0}
              className="pp-btn pp-btn-mint mt-4 w-full py-3 text-[11px]"
              style={{ opacity: finalAmount <= 0 ? 0.4 : 1, cursor: finalAmount <= 0 ? "not-allowed" : "pointer" }}
            >
              TRANSFER ${finalAmount.toLocaleString()} → PINPOINT
            </button>

            <a
              href={OMENX_WALLET_URL}
              target="_blank"
              rel="noreferrer"
              className="pp-stencil mt-3 inline-flex items-center gap-1 text-[9px]"
              style={{ color: "var(--pp-mute)" }}
            >
              MANAGE WALLET <ExternalLink className="size-3" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}