import * as SQLite from 'expo-sqlite';
import { ConceptId, CompletionKind, AttemptState, GenuineLabel, GenuineReason, TutorAction } from '../core/types';
import { ACTIVE_CONCEPTS } from '../core/mastery/readiness';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('codechamp.db');
    initSchema(dbInstance);
  }
  return dbInstance;
}

export function initSchema(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      roadmap TEXT NOT NULL,
      daily_goal INTEGER NOT NULL DEFAULT 1,
      theme TEXT NOT NULL DEFAULT 'system',
      code_font_size INTEGER NOT NULL DEFAULT 16,
      reminder_time TEXT,
      haptics INTEGER NOT NULL DEFAULT 1,
      reduce_motion INTEGER NOT NULL DEFAULT 0,
      wifi_only INTEGER NOT NULL DEFAULT 1,
      xp_total INTEGER NOT NULL DEFAULT 0,
      consecutive_struggles INTEGER NOT NULL DEFAULT 0,
      has_selected_language INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  try {
    db.execSync('ALTER TABLE profile ADD COLUMN has_selected_language INTEGER NOT NULL DEFAULT 0');
  } catch (_) {}

  db.execSync(`

    CREATE TABLE IF NOT EXISTS concept_mastery (
      concept_id TEXT PRIMARY KEY,
      score INTEGER NOT NULL DEFAULT 0,
      attempted INTEGER NOT NULL DEFAULT 0,
      last_delta INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS problem_progress (
      problem_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'unlocked',
      draft_code TEXT,
      completed_at INTEGER,
      completion_kind TEXT,
      genuine_label TEXT,
      times_completed INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      state TEXT NOT NULL DEFAULT 'open',
      runs INTEGER NOT NULL DEFAULT 0,
      tutor_requests INTEGER NOT NULL DEFAULT 0,
      max_hint_level INTEGER NOT NULL DEFAULT 0,
      completion_kind TEXT,
      xp_awarded INTEGER NOT NULL DEFAULT 0,
      seconds_spent INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_problem ON attempts(problem_id, state);

    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      ts INTEGER NOT NULL,
      seed INTEGER NOT NULL,
      code TEXT NOT NULL,
      status TEXT NOT NULL,
      visible_passed INTEGER NOT NULL,
      visible_total INTEGER NOT NULL,
      hidden_passed INTEGER NOT NULL,
      hidden_total INTEGER NOT NULL,
      genuine_label TEXT,
      genuine_reason TEXT,
      mistake_tag TEXT,
      duration_ms INTEGER
    );

    CREATE TABLE IF NOT EXISTS mastery_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      concept_id TEXT NOT NULL,
      problem_id TEXT,
      attempt_id INTEGER,
      reason TEXT NOT NULL,
      delta INTEGER NOT NULL,
      score_after INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mistake_counts (
      concept_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      last_seen INTEGER,
      PRIMARY KEY (concept_id, tag)
    );

    CREATE TABLE IF NOT EXISTS xp_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      attempt_id INTEGER,
      kind TEXT NOT NULL,
      amount INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS streak (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current INTEGER NOT NULL DEFAULT 0,
      best INTEGER NOT NULL DEFAULT 0,
      last_completion_date TEXT,
      freeze_available INTEGER NOT NULL DEFAULT 1,
      broken_notice_pending INTEGER NOT NULL DEFAULT 0,
      broken_at_length INTEGER
    );

    CREATE TABLE IF NOT EXISTS tutor_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      attempt_id INTEGER,
      problem_id TEXT,
      action TEXT NOT NULL,
      level INTEGER,
      source TEXT NOT NULL,
      rejected_reason TEXT,
      prompt_tokens_est INTEGER,
      first_token_ms INTEGER,
      total_ms INTEGER,
      output_tokens INTEGER,
      ai_text TEXT
    );
  `);

  // Ensure profile exists
  const existingProfile = db.getFirstSync<{ id: number }>('SELECT id FROM profile WHERE id = 1');
  if (!existingProfile) {
    db.runSync(
      `INSERT INTO profile (id, roadmap, daily_goal, theme, code_font_size, haptics, xp_total, consecutive_struggles, created_at)
       VALUES (1, 'javascript', 1, 'system', 16, 1, 0, 0, ?)`,
      [Date.now()]
    );
  }

  // Ensure streak row exists
  const existingStreak = db.getFirstSync<{ id: number }>('SELECT id FROM streak WHERE id = 1');
  if (!existingStreak) {
    db.runSync(`INSERT INTO streak (id, current, best, freeze_available) VALUES (1, 0, 0, 1)`);
  }

  // Ensure concept_mastery rows exist for active concepts
  for (const cid of ACTIVE_CONCEPTS) {
    const existing = db.getFirstSync<{ concept_id: string }>(
      'SELECT concept_id FROM concept_mastery WHERE concept_id = ?',
      [cid]
    );
    if (!existing) {
      db.runSync(
        'INSERT INTO concept_mastery (concept_id, score, attempted, last_delta) VALUES (?, 0, 0, 0)',
        [cid]
      );
    }
  }
}
