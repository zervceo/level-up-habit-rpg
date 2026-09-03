import { useEffect } from "react";
import { useStore } from "../store/useStore";
import { currentBucket, pickScripture } from "../lib/motivation";

const FIRED_KEY = "freedom-week:notif-fired";

function alreadyFiredToday(slot: string): boolean {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Record<string, string>;
    const today = new Date().toDateString();
    return parsed[slot] === today;
  } catch {
    return false;
  }
}

function markFired(slot: string) {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    parsed[slot] = new Date().toDateString();
    localStorage.setItem(FIRED_KEY, JSON.stringify(parsed));
  } catch {
    // best-effort only
  }
}

/**
 * Fires the two configured daily browser notifications, and an optional
 * daily-verse notification, once permission has been explicitly granted via
 * the Settings page button. Never requests permission itself.
 */
export function useNotifications() {
  const settings = useStore((s) => s.settings);
  const tasks = useStore((s) => s.currentWeek.tasks);
  const favorites = useStore((s) => s.favorites);
  const customContent = useStore((s) => s.customContent);

  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const id = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      settings.notificationTimes.forEach((time, idx) => {
        const slot = `time-${idx}`;
        if (time === hhmm && !alreadyFiredToday(slot)) {
          const outstanding = tasks.filter((t) => !t.completed && t.required);
          markFired(slot);
          if (outstanding.length > 0) {
            new Notification("FREEDOM WEEK", {
              body: `${outstanding.length} standing between you and freedom. Start with "${outstanding[0].title}."`,
              icon: "/favicon.svg",
            });
          } else if (settings.dailyVerseNotification) {
            const s = pickScripture(currentBucket(false), new Set(favorites), customContent);
            new Notification("FREEDOM WEEK", {
              body: `${s.text} — ${s.reference}`,
              icon: "/favicon.svg",
            });
          }
        }
      });
    }, 30_000);

    return () => clearInterval(id);
  }, [settings, tasks, favorites, customContent]);
}
