import { TradingLayout } from '../components/TradingLayout';
import { CsvReplayPanel } from '../components/CsvReplayPanel';

export function FreeTradeView() {
  return <TradingLayout title="Free Trade" leftExtra={<CsvReplayPanel />} />;
}
