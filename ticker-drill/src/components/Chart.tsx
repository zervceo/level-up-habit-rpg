import { useStore } from '../state/store';

export function Chart() {
  const bars = useStore((s) => s.selectedBars);
  const symbol = useStore((s) => s.selectedSymbol);
  const width = 640;
  const height = 160;

  if (bars.length < 2) {
    return (
      <div className="panel" style={{ height: height + 30 }}>
        <div className="panel-title">{symbol}</div>
        <div className="dim" style={{ padding: 16 }}>
          Not enough bars yet…
        </div>
      </div>
    );
  }

  const lows = bars.map((b) => b.l);
  const highs = bars.map((b) => b.h);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = Math.max(0.01, max - min);
  const barW = width / bars.length;

  const y = (v: number) => height - ((v - min) / range) * height;

  return (
    <div className="panel">
      <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{symbol}</span>
        <span className="mono-num">
          {min.toFixed(2)} – {max.toFixed(2)}
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {bars.map((b, i) => {
          const x = i * barW + barW / 2;
          const up = b.c >= b.o;
          const color = up ? 'var(--green)' : 'var(--red)';
          return (
            <g key={b.t}>
              <line x1={x} x2={x} y1={y(b.h)} y2={y(b.l)} stroke={color} strokeWidth={1} />
              <line x1={x} x2={x} y1={y(b.o)} y2={y(b.c)} stroke={color} strokeWidth={Math.max(1.5, barW * 0.6)} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
