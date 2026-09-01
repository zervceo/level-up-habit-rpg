import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';

/** Drives the simulation clock/market/order engine forward every animation frame. */
export function useSimLoop(active: boolean) {
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    lastRef.current = null;

    const loop = (t: number) => {
      if (lastRef.current === null) lastRef.current = t;
      const delta = t - lastRef.current;
      lastRef.current = t;
      if (!useStore.getState().quizInterrupt) {
        useStore.getState().tick(Math.min(delta, 250));
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);
}
