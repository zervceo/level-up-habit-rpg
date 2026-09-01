import { useStore } from '../state/store';
import { TradingLayout } from '../components/TradingLayout';

export function ScenarioView() {
  const scenario = useStore((s) => s.scenario);
  if (!scenario) return null;

  return (
    <TradingLayout
      title={`Scenario · ${scenario.def.name}`}
      banner={
        <div className="panel" style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{scenario.def.name}</div>
          <div className="dim" style={{ fontSize: 12, marginBottom: 4 }}>
            {scenario.def.description}
          </div>
          <div style={{ fontSize: 12 }}>
            <span className="dim">Objective: </span>
            {scenario.def.objective}
          </div>
        </div>
      }
    />
  );
}
