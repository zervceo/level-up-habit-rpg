import { useRef } from 'react';
import { useStore } from '../state/store';

export function CsvReplayPanel() {
  const csv = useStore((s) => s.csvReplay);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      useStore.getState().loadCsvFile(text, file.name);
      useStore.getState().pushToast(`Loaded ${file.name} for replay — select REPLAY in the watchlist.`, 'SUCCESS');
    } catch (err) {
      useStore.getState().pushToast(`CSV import failed: ${(err as Error).message}`, 'ERROR');
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">CSV Replay (real OHLCV, future bars hidden)</div>
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input ref={fileRef} type="file" accept=".csv" onChange={onFile} style={{ fontSize: 11 }} />
        {csv && (
          <>
            <div className="dim" style={{ fontSize: 11 }}>
              {csv.controller.visibleBars().length} / {csv.bars.length} bars revealed &middot; trade it as symbol{' '}
              <b>REPLAY</b>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="btn" onClick={() => useStore.getState().toggleCsvPlay()}>
                {csv.playing ? 'Pause' : 'Play'}
              </button>
              <button className="btn" onClick={() => useStore.getState().csvStep()}>
                Step
              </button>
              <label className="dim" style={{ fontSize: 11 }}>
                Speed
              </label>
              <input
                type="range"
                min={0.5}
                max={20}
                step={0.5}
                value={csv.speed}
                onChange={(e) => useStore.getState().setCsvSpeed(Number(e.target.value))}
              />
              <span className="mono-num" style={{ fontSize: 11 }}>
                {csv.speed}x
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
