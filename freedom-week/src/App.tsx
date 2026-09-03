import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { NavShell } from "./components/NavShell";
import { StarField } from "./components/StarField";
import { useStore } from "./store/useStore";
import { Ascent } from "./pages/Ascent";
import { Campaign } from "./pages/Campaign";
import { Creed } from "./pages/Creed";
import { Legacy } from "./pages/Legacy";
import { SettingsPage } from "./pages/Settings";
import { IdleReminderToast } from "./components/IdleReminderToast";
import { useNotifications } from "./hooks/useNotifications";

function RolloverWatcher() {
  const checkRollover = useStore((s) => s.checkRollover);
  useEffect(() => {
    checkRollover();
    const id = setInterval(checkRollover, 5 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") checkRollover();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkRollover]);
  return null;
}

function ThemeIntensityWatcher() {
  const intensity = useStore((s) => s.settings.themeIntensity);
  useEffect(() => {
    document.documentElement.dataset.intensity = intensity;
  }, [intensity]);
  return null;
}

function App() {
  useNotifications();

  return (
    <HashRouter>
      <RolloverWatcher />
      <ThemeIntensityWatcher />
      <div className="fixed inset-0 -z-10 bg-navy">
        <StarField />
      </div>
      <IdleReminderToast />
      <Routes>
        <Route element={<NavShell />}>
          <Route path="/" element={<Ascent />} />
          <Route path="/week" element={<Campaign />} />
          <Route path="/creed" element={<Creed />} />
          <Route path="/legacy" element={<Legacy />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
