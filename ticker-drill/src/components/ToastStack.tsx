import { useStore } from '../state/store';

const COLOR: Record<string, string> = {
  INFO: 'var(--blue)',
  WARN: 'var(--amber)',
  ERROR: 'var(--red)',
  SUCCESS: 'var(--green)',
};

export function ToastStack() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div style={{ position: 'fixed', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 50, maxWidth: 360 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="panel"
          style={{ padding: '8px 10px', borderLeft: `3px solid ${COLOR[t.kind]}`, fontSize: 12 }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
