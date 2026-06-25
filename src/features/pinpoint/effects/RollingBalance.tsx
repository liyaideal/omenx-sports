import { useEffect, useRef, useState } from "react";

/** Formats matching AccountBlock — keep in sync. */
function format(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  return `$${Math.round(n).toLocaleString()}`;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Number that lerps from its previous value to `value` over ~280ms. */
export function RollingBalance({
  value,
  className,
  style,
  title,
}: {
  value: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  const [display, setDisplay] = useState<number>(value);
  const fromRef = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (display === value) return;
    const start = performance.now();
    const from = fromRef.current;
    const dur = 280;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = easeOutCubic(t);
      const cur = from + (value - from) * e;
      setDisplay(cur);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = value;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={className} style={style} title={title}>
      {format(display)}
    </span>
  );
}
