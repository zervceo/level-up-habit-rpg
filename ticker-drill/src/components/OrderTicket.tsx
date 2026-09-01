import { useStore } from '../state/store';
import type { OrderAction, OrderType, TIF } from '../types/domain';

const ACTION_LABEL: Record<OrderAction, string> = {
  BUY: 'BUY',
  SELL: 'SELL',
  SELL_SHORT: 'SELL SHORT',
  BUY_TO_COVER: 'BUY TO COVER',
};
const ACTION_COLOR: Record<OrderAction, string> = {
  BUY: 'var(--green)',
  SELL: 'var(--red)',
  SELL_SHORT: 'var(--amber)',
  BUY_TO_COVER: 'var(--blue)',
};
const TYPE_LABEL: Record<OrderType, string> = {
  MARKET: 'Market',
  LIMIT: 'Limit',
  STOP: 'Stop',
  STOP_LIMIT: 'Stop-Limit',
  TRAILING_STOP: 'Trailing Stop',
};

function Field({ label, value, active, hotkey }: { label: string; value: string; active: boolean; hotkey?: string }) {
  return (
    <div
      style={{
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 4,
        padding: '6px 8px',
        background: active ? '#1a1430' : 'var(--panel-alt)',
        flex: 1,
        minWidth: 90,
      }}
    >
      <div className="dim" style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        {hotkey && <span className="key">{hotkey}</span>}
      </div>
      <div className="mono-num" style={{ fontSize: 16 }}>
        {value || <span className="dim">&mdash;</span>}
      </div>
    </div>
  );
}

export function OrderTicket() {
  const ticket = useStore((s) => s.ticket);
  const quote = useStore((s) => s.quotes[s.ticket.symbol]);

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">Order Ticket</div>
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{ticket.symbol}</div>
          {quote && (
            <div className="mono-num">
              <span className="dim">bid</span> {quote.bid.toFixed(2)} <span className="dim">ask</span> {quote.ask.toFixed(2)}{' '}
              <span className="dim">last</span> {quote.last.toFixed(2)}
              {quote.halted && <span className="warn"> HALTED</span>}
            </div>
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            padding: '10px 0',
            borderRadius: 4,
            background: ticket.action ? ACTION_COLOR[ticket.action] : 'var(--panel-alt)',
            color: ticket.action ? '#0b0f14' : 'var(--text-dim)',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '0.05em',
          }}
        >
          {ticket.action ? ACTION_LABEL[ticket.action] : 'ARM AN ACTION (B / S / SS / BC)'}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Field label="Size" value={ticket.sizeInput} active={ticket.focusedField === 'SIZE'} hotkey="0-9" />
          {(ticket.orderType === 'LIMIT' || ticket.orderType === 'STOP_LIMIT') && (
            <Field label="Limit Px" value={ticket.limitInput} active={ticket.focusedField === 'LIMIT'} />
          )}
          {(ticket.orderType === 'STOP' || ticket.orderType === 'STOP_LIMIT') && (
            <Field label="Stop Px" value={ticket.stopInput} active={ticket.focusedField === 'STOP'} />
          )}
          {ticket.orderType === 'TRAILING_STOP' && (
            <Field label="Trail $" value={ticket.trailInput} active={ticket.focusedField === 'TRAIL'} />
          )}
        </div>
        <div className="dim" style={{ fontSize: 10 }}>
          <span className="key">Tab</span> cycle field &middot; type digits/decimal into the highlighted field
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(Object.keys(TYPE_LABEL) as OrderType[]).map((t) => (
            <span key={t} className="key" style={{ opacity: ticket.orderType === t ? 1 : 0.4 }}>
              {TYPE_LABEL[t]}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['DAY', 'GTC', 'IOC', 'FOK'] as TIF[]).map((t) => (
            <span key={t} className="key" style={{ opacity: ticket.tif === t ? 1 : 0.4 }}>
              {t}
            </span>
          ))}
          <span className="key" style={{ opacity: ticket.extendedHours ? 1 : 0.4 }}>
            EXT HRS
          </span>
        </div>

        {ticket.error && (
          <div className="down" style={{ fontSize: 12 }}>
            {ticket.error}
          </div>
        )}

        <button className="btn primary" onClick={() => useStore.getState().submitOrder()}>
          Send (Enter)
        </button>
      </div>
    </div>
  );
}

function HotkeyRow({ k, d }: { k: string; d: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span className="key">{k}</span>
      <span className="dim" style={{ fontSize: 11 }}>
        {d}
      </span>
    </div>
  );
}

export function HotkeyLegend() {
  return (
    <div className="panel">
      <div className="panel-title">Hotkeys</div>
      <div style={{ padding: '8px 10px' }}>
        <HotkeyRow k="B" d="Buy" />
        <HotkeyRow k="S" d="Sell" />
        <HotkeyRow k="SS" d="Sell Short (tap S twice)" />
        <HotkeyRow k="BC" d="Buy to Cover (B then C)" />
        <HotkeyRow k="0-9 ." d="Size / price digits" />
        <HotkeyRow k="Tab" d="Cycle field" />
        <HotkeyRow k="M / L / T / Y / R" d="Market / Limit / Stop / Stop-Limit / Trailing" />
        <HotkeyRow k="D / G / I / F" d="DAY / GTC / IOC / FOK" />
        <HotkeyRow k="E" d="Toggle extended hours" />
        <HotkeyRow k="↑↓ / J K" d="Change symbol" />
        <HotkeyRow k="Enter" d="Send order" />
        <HotkeyRow k="Esc" d="Reset ticket" />
      </div>
    </div>
  );
}
