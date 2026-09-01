import { useEffect } from 'react';
import { useStore } from './state/store';
import { ModeSelector } from './modes/ModeSelector';
import { FreeTradeView } from './modes/FreeTradeView';
import { SpeedDrillView } from './modes/SpeedDrillView';
import { ScenarioView } from './modes/ScenarioView';

function App() {
  const ready = useStore((s) => s.ready);
  const mode = useStore((s) => s.mode);

  useEffect(() => {
    void useStore.getState().init();
  }, []);

  if (!ready) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }} className="dim">
        Loading TICKER DRILL…
      </div>
    );
  }

  if (mode === 'FREE_TRADE') return <FreeTradeView />;
  if (mode === 'SPEED_DRILL') return <SpeedDrillView />;
  if (mode === 'SCENARIO') return <ScenarioView />;
  return <ModeSelector />;
}

export default App;
