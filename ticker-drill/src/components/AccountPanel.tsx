import { useStore } from '../state/store';
import { computeBuyingPower, computeEquity } from '../engine/accountEngine';
import { settledCash } from '../engine/settlement';

export function AccountPanel() {
  const account = useStore((s) => s.account);
  const positions = useStore((s) => s.positions);
  const quotes = useStore((s) => s.quotes);
  const priceOf = (symbol: string) => quotes[symbol]?.last ?? 0;

  const bp = computeBuyingPower(account, positions, priceOf);
  const equity = computeEquity(account.cash, positions, priceOf);
  const settled = settledCash(account);

  return (
    <div className="panel">
      <div className="panel-title">Account</div>
      <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 4, fontSize: 12 }}>
        <span className="dim">Cash</span>
        <span className="mono-num">${account.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span className="dim">Settled Cash</span>
        <span className="mono-num">${settled.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span className="dim">Equity</span>
        <span className="mono-num">${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span className="dim">Long Buying Power</span>
        <span className="mono-num up">${bp.long.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span className="dim">Short Buying Power</span>
        <span className="mono-num up">${bp.short.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span className="dim">Maintenance Req.</span>
        <span className="mono-num">${bp.maintenanceRequirement.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span className="dim">Realized P&amp;L</span>
        <span className={`mono-num ${account.realizedPnL >= 0 ? 'up' : 'down'}`}>
          {account.realizedPnL >= 0 ? '+' : ''}
          ${account.realizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
        <span className="dim">Fees Paid (SEC+TAF)</span>
        <span className="mono-num">${account.totalFeesPaid.toFixed(2)}</span>
        <span className="dim">Borrow Fees Paid</span>
        <span className="mono-num">${account.totalBorrowFeesPaid.toFixed(2)}</span>
        <span className="dim">Dividends Owed (short)</span>
        <span className="mono-num">${account.totalDividendsOwed.toFixed(2)}</span>
        <span className="dim">PDT Status</span>
        <span className={account.isPDT ? 'warn' : 'dim'}>{account.isPDT ? 'FLAGGED' : 'Not flagged'}</span>
      </div>

      {account.marginCall.active && (
        <div style={{ margin: 10, padding: 8, background: '#3a1414', border: '1px solid var(--red)', borderRadius: 4 }}>
          <div className="down" style={{ fontWeight: 700 }}>
            MARGIN CALL — ${account.marginCall.amountRequired.toFixed(2)} required
          </div>
          {account.marginCall.deadline && <CountdownLabel deadline={account.marginCall.deadline} />}
        </div>
      )}

      {account.gfvs.length > 0 && (
        <div style={{ margin: '0 10px 10px', fontSize: 11 }}>
          <div className="warn" style={{ fontWeight: 700 }}>
            {account.gfvs.filter((g) => g.severity === 'FREE_RIDE').length > 0 ? 'Free-riding logged' : 'Good-faith violations'}: {account.gfvs.length}
          </div>
        </div>
      )}
    </div>
  );
}

function CountdownLabel({ deadline }: { deadline: number }) {
  const simNowMs = useStore((s) => s.simNowMs);
  const remainingMs = Math.max(0, deadline - simNowMs);
  const totalMin = Math.floor(remainingMs / 60000);
  const days = Math.floor(totalMin / (24 * 60));
  const hours = Math.floor((totalMin % (24 * 60)) / 60);
  const mins = totalMin % 60;
  return (
    <div className="dim" style={{ fontSize: 11 }}>
      Forced liquidation in {days > 0 ? `${days}d ` : ''}
      {hours}h {mins}m of sim time if uncured
    </div>
  );
}
