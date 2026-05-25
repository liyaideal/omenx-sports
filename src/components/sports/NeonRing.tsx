import { cn } from "@/lib/utils";

interface NeonRingProps {
  size?: number;
  thickness?: number;
  className?: string;
  children?: React.ReactNode;
  /** Adds a dashed inner ring like the screenshot's number bubbles. */
  dashed?: boolean;
}

/**
 * Signature decorative element — a magenta neon halo.
 * Used behind player portraits, number bubbles, and emphasis points.
 */
export function NeonRing({ size = 220, thickness = 3, className, children, dashed }: NeonRingProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full bg-gradient-neon opacity-90 blur-[2px]"
        style={{
          padding: thickness,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="absolute inset-0 rounded-full shadow-glow" />
      {dashed && (
        <div
          className="absolute rounded-full border border-dashed border-white/20"
          style={{ inset: thickness * 4 }}
        />
      )}
      <div className="relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}