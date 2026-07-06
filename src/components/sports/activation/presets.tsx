import { ActivationDialog, type ActivationDialogProps } from "./ActivationDialog";

type PresetShape = Pick<ActivationDialogProps, "open" | "onOpenChange">;

/**
 * RewardPoolLiveDialog — headline "3M Reward Pool Live" for cold users.
 * CTA calls `onRegister` (page wires this to the OmenX register modal).
 * On successful register, the calling page navigates to /promo/world-cup.
 */
export function RewardPoolLiveDialog({
  open,
  onOpenChange,
  onRegister,
}: PresetShape & { onRegister: () => void }) {
  return (
    <ActivationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="reward-pool"
      title="3M Reward Pool Live"
      subtitle="New users claim 10 – 560 U from the World Cup carnival pool."
      ctaLabel="Claim up to 560 U"
      onCta={onRegister}
    />
  );
}

/**
 * VoucherReadyDialog — "10U Voucher Is Here / Claim within 24 hours".
 * CTA sends the user to the OmenX vouchers page (external, top-level nav).
 */
export function VoucherReadyDialog({
  open,
  onOpenChange,
  onCta,
}: PresetShape & { onCta?: () => void }) {
  return (
    <ActivationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="voucher"
      title="10U Voucher Is Here"
      subtitle="Don't miss out — claim within 24 hours."
      ctaLabel="Claim now"
      onCta={
        onCta ??
        (() => {
          window.location.href = "https://omenx.lovable.app/vouchers";
        })
      }
    />
  );
}

/**
 * DepositMatchDialog — "Deposit 20U, Get 20U / 500 spots daily".
 * CTA calls `onDeposit` (page wires this to the OmenX deposit modal).
 * On successful first deposit, the calling page navigates to /promo/world-cup.
 */
export function DepositMatchDialog({
  open,
  onOpenChange,
  onDeposit,
}: PresetShape & { onDeposit: () => void }) {
  return (
    <ActivationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="deposit-match"
      title="Deposit 20U, Get 20U"
      subtitle="500 spots daily. First deposits only — grab it before it's gone."
      ctaLabel="Deposit & grab 20 U"
      onCta={onDeposit}
    />
  );
}