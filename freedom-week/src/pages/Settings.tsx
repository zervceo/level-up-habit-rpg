import { useRef, useState } from "react";
import { useStore } from "../store/useStore";
import { TaskForm, type TaskFormValue } from "../components/TaskForm";
import type { ThemeIntensity } from "../lib/schema";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="fw-hairline mb-3 pb-2 font-display text-sm uppercase tracking-widest text-parchment/70">
      {children}
    </h2>
  );
}

export function SettingsPage() {
  const tasks = useStore((s) => s.currentWeek.tasks);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const templates = useStore((s) => s.templates);
  const addTemplate = useStore((s) => s.addTemplate);
  const updateTemplate = useStore((s) => s.updateTemplate);
  const deleteTemplate = useStore((s) => s.deleteTemplate);

  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const exportJSON = useStore((s) => s.exportJSON);
  const importJSON = useStore((s) => s.importJSON);

  const [addingTask, setAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [addingTemplate, setAddingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === "granted") updateSettings({ notificationsEnabled: true });
  };

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freedom-week-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importJSON(String(reader.result));
      setImportMessage(result.ok ? "Import successful." : result.error ?? "Import failed.");
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-dvh px-5 pb-16 pt-8 md:px-10">
      <header className="mb-6">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">Settings</p>
      </header>

      {/* This week's tasks */}
      <section className="mx-auto mb-8 max-w-2xl">
        <SectionHeader>This week's tasks</SectionHeader>
        <div className="space-y-2">
          {tasks.map((t) =>
            editingTaskId === t.id ? (
              <TaskForm
                key={t.id}
                initial={t}
                submitLabel="Save"
                onCancel={() => setEditingTaskId(null)}
                onSubmit={(v: TaskFormValue) => {
                  updateTask(t.id, v);
                  setEditingTaskId(null);
                }}
              />
            ) : (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-parchment/10 bg-navy-light/30 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-parchment/85">{t.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-parchment/40">
                    {t.dueDay} · {t.category} · {t.required ? "Required" : "Bonus"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-xs uppercase tracking-wider">
                  <button
                    onClick={() => setEditingTaskId(t.id)}
                    className="fw-tap text-parchment/50 hover:text-gold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="fw-tap text-parchment/50 hover:text-crimson-glow"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ),
          )}
        </div>

        {addingTask ? (
          <div className="mt-3">
            <TaskForm
              submitLabel="Add task"
              onCancel={() => setAddingTask(false)}
              onSubmit={(v) => {
                addTask(v);
                setAddingTask(false);
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingTask(true)}
            className="fw-tap mt-3 w-full rounded-lg border border-dashed border-parchment/20 py-2.5 text-xs uppercase tracking-widest text-parchment/50 hover:border-gold/40 hover:text-gold"
          >
            + Add a one-off task
          </button>
        )}
      </section>

      {/* Recurring templates */}
      <section className="mx-auto mb-8 max-w-2xl">
        <SectionHeader>Recurring tasks</SectionHeader>
        <p className="mb-3 -mt-1 text-xs text-parchment/40">
          Set these up once — they repopulate automatically every Monday at 4:00 AM.
        </p>
        <div className="space-y-2">
          {templates.map((t) =>
            editingTemplateId === t.id ? (
              <TaskForm
                key={t.id}
                initial={t}
                submitLabel="Save"
                onCancel={() => setEditingTemplateId(null)}
                onSubmit={(v) => {
                  updateTemplate(t.id, v);
                  setEditingTemplateId(null);
                }}
              />
            ) : (
              <div
                key={t.id}
                className={[
                  "flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5",
                  t.active ? "border-parchment/10 bg-navy-light/30" : "border-parchment/5 bg-navy-light/10 opacity-50",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-parchment/85">{t.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-parchment/40">
                    {t.dueDay} · {t.category} · {t.required ? "Required" : "Bonus"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs uppercase tracking-wider">
                  <label className="fw-tap flex items-center gap-1.5 text-parchment/50">
                    <input
                      type="checkbox"
                      checked={t.active}
                      onChange={(e) => updateTemplate(t.id, { active: e.target.checked })}
                      className="h-4 w-4 accent-[color:var(--color-gold)]"
                    />
                    Active
                  </label>
                  <button
                    onClick={() => setEditingTemplateId(t.id)}
                    className="fw-tap text-parchment/50 hover:text-gold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="fw-tap text-parchment/50 hover:text-crimson-glow"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ),
          )}
        </div>

        {addingTemplate ? (
          <div className="mt-3">
            <TaskForm
              submitLabel="Add recurring task"
              onCancel={() => setAddingTemplate(false)}
              onSubmit={(v) => {
                addTemplate(v);
                setAddingTemplate(false);
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingTemplate(true)}
            className="fw-tap mt-3 w-full rounded-lg border border-dashed border-parchment/20 py-2.5 text-xs uppercase tracking-widest text-parchment/50 hover:border-gold/40 hover:text-gold"
          >
            + Add a recurring task
          </button>
        )}
      </section>

      {/* Notifications */}
      <section className="mx-auto mb-8 max-w-2xl">
        <SectionHeader>Reminders & notifications</SectionHeader>
        <div className="space-y-4 rounded-lg border border-parchment/10 bg-navy-light/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-parchment/80">Browser notifications</p>
              <p className="text-xs text-parchment/40">
                Status: {notifStatus === "unsupported" ? "not supported in this browser" : notifStatus}
              </p>
            </div>
            {notifStatus !== "granted" && notifStatus !== "unsupported" && (
              <button
                onClick={requestNotifications}
                className="fw-tap rounded-md border border-gold/50 px-3 py-2 text-xs uppercase tracking-wider text-gold hover:bg-gold/10"
              >
                Enable
              </button>
            )}
          </div>

          <label className="fw-tap flex items-center justify-between text-sm text-parchment/70">
            Send the two daily reminders
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              disabled={notifStatus !== "granted"}
              onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--color-gold)]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-parchment/50">
              Early
              <input
                type="time"
                value={settings.notificationTimes[0]}
                onChange={(e) =>
                  updateSettings({ notificationTimes: [e.target.value, settings.notificationTimes[1]] })
                }
                className="fw-tap mt-1 w-full rounded-md border border-parchment/15 bg-navy-deep/60 px-2 text-sm text-parchment"
              />
            </label>
            <label className="text-xs text-parchment/50">
              Night
              <input
                type="time"
                value={settings.notificationTimes[1]}
                onChange={(e) =>
                  updateSettings({ notificationTimes: [settings.notificationTimes[0], e.target.value] })
                }
                className="fw-tap mt-1 w-full rounded-md border border-parchment/15 bg-navy-deep/60 px-2 text-sm text-parchment"
              />
            </label>
          </div>

          <label className="fw-tap flex items-center justify-between text-sm text-parchment/70">
            Daily verse even when everything's done
            <input
              type="checkbox"
              checked={settings.dailyVerseNotification}
              onChange={(e) => updateSettings({ dailyVerseNotification: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--color-gold)]"
            />
          </label>

          <label className="fw-tap flex items-center justify-between text-sm text-parchment/70">
            Idle reminder toast (20 min)
            <input
              type="checkbox"
              checked={settings.idleReminderEnabled}
              onChange={(e) => updateSettings({ idleReminderEnabled: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--color-gold)]"
            />
          </label>

          <label className="fw-tap flex items-center justify-between text-sm text-parchment/70">
            Mute sound (fanfare)
            <input
              type="checkbox"
              checked={settings.muted}
              onChange={(e) => updateSettings({ muted: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--color-gold)]"
            />
          </label>
        </div>
      </section>

      {/* Theme intensity */}
      <section className="mx-auto mb-8 max-w-2xl">
        <SectionHeader>Theme intensity</SectionHeader>
        <div className="flex gap-2">
          {(["subtle", "standard", "bold"] as ThemeIntensity[]).map((level) => (
            <button
              key={level}
              onClick={() => updateSettings({ themeIntensity: level })}
              className={[
                "fw-tap flex-1 rounded-lg border py-2.5 text-xs uppercase tracking-widest",
                settings.themeIntensity === level
                  ? "border-gold text-gold"
                  : "border-parchment/15 text-parchment/50",
              ].join(" ")}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-parchment/40">
          Controls how strong the parchment grain, glow, and motion effects read.
        </p>
      </section>

      {/* Data */}
      <section className="mx-auto max-w-2xl">
        <SectionHeader>Your data</SectionHeader>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleExport}
            className="fw-tap flex-1 rounded-md border border-gold/50 py-2.5 font-display text-xs uppercase tracking-widest text-gold hover:bg-gold/10"
          >
            Export JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="fw-tap flex-1 rounded-md border border-parchment/20 py-2.5 font-display text-xs uppercase tracking-widest text-parchment/70 hover:border-parchment/40"
          >
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {importMessage && <p className="mt-2 text-xs text-parchment/50">{importMessage}</p>}
        <p className="mt-4 text-xs text-parchment/30">
          Everything lives only in this browser's local storage. Nothing is sent anywhere.
        </p>
      </section>
    </div>
  );
}
