import { useStore } from '../state/store';
import { TradingLayout } from '../components/TradingLayout';

export function SpeedDrillView() {
  const prompt = useStore((s) => s.speedDrill.prompt);
  const medianMs = useStore((s) => s.speedDrill.medianMs);
  const results = useStore((s) => s.speedDrill.results);
  const lastResult = useStore((s) => s.speedDrill.lastResult);

  const correctCount = results.filter((r) => r.correct).length;
  const wrongActionCount = results.filter((r) => r.wrongAction).length;

  return (
    <TradingLayout
      title="Speed Drill"
      banner={
        <div className="panel" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{prompt?.text ?? 'Loading prompt…'}</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <span className="dim">
                Median (correct): <span className="mono-num">{medianMs !== null ? `${(medianMs / 1000).toFixed(2)}s` : '—'}</span>
              </span>
              <span className="dim">
                Attempts: <span className="mono-num">{results.length}</span>
              </span>
              <span className="up">
                Correct: <span className="mono-num">{correctCount}</span>
              </span>
              <span className="down">
                Wrong action: <span className="mono-num">{wrongActionCount}</span>
              </span>
            </div>
          </div>
          {lastResult && (
            <div className={lastResult.correct ? 'up' : 'down'} style={{ marginTop: 6, fontSize: 12 }}>
              Last: {lastResult.correct ? 'correct' : lastResult.wrongAction ? 'WRONG ACTION' : 'parameters mismatched'} in{' '}
              {(lastResult.timeToSubmitMs / 1000).toFixed(2)}s — score {lastResult.score}
            </div>
          )}
        </div>
      }
    />
  );
}
