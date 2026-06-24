import { useEffect, useRef, useState } from "react";

/**
 * 1-second mock price ticker. Random walk around an initial price, clamped
 * to [1, 99]. Returns current price (¢, 0..100), a 60-tick history, and the
 * current tick second (epoch seconds floored).
 *
 * When the marketId/seedPrice changes, history resets.
 */
export function useLiveTicker(marketId: string, seedPrice: number) {
  const [price, setPrice] = useState(seedPrice);
  const [history, setHistory] = useState<number[]>(() => {
    // pre-fill 60 ticks of mild noise around seed so the chart isn't empty
    const out: number[] = [];
    let p = seedPrice;
    for (let i = 0; i < 60; i++) {
      p = clamp(p + (Math.random() - 0.5) * 0.6, 1, 99);
      out.push(p);
    }
    return out;
  });
  const [tickSec, setTickSec] = useState(() => Math.floor(Date.now() / 1000));
  const priceRef = useRef(seedPrice);
  priceRef.current = price;

  // Reset on market change
  useEffect(() => {
    setPrice(seedPrice);
    const out: number[] = [];
    let p = seedPrice;
    for (let i = 0; i < 60; i++) {
      p = clamp(p + (Math.random() - 0.5) * 0.6, 1, 99);
      out.push(p);
    }
    setHistory(out);
    setTickSec(Math.floor(Date.now() / 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const drift = (Math.random() - 0.5) * 1.6; // ±0.8¢
      const next = clamp(priceRef.current + drift, 1, 99);
      priceRef.current = next;
      setPrice(next);
      setHistory((h) => {
        const out = h.slice(1);
        out.push(next);
        return out;
      });
      setTickSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return { price, history, tickSec };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}