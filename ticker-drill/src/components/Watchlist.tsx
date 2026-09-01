import { useStore } from '../state/store';

export function Watchlist() {
  const watchlist = useStore((s) => s.watchlist);
  const quotes = useStore((s) => s.quotes);
  const selected = useStore((s) => s.selectedSymbol);

  return (
    <div className="panel">
      <div className="panel-title">Watchlist (↑↓ / J K)</div>
      <table>
        <thead>
          <tr>
            <th>Sym</th>
            <th>Last</th>
            <th>Bid</th>
            <th>Ask</th>
            <th>Sess</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map((sym) => {
            const q = quotes[sym];
            return (
              <tr
                key={sym}
                style={{ background: sym === selected ? '#1a1430' : undefined, cursor: 'pointer' }}
                onClick={() => {
                  const idx = watchlist.indexOf(sym);
                  const cur = watchlist.indexOf(selected);
                  useStore.getState().selectSymbolIndex(idx - cur);
                }}
              >
                <td style={{ fontWeight: sym === selected ? 700 : 400 }}>{sym}</td>
                <td className="mono-num">{q ? q.last.toFixed(2) : '—'}</td>
                <td className="mono-num dim">{q ? q.bid.toFixed(2) : '—'}</td>
                <td className="mono-num dim">{q ? q.ask.toFixed(2) : '—'}</td>
                <td style={{ fontSize: 10 }} className={q?.halted ? 'warn' : 'dim'}>
                  {q?.halted ? 'HALT' : q?.session ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
