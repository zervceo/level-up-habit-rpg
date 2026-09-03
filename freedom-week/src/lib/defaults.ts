import { currentWeekStartISO } from "./date";
import {
  CURRENT_STATE_VERSION,
  type PersistedState,
  type Task,
  type TaskTemplate,
  type Week,
} from "./schema";

function uid(): string {
  return crypto.randomUUID();
}

/** The six placeholder templates seeded on first run — one per category. */
export function seedTemplates(): TaskTemplate[] {
  const rows: Array<Omit<TaskTemplate, "id">> = [
    {
      title: "Pray & read scripture",
      category: "Faith",
      required: true,
      dueDay: "Mon",
      order: 0,
      active: true,
    },
    {
      title: "Deep work block — 2 hours",
      category: "Work",
      required: true,
      dueDay: "Tue",
      order: 1,
      active: true,
    },
    {
      title: "Train — 45 minutes",
      category: "Body",
      required: true,
      dueDay: "Wed",
      order: 2,
      active: true,
    },
    {
      title: "Read 20 pages",
      category: "Mind",
      required: true,
      dueDay: "Thu",
      order: 3,
      active: true,
    },
    {
      title: "Family call or dinner",
      category: "Home",
      required: false,
      dueDay: "Fri",
      order: 4,
      active: true,
    },
    {
      title: "Sabbath prep & house reset",
      category: "Other",
      required: false,
      dueDay: "Sat",
      order: 5,
      active: true,
    },
  ];
  return rows.map((r) => ({ ...r, id: uid() }));
}

export function tasksFromTemplates(templates: TaskTemplate[]): Task[] {
  return templates
    .filter((t) => t.active)
    .map((t) => ({
      id: uid(),
      title: t.title,
      notes: t.notes,
      category: t.category,
      required: t.required,
      dueDay: t.dueDay,
      order: t.order,
      completed: false,
    }));
}

export function buildEmptyWeek(weekStartISO: string, tasks: Task[] = []): Week {
  return {
    weekStartISO,
    tasks,
    allRequiredDone: tasks.filter((t) => t.required).length === 0
      ? false
      : tasks.filter((t) => t.required).every((t) => t.completed),
  };
}

export function buildDefaultState(): PersistedState {
  const templates = seedTemplates();
  const weekStartISO = currentWeekStartISO();
  const tasks = tasksFromTemplates(templates);
  return {
    version: CURRENT_STATE_VERSION,
    currentWeek: buildEmptyWeek(weekStartISO, tasks),
    archive: [],
    templates,
    settings: {
      notificationTimes: ["05:30", "21:00"],
      notificationsEnabled: false,
      dailyVerseNotification: false,
      muted: false,
      themeIntensity: "standard",
      idleReminderEnabled: true,
    },
    favorites: [],
    customContent: [],
    streak: 0,
    bestStreak: 0,
  };
}
