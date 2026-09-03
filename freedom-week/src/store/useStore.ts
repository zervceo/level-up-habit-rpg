import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { currentWeekStartISO } from "../lib/date";
import { buildDefaultState, buildEmptyWeek, tasksFromTemplates } from "../lib/defaults";
import {
  CURRENT_STATE_VERSION,
  PersistedStateSchema,
  type Category,
  type CustomContent,
  type DayOfWeek,
  type PersistedState,
  type Settings,
  type Task,
  type TaskTemplate,
} from "../lib/schema";

const MAX_ARCHIVE = 52;

function uid(): string {
  return crypto.randomUUID();
}

function recomputeWeekFlags(tasks: Task[]) {
  const required = tasks.filter((t) => t.required);
  const allRequiredDone = required.length > 0 && required.every((t) => t.completed);
  return allRequiredDone;
}

export interface FreedomWeekState extends PersistedState {
  /** Not persisted — whether the takeover sequence has played this session. */
  freedomAcknowledged: boolean;
  acknowledgeFreedom: () => void;

  checkRollover: () => void;

  addTask: (input: {
    title: string;
    notes?: string;
    category: Category;
    required: boolean;
    dueDay: DayOfWeek;
  }) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  rescheduleTask: (id: string, dueDay: DayOfWeek) => void;
  reorderDay: (day: DayOfWeek, orderedIds: string[]) => void;

  addTemplate: (input: {
    title: string;
    notes?: string;
    category: Category;
    required: boolean;
    dueDay: DayOfWeek;
  }) => void;
  updateTemplate: (id: string, patch: Partial<Omit<TaskTemplate, "id">>) => void;
  deleteTemplate: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;

  toggleFavorite: (key: string) => void;
  addCustomContent: (input: {
    kind: CustomContent["kind"];
    text: string;
    attribution?: string;
  }) => void;
  deleteCustomContent: (id: string) => void;

  exportJSON: () => string;
  importJSON: (json: string) => { ok: boolean; error?: string };
}

export const useStore = create<FreedomWeekState>()(
  persist(
    (set, get) => ({
      ...buildDefaultState(),
      freedomAcknowledged: false,
      acknowledgeFreedom: () => set({ freedomAcknowledged: true }),

      checkRollover: () => {
        const nowStart = currentWeekStartISO();
        const { currentWeek, templates, archive, streak, bestStreak } = get();
        if (currentWeek.weekStartISO === nowStart) return;

        const finishedWeek = {
          ...currentWeek,
          allRequiredDone: recomputeWeekFlags(currentWeek.tasks),
        };
        const nextStreak = finishedWeek.allRequiredDone ? streak + 1 : 0;
        const newArchive = [finishedWeek, ...archive].slice(0, MAX_ARCHIVE);

        const freshTasks = tasksFromTemplates(templates);
        set({
          archive: newArchive,
          streak: nextStreak,
          bestStreak: Math.max(bestStreak, nextStreak),
          currentWeek: buildEmptyWeek(nowStart, freshTasks),
          freedomAcknowledged: false,
        });
      },

      addTask: (input) =>
        set((s) => {
          const dayTasks = s.currentWeek.tasks.filter((t) => t.dueDay === input.dueDay);
          const task: Task = {
            id: uid(),
            title: input.title,
            notes: input.notes,
            category: input.category,
            required: input.required,
            dueDay: input.dueDay,
            completed: false,
            order: dayTasks.length,
          };
          const tasks = [...s.currentWeek.tasks, task];
          return {
            currentWeek: {
              ...s.currentWeek,
              tasks,
              allRequiredDone: recomputeWeekFlags(tasks),
            },
          };
        }),

      updateTask: (id, patch) =>
        set((s) => {
          const tasks = s.currentWeek.tasks.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          );
          return {
            currentWeek: {
              ...s.currentWeek,
              tasks,
              allRequiredDone: recomputeWeekFlags(tasks),
            },
          };
        }),

      deleteTask: (id) =>
        set((s) => {
          const tasks = s.currentWeek.tasks.filter((t) => t.id !== id);
          return {
            currentWeek: {
              ...s.currentWeek,
              tasks,
              allRequiredDone: recomputeWeekFlags(tasks),
            },
          };
        }),

      toggleTask: (id) =>
        set((s) => {
          const wasAllDone = s.currentWeek.allRequiredDone;
          const tasks = s.currentWeek.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? Date.now() : undefined,
                }
              : t,
          );
          const allRequiredDone = recomputeWeekFlags(tasks);
          const finishedAt =
            allRequiredDone && !wasAllDone
              ? Date.now()
              : allRequiredDone
                ? s.currentWeek.finishedAt
                : undefined;
          return {
            currentWeek: { ...s.currentWeek, tasks, allRequiredDone, finishedAt },
            freedomAcknowledged: allRequiredDone ? s.freedomAcknowledged : false,
          };
        }),

      rescheduleTask: (id, dueDay) =>
        set((s) => {
          const dayTasks = s.currentWeek.tasks.filter((t) => t.dueDay === dueDay);
          const tasks = s.currentWeek.tasks.map((t) =>
            t.id === id ? { ...t, dueDay, order: dayTasks.length } : t,
          );
          return { currentWeek: { ...s.currentWeek, tasks } };
        }),

      reorderDay: (day, orderedIds) =>
        set((s) => {
          const order = new Map(orderedIds.map((id, i) => [id, i]));
          const tasks = s.currentWeek.tasks.map((t) =>
            t.dueDay === day && order.has(t.id) ? { ...t, order: order.get(t.id)! } : t,
          );
          return { currentWeek: { ...s.currentWeek, tasks } };
        }),

      addTemplate: (input) =>
        set((s) => ({
          templates: [
            ...s.templates,
            {
              id: uid(),
              title: input.title,
              notes: input.notes,
              category: input.category,
              required: input.required,
              dueDay: input.dueDay,
              order: s.templates.length,
              active: true,
            },
          ],
        })),

      updateTemplate: (id, patch) =>
        set((s) => ({
          templates: s.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      toggleFavorite: (key) =>
        set((s) => ({
          favorites: s.favorites.includes(key)
            ? s.favorites.filter((k) => k !== key)
            : [...s.favorites, key],
        })),

      addCustomContent: (input) =>
        set((s) => ({
          customContent: [
            ...s.customContent,
            {
              id: uid(),
              kind: input.kind,
              text: input.text,
              attribution: input.attribution,
              buckets: ["general"],
              addedAt: Date.now(),
            },
          ],
        })),

      deleteCustomContent: (id) =>
        set((s) => ({ customContent: s.customContent.filter((c) => c.id !== id) })),

      exportJSON: () => {
        const s = get();
        const payload: PersistedState = {
          version: s.version,
          currentWeek: s.currentWeek,
          archive: s.archive,
          templates: s.templates,
          settings: s.settings,
          favorites: s.favorites,
          customContent: s.customContent,
          streak: s.streak,
          bestStreak: s.bestStreak,
        };
        return JSON.stringify(payload, null, 2);
      },

      importJSON: (json) => {
        try {
          const parsed = JSON.parse(json);
          const result = PersistedStateSchema.safeParse(parsed);
          if (!result.success) {
            return { ok: false, error: "That file doesn't match FREEDOM WEEK's data format." };
          }
          set(result.data);
          return { ok: true };
        } catch {
          return { ok: false, error: "Couldn't read that file as JSON." };
        }
      },
    }),
    {
      name: "freedom-week:state",
      version: CURRENT_STATE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        version: s.version,
        currentWeek: s.currentWeek,
        archive: s.archive,
        templates: s.templates,
        settings: s.settings,
        favorites: s.favorites,
        customContent: s.customContent,
        streak: s.streak,
        bestStreak: s.bestStreak,
      }),
      migrate: (persisted) => {
        // v0 -> v1 and any future migrations funnel through here. Unknown
        // or corrupt shapes fall back to a fresh default state rather than
        // crashing the app or silently wiping history without a trace.
        const candidate =
          persisted && typeof persisted === "object"
            ? { ...(persisted as object), version: CURRENT_STATE_VERSION }
            : persisted;
        const result = PersistedStateSchema.safeParse(candidate);
        if (result.success) return result.data;
        return buildDefaultState();
      },
      merge: (persisted, current) => {
        const result = PersistedStateSchema.safeParse(persisted);
        if (!result.success) return current;
        return { ...current, ...result.data };
      },
    },
  ),
);
