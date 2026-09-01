import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';

const CHORD_WINDOW_MS = 400;

/**
 * Global keyboard control for the order ticket. Nothing in the app should
 * require a mouse — this hook is the single source of truth for every
 * hotkey. B/S chord into SS and BC within a short window; everything else
 * is a direct single-key mapping.
 */
export function useHotkeys(enabled: boolean) {
  const pendingRef = useRef<'B' | 'S' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const clearChord = () => {
      pendingRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const resolvePending = () => {
      if (pendingRef.current === 'B') useStore.getState().armAction('BUY');
      if (pendingRef.current === 'S') useStore.getState().armAction('SELL');
      clearChord();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (useStore.getState().quizInterrupt) return; // quiz modal owns the keyboard while open
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const key = e.key;
      const store = useStore.getState();

      // Chord resolution for BC / SS
      if (pendingRef.current === 'B' && key.toLowerCase() === 'c') {
        e.preventDefault();
        clearChord();
        store.armAction('BUY_TO_COVER');
        return;
      }
      if (pendingRef.current === 'S' && key.toLowerCase() === 's') {
        e.preventDefault();
        clearChord();
        store.armAction('SELL_SHORT');
        return;
      }

      if (key.toLowerCase() === 'b') {
        e.preventDefault();
        resolvePending();
        pendingRef.current = 'B';
        timerRef.current = setTimeout(resolvePending, CHORD_WINDOW_MS);
        return;
      }
      if (key.toLowerCase() === 's') {
        e.preventDefault();
        resolvePending();
        pendingRef.current = 'S';
        timerRef.current = setTimeout(resolvePending, CHORD_WINDOW_MS);
        return;
      }

      // Any other key resolves a pending chord immediately as its single-letter action first.
      if (pendingRef.current) resolvePending();

      if (/^[0-9]$/.test(key) || key === '.') {
        e.preventDefault();
        store.appendDigit(key);
        return;
      }
      switch (key) {
        case 'Backspace':
          e.preventDefault();
          store.backspaceDigit();
          break;
        case 'Tab':
          e.preventDefault();
          store.cycleFocus();
          break;
        case 'Enter':
          e.preventDefault();
          store.submitOrder();
          break;
        case 'Escape':
          e.preventDefault();
          store.resetTicket();
          break;
        case 'ArrowUp':
          e.preventDefault();
          store.selectSymbolIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          store.selectSymbolIndex(1);
          break;
        default: {
          const lower = key.toLowerCase();
          if (lower === 'm') store.setOrderType('MARKET');
          else if (lower === 'l') store.setOrderType('LIMIT');
          else if (lower === 't') store.setOrderType('STOP');
          else if (lower === 'y') store.setOrderType('STOP_LIMIT');
          else if (lower === 'r') store.setOrderType('TRAILING_STOP');
          else if (lower === 'd') store.setTif('DAY');
          else if (lower === 'g') store.setTif('GTC');
          else if (lower === 'i') store.setTif('IOC');
          else if (lower === 'f') store.setTif('FOK');
          else if (lower === 'e') store.toggleExtendedHours();
          else if (lower === 'j') store.selectSymbolIndex(1);
          else if (lower === 'k') store.selectSymbolIndex(-1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearChord();
    };
  }, [enabled]);
}

/** Keyboard control for the quiz interrupt modal: 1-4 select an answer, Enter/Esc dismiss after answering. */
export function useQuizHotkeys(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useStore.getState();
      const interrupt = store.quizInterrupt;
      if (!interrupt) return;
      if (interrupt.answeredIndex === null && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        store.answerQuiz(Number(e.key) - 1);
        return;
      }
      if (interrupt.answeredIndex !== null && (e.key === 'Enter' || e.key === 'Escape')) {
        e.preventDefault();
        store.closeQuizInterrupt();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);
}
