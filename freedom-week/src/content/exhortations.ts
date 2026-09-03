/**
 * Exhortations — 25 original lines this app writes in its own voice: the
 * coach who expects more of you because he believes you can deliver it.
 * Demanding, never insulting; direct, never guilting you about your worth.
 * To add one: append `{ id, text, buckets }` using the same bucket meaning
 * as scriptures.ts and quotes.ts. `checkInLines` is a separate, shorter set
 * used only for the one-line acknowledgment right after a task is checked
 * off — keep those under ~8 words so they read instantly.
 */

export interface ExhortationEntry {
  id: string;
  text: string;
  buckets: Array<"earlyMorning" | "longNight" | "urgency" | "general">;
}

export const exhortations: ExhortationEntry[] = [
  {
    id: "e01",
    text: "You set the terms of this week on Sunday. Now go collect on them.",
    buckets: ["earlyMorning", "general"],
  },
  {
    id: "e02",
    text: "Nobody is coming to do this for you. Good — you didn't need them to.",
    buckets: ["general"],
  },
  {
    id: "e03",
    text: "The list doesn't care how you slept. Neither do the people counting on you.",
    buckets: ["earlyMorning"],
  },
  {
    id: "e04",
    text: "This hour is the one nobody else is awake to compete with you for.",
    buckets: ["earlyMorning"],
  },
  {
    id: "e05",
    text: "You are not behind. You are exactly where the work is. Get in it.",
    buckets: ["general"],
  },
  {
    id: "e06",
    text: "Late doesn't mean lost. It means the day still needs you to show up.",
    buckets: ["longNight"],
  },
  {
    id: "e07",
    text: "Finish this one. Then the next one. That's the whole method.",
    buckets: ["general"],
  },
  {
    id: "e08",
    text: "You've done harder nights than this one for less than what's on the line now.",
    buckets: ["longNight"],
  },
  {
    id: "e09",
    text: "The tired feeling is real. It is not a verdict. Keep moving.",
    buckets: ["longNight"],
  },
  {
    id: "e10",
    text: "Every task left is a decision you already made. Just carry it out.",
    buckets: ["general"],
  },
  {
    id: "e11",
    text: "It's overdue, not over. Pick it up and put it right.",
    buckets: ["urgency"],
  },
  {
    id: "e12",
    text: "The clock isn't your enemy tonight. Idle hands are. Move.",
    buckets: ["urgency"],
  },
  {
    id: "e13",
    text: "You don't need to feel ready. Readiness is what doing it produces.",
    buckets: ["general", "earlyMorning"],
  },
  {
    id: "e14",
    text: "This is the work the freedom is made of. There's no shortcut version.",
    buckets: ["general"],
  },
  {
    id: "e15",
    text: "You've broken bigger weeks than this one wide open. Same hands, same fight.",
    buckets: ["general", "longNight"],
  },
  {
    id: "e16",
    text: "Small and done beats big and imagined. Take the small one now.",
    buckets: ["urgency", "general"],
  },
  {
    id: "e17",
    text: "The sun isn't up yet and you already are. That's the whole edge.",
    buckets: ["earlyMorning"],
  },
  {
    id: "e18",
    text: "One more push before you stop tonight. Then rest is earned, not owed.",
    buckets: ["longNight"],
  },
  {
    id: "e19",
    text: "Discipline is quiet. It doesn't announce itself, it just finishes things.",
    buckets: ["general"],
  },
  {
    id: "e20",
    text: "You don't have to want to. You just have to start.",
    buckets: ["general", "earlyMorning"],
  },
  {
    id: "e21",
    text: "The version of you that finishes this week is built right now, in this minute.",
    buckets: ["general"],
  },
  {
    id: "e22",
    text: "Stacked up doesn't mean stuck. Take the top one off the pile.",
    buckets: ["urgency"],
  },
  {
    id: "e23",
    text: "You promised yourself this week. Keep the promise no one else heard.",
    buckets: ["general"],
  },
  {
    id: "e24",
    text: "Long night, short patience — good. Use it on the task, not on yourself.",
    buckets: ["longNight"],
  },
  {
    id: "e25",
    text: "Earned rest is coming. It's on the other side of what's still open.",
    buckets: ["longNight", "urgency"],
  },
];

/** Short one-line acknowledgments shown the instant a task is checked off. */
export const checkInLines: string[] = [
  "Good. Next.",
  "Logged. Keep moving.",
  "That one's closed. On to the next.",
  "Done. Don't admire it — advance.",
  "Counted. What's left won't check itself.",
  "Solid. The list is still waiting.",
  "Noted. Onward.",
  "That's one less standing between you and Friday.",
  "Handled. Same energy, next task.",
  "Marked. Keep the pace.",
];
