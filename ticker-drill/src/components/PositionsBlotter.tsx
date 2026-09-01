import { useStore } from '../state/store';

export function PositionsTable() {
  const positions = useStore((s) => s.positions);
  const quotes = useStore((s) => s.quotes);
  const rows = [...positions.values()];

  return (
    <div className="panel">
      <div className="panel-title">Positions</div>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Side</th>
            <th>Qty</th>
            <th>Avg Px</th>
            <th>Last</th>
            <th>Unrealized</th>
            <th>Buy-in</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="dim">
                No open positions
              </td>
            </tr>
          )}
          {rows.map((p) => {
            const last = quotes[p.symbol]?.last ?? p.avgPrice;
            const upl = p.side === 'LONG' ? (last - p.avgPrice) * p.qty : (p.avgPrice - last) * p.qty;
            return (
              <tr key={p.symbol}>
                <td>{p.symbol}</td>
                <td className={p.side === 'LONG' ? 'up' : 'down'}>{p.side}</td>
                <td className="mono-num">{p.qty}</td>
                <td className="mono-num">{p.avgPrice.toFixed(2)}</td>
                <td className="mono-num">{last.toFixed(2)}</td>
                <td className={`mono-num ${upl >= 0 ? 'up' : 'down'}`}>
                  {upl >= 0 ? '+' : ''}
                  {upl.toFixed(2)}
                </td>
                <td className="warn" style={{ fontSize: 11 }}>
                  {p.buyInDeadlineMs ? 'RECALLED' : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  WORKING: 'var(--blue)',
  PARTIALLY_FILLED: 'var(--amber)',
  FILLED: 'var(--green)',
  CANCELED: 'var(--text-dim)',
  REJECTED: 'var(--red)',
  EXPIRED: 'var(--text-dim)',
  PENDING: 'var(--text-dim)',
};

export function OrdersBlotter() {
  const orders = useStore((s) => s.orders);
  const cancelOrder = useStore((s) => s.cancelWorkingOrder);
  const sorted = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 40);

  return (
    <div className="panel">
      <div className="panel-title">Blotter</div>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Action</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Filled</th>
            <th>Px</th>
            <th>TIF</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={9} className="dim">
                No orders yet
              </td>
            </tr>
          )}
          {sorted.map((o) => (
            <tr key={o.id}>
              <td>{o.symbol}</td>
              <td>{o.action.replace('_', ' ')}</td>
              <td>{o.type}</td>
              <td className="mono-num">{o.qty}</td>
              <td className="mono-num">{o.filledQty}</td>
              <td className="mono-num">{o.limitPrice?.toFixed(2) ?? o.stopPrice?.toFixed(2) ?? '—'}</td>
              <td>{o.tif}</td>
              <td style={{ color: STATUS_COLOR[o.status] }}>{o.status.replace('_', ' ')}</td>
              <td>
                {(o.status === 'WORKING' || o.status === 'PARTIALLY_FILLED') && (
                  <button className="btn" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => cancelOrder(o.id)}>
                    cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
