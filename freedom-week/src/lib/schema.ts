import { z } from "zod";

/**
 * Single source of truth for FREEDOM WEEK's data shapes. Every value that
 * comes back out of localStorage is parsed through these schemas before the
 * app trusts it — a corrupt or hand-edited blob degrades to defaults instead
 * of crashing the app. TypeScript types below are inferred from the schemas
 * so the two can never drift apart.
 */

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const DayOfWeekSchema = z.enum(DAYS);
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;

export const CATEGORIES = [
  "Faith",
  "Work",
  "Body",
  "Mind",
  "Home",
  "Other",
] as const;
export const CategorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof CategorySchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(140),
  notes: z.string().max(2000).optional(),
  category: CategorySchema,
  required: z.boolean(),
  dueDay: DayOfWeekSchema,
  completed: z.boolean(),
  completedAt: z.number().optional(),
  order: z.number(),
});
export type Task = z.infer<typeof TaskSchema>;

export const WeekSchema = z.object({
  weekStartISO: z.string(),
  tasks: z.array(TaskSchema),
  finishedAt: z.number().optional(),
  allRequiredDone: z.boolean(),
});
export type Week = z.infer<typeof WeekSchema>;

/** A template repopulates into a fresh Task every Monday rollover. */
export const TaskTemplateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(140),
  notes: z.string().max(2000).optional(),
  category: CategorySchema,
  required: z.boolean(),
  dueDay: DayOfWeekSchema,
  order: z.number(),
  active: z.boolean(),
});
export type TaskTemplate = z.infer<typeof TaskTemplateSchema>;

export const ThemeIntensitySchema = z.enum(["subtle", "standard", "bold"]);
export type ThemeIntensity = z.infer<typeof ThemeIntensitySchema>;

export const SettingsSchema = z.object({
  notificationTimes: z.tuple([z.string(), z.string()]),
  notificationsEnabled: z.boolean(),
  dailyVerseNotification: z.boolean(),
  muted: z.boolean(),
  themeIntensity: ThemeIntensitySchema,
  idleReminderEnabled: z.boolean(),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const ContentKindSchema = z.enum(["scripture", "quote"]);
export type ContentKind = z.infer<typeof ContentKindSchema>;

/** User-authored scripture/quote entries, added from The Creed. */
export const CustomContentSchema = z.object({
  id: z.string(),
  kind: ContentKindSchema,
  text: z.string().min(1).max(600),
  attribution: z.string().max(120).optional(),
  buckets: z.array(z.string()),
  addedAt: z.number(),
});
export type CustomContent = z.infer<typeof CustomContentSchema>;

export const CURRENT_STATE_VERSION = 1;

export const PersistedStateSchema = z.object({
  version: z.literal(CURRENT_STATE_VERSION),
  currentWeek: WeekSchema,
  archive: z.array(WeekSchema),
  templates: z.array(TaskTemplateSchema),
  settings: SettingsSchema,
  favorites: z.array(z.string()),
  customContent: z.array(CustomContentSchema),
  streak: z.number(),
  bestStreak: z.number(),
});
export type PersistedState = z.infer<typeof PersistedStateSchema>;
