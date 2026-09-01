import initSqlJs, { type Database } from 'sql.js';
import { idbGet, idbSet } from './idb';
import type { QuizAttempt, QuizCardState, SpeedDrillResult } from '../types/domain';

const IDB_KEY = 'ticker-drill.sqlite';

let dbPromise: Promise<Database> | null = null;

async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await initSqlJs({ locateFile: (f) => `/${f}` });
      const existing = await idbGet(IDB_KEY);
      const db = existing ? new SQL.Database(existing) : new SQL.Database();
      migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

function migrate(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quiz_cards (
      question_id TEXT PRIMARY KEY,
      repetition INTEGER NOT NULL,
      ease_factor REAL NOT NULL,
      interval_days REAL NOT NULL,
      due_at INTEGER NOT NULL,
      last_result TEXT,
      last_reviewed_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      correct INTEGER NOT NULL,
      answered_at INTEGER NOT NULL,
      triggered_by TEXT NOT NULL,
      trigger_context TEXT
    );
    CREATE TABLE IF NOT EXISTS speed_drill_results (
      id TEXT PRIMARY KEY,
      prompt_id TEXT NOT NULL,
      correct INTEGER NOT NULL,
      wrong_action INTEGER NOT NULL,
      time_to_submit_ms INTEGER NOT NULL,
      score REAL NOT NULL,
      answered_at INTEGER NOT NULL
    );
  `);
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
export async function persistNow(): Promise<void> {
  const db = await getDb();
  const bytes = db.export();
  await idbSet(IDB_KEY, bytes);
}

export function persistDebounced(delayMs = 800) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void persistNow();
  }, delayMs);
}

// ---------- app_state blob (account/positions/orders/settings) ----------

export async function loadAppStateBlob(): Promise<string | null> {
  const db = await getDb();
  const res = db.exec('SELECT json FROM app_state WHERE id = 1');
  if (res.length === 0 || res[0].values.length === 0) return null;
  return res[0].values[0][0] as string;
}

export async function saveAppStateBlob(json: string): Promise<void> {
  const db = await getDb();
  db.run('INSERT INTO app_state (id, json, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at', [
    json,
    Date.now(),
  ]);
  persistDebounced();
}

// ---------- quiz spaced repetition ----------

export async function loadQuizCards(): Promise<QuizCardState[]> {
  const db = await getDb();
  const res = db.exec('SELECT question_id, repetition, ease_factor, interval_days, due_at, last_result, last_reviewed_at FROM quiz_cards');
  if (res.length === 0) return [];
  return res[0].values.map((row) => ({
    questionId: row[0] as string,
    repetition: row[1] as number,
    easeFactor: row[2] as number,
    intervalDays: row[3] as number,
    dueAt: row[4] as number,
    lastResult: (row[5] as string | null) as QuizCardState['lastResult'],
    lastReviewedAt: row[6] as number | null,
  }));
}

export async function upsertQuizCard(card: QuizCardState): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO quiz_cards (question_id, repetition, ease_factor, interval_days, due_at, last_result, last_reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(question_id) DO UPDATE SET
       repetition = excluded.repetition,
       ease_factor = excluded.ease_factor,
       interval_days = excluded.interval_days,
       due_at = excluded.due_at,
       last_result = excluded.last_result,
       last_reviewed_at = excluded.last_reviewed_at`,
    [card.questionId, card.repetition, card.easeFactor, card.intervalDays, card.dueAt, card.lastResult, card.lastReviewedAt],
  );
  persistDebounced();
}

export async function recordQuizAttempt(attempt: QuizAttempt): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO quiz_attempts (id, question_id, correct, answered_at, triggered_by, trigger_context) VALUES (?, ?, ?, ?, ?, ?)`,
    [attempt.id, attempt.questionId, attempt.correct ? 1 : 0, attempt.answeredAt, attempt.triggeredBy, attempt.triggerContext ?? null],
  );
  persistDebounced();
}

// ---------- speed drill history ----------

export async function recordSpeedDrillResult(r: SpeedDrillResult): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO speed_drill_results (id, prompt_id, correct, wrong_action, time_to_submit_ms, score, answered_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [r.id, r.promptId, r.correct ? 1 : 0, r.wrongAction ? 1 : 0, r.timeToSubmitMs, r.score, r.answeredAt],
  );
  persistDebounced();
}

export interface SpeedDrillHistoryRow {
  timeToSubmitMs: number;
  correct: boolean;
  wrongAction: boolean;
  score: number;
  answeredAt: number;
}

export async function loadSpeedDrillHistory(limit = 500): Promise<SpeedDrillHistoryRow[]> {
  const db = await getDb();
  const res = db.exec(`SELECT time_to_submit_ms, correct, wrong_action, score, answered_at FROM speed_drill_results ORDER BY answered_at DESC LIMIT ${limit}`);
  if (res.length === 0) return [];
  return res[0].values.map((row) => ({
    timeToSubmitMs: row[0] as number,
    correct: (row[1] as number) === 1,
    wrongAction: (row[2] as number) === 1,
    score: row[3] as number,
    answeredAt: row[4] as number,
  }));
}

export function medianOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
