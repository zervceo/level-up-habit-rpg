import { useStore } from '../state/store';
import { useQuizHotkeys } from '../hooks/useHotkeys';

const TOPIC_LABEL: Record<string, string> = {
  MARGIN_REG_T: 'Margin & Reg T',
  SHORT_SELLING: 'Short Selling',
  SETTLEMENT: 'Settlement',
  ORDER_TYPES: 'Order Types',
  ACCOUNT_TYPES: 'Account Types',
  PDT: 'Pattern Day Trader',
  CORPORATE_ACTIONS: 'Corporate Actions',
  TAX_TREATMENT: 'Tax Treatment',
};

export function QuizModal() {
  const interrupt = useStore((s) => s.quizInterrupt);
  useQuizHotkeys(!!interrupt);
  if (!interrupt) return null;
  const { question, answeredIndex, context } = interrupt;
  const answered = answeredIndex !== null;
  const correct = answered && answeredIndex === question.correctIndex;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div className="panel" style={{ width: 560, maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            Quiz Interrupt &middot; {TOPIC_LABEL[question.topic]}
          </span>
          <span className="dim">triggered by: {context}</span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>{question.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {question.choices.map((choice, i) => {
              let bg = 'var(--panel-alt)';
              let border = 'var(--border)';
              if (answered) {
                if (i === question.correctIndex) {
                  bg = '#123a24';
                  border = 'var(--green)';
                } else if (i === answeredIndex) {
                  bg = '#3a1414';
                  border = 'var(--red)';
                }
              }
              return (
                <button
                  key={i}
                  className="btn"
                  disabled={answered}
                  onClick={() => useStore.getState().answerQuiz(i)}
                  style={{ textAlign: 'left', background: bg, borderColor: border, display: 'flex', gap: 8 }}
                >
                  <span className="key">{i + 1}</span>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div style={{ marginTop: 14, padding: 10, background: 'var(--panel-alt)', borderRadius: 4 }}>
              <div className={correct ? 'up' : 'down'} style={{ fontWeight: 700, marginBottom: 6 }}>
                {correct ? 'Correct' : 'Incorrect'}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>{question.explanation}</div>
              <div className="dim" style={{ fontSize: 11 }}>
                Citation: {question.citation}
              </div>
              <button className="btn primary" style={{ marginTop: 10 }} onClick={() => useStore.getState().closeQuizInterrupt()}>
                Continue (Enter)
              </button>
            </div>
          )}
          {!answered && (
            <div className="dim" style={{ fontSize: 11, marginTop: 10 }}>
              Press 1-4 to answer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
