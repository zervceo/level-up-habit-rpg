import type { ReactNode } from 'react';
import { useStore } from '../state/store';
import { useHotkeys } from '../hooks/useHotkeys';
import { useSimLoop } from '../hooks/useSimLoop';
import { OrderTicket, HotkeyLegend } from './OrderTicket';
import { AccountPanel } from './AccountPanel';
import { PositionsTable, OrdersBlotter } from './PositionsBlotter';
import { Watchlist } from './Watchlist';
import { QuizModal } from './QuizModal';
import { ToastStack } from './ToastStack';
import { Chart } from './Chart';

export function TradingLayout({
  title,
  banner,
  leftExtra,
  children,
}: {
  title: string;
  banner?: ReactNode;
  leftExtra?: ReactNode;
  children?: ReactNode;
}) {
  const quizOpen = !!useStore((s) => s.quizInterrupt);
  const simTimeLabel = useStore((s) => s.simTimeLabel);
  const simSession = useStore((s) => s.simSession);
  useHotkeys(!quizOpen);
  useSimLoop(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 12, gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.05em' }}>TICKER DRILL</div>
          <div className="dim">{title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono-num">{simTimeLabel}</span>
          <span className={simSession === 'REGULAR' ? 'up' : 'dim'} style={{ fontSize: 11 }}>
            {simSession}
          </span>
          <button className="btn" onClick={() => useStore.getState().endSession()}>
            Exit to menu
          </button>
        </div>
      </div>

      {banner}
      {children}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 300px 1fr', gap: 10, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflowY: 'auto' }}>
          <Watchlist />
          <HotkeyLegend />
          {leftExtra}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflowY: 'auto' }}>
          <OrderTicket />
          <AccountPanel />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflowY: 'auto' }}>
          <Chart />
          <PositionsTable />
          <OrdersBlotter />
        </div>
      </div>

      <QuizModal />
      <ToastStack />
    </div>
  );
}
