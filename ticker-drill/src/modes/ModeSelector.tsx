import { useStore } from '../state/store';
import { SCENARIOS } from '../engine/scenarios';
import { QuizModal } from '../components/QuizModal';

export function ModeSelector() {
  const quizCards = useStore((s) => s.quizCards);
  const dueCount = Object.values(quizCards).filter((c) => c.dueAt <= Date.now()).length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 28, letterSpacing: '0.08em', marginBottom: 4 }}>TICKER DRILL</h1>
      <p className="dim" style={{ marginBottom: 28 }}>
        Local paper-trading trainer for order-entry speed and brokerage rules. No live market data — everything runs
        offline, with synthetic prices or your own imported CSV.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <ModeCard
          title="Free Trade"
          desc="Open-ended session on a simulated trading day. Full account, all order types, live GBM prices."
          onClick={() => useStore.getState().startFreeTrade()}
        />
        <ModeCard
          title="Speed Drill"
          desc="Timed order-entry prompts. Scores accuracy and time-to-submit, tracks your median, and heavily penalizes wrong-action errors."
          onClick={() => useStore.getState().startSpeedDrill()}
        />
        <ModeCard
          title="Study"
          desc={`Spaced-repetition quiz practice across all 8 topics.${dueCount > 0 ? ` ${dueCount} card(s) due.` : ''}`}
          onClick={() => useStore.getState().studyDue()}
        />
      </div>

      <h2 style={{ fontSize: 14, letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>
        Scenarios
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {SCENARIOS.map((s) => (
          <div key={s.id} className="panel" style={{ padding: 12, cursor: 'pointer' }} onClick={() => useStore.getState().startScenario(s.id)}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
            <div className="dim" style={{ fontSize: 12 }}>
              {s.description}
            </div>
          </div>
        ))}
      </div>

      <QuizModal />
    </div>
  );
}

function ModeCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <div className="panel" style={{ padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }} onClick={onClick}>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
      <div className="dim" style={{ fontSize: 12, lineHeight: 1.5 }}>
        {desc}
      </div>
    </div>
  );
}
