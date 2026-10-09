import { create } from 'zustand';
import { ConceptId, CompletionKind, Problem } from '../core/types';
import { ConceptMasteryRecord, updateMasteryScore } from '../core/mastery/update';
import { awardProblemXp, levelFromXp } from '../core/gamification/xp';
import { StreakState, updateStreak } from '../core/gamification/streak';
import { ACTIVE_CONCEPTS } from '../core/mastery/readiness';
import { getDb } from '../services/db';

interface UserState {
  theme: 'light' | 'dark' | 'system';
  totalXp: number;
  level: number;
  consecutiveStruggles: number;
  streak: StreakState;
  mastery: Record<ConceptId, ConceptMasteryRecord>;
  completedProblems: Set<string>;
  drafts: Record<string, string>;
  loadFromDb: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  saveDraft: (problemId: string, code: string) => void;
  recordCompletion: (params: {
    problem: Problem;
    kind: CompletionKind;
    tutorRequests: number;
    runs: number;
    code: string;
  }) => { xpAwarded: number; leveledUp: boolean; newLevel: number };
  recordAbandonment: (problemId: string, conceptId: ConceptId) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  theme: 'system',
  totalXp: 0,
  level: 1,
  consecutiveStruggles: 0,
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    freezesAvailable: 1,
    lastCompletionDate: null,
  },
  mastery: ACTIVE_CONCEPTS.reduce((acc, cid) => {
    acc[cid] = {
      conceptId: cid,
      score: 0,
      attempted: false,
      lastDelta: 0,
      inReviewQueue: false,
    };
    return acc;
  }, {} as Record<ConceptId, ConceptMasteryRecord>),
  completedProblems: new Set<string>(),
  drafts: {},

  loadFromDb: () => {
    try {
      const db = getDb();
      const profile = db.getFirstSync<any>('SELECT * FROM profile WHERE id = 1');
      const streakRow = db.getFirstSync<any>('SELECT * FROM streak WHERE id = 1');
      const masteryRows = db.getAllSync<any>('SELECT * FROM concept_mastery');
      const completedRows = db.getAllSync<any>(
        "SELECT problem_id, draft_code FROM problem_progress WHERE status = 'completed'"
      );
      const allDrafts = db.getAllSync<any>('SELECT problem_id, draft_code FROM problem_progress');

      const completedSet = new Set<string>();
      for (const r of completedRows) {
        completedSet.add(r.problem_id);
      }

      const draftsMap: Record<string, string> = {};
      for (const r of allDrafts) {
        if (r.draft_code) draftsMap[r.problem_id] = r.draft_code;
      }

      const masteryMap = { ...get().mastery };
      for (const r of masteryRows) {
        if (masteryMap[r.concept_id as ConceptId]) {
          masteryMap[r.concept_id as ConceptId] = {
            conceptId: r.concept_id,
            score: r.score,
            attempted: Boolean(r.attempted),
            lastDelta: r.last_delta,
            inReviewQueue: r.score < 40 && r.last_delta < 0,
          };
        }
      }

      const xp = profile?.xp_total ?? 0;
      set({
        theme: profile?.theme ?? 'system',
        totalXp: xp,
        level: levelFromXp(xp).level,
        consecutiveStruggles: profile?.consecutive_struggles ?? 0,
        streak: {
          currentStreak: streakRow?.current ?? 0,
          longestStreak: streakRow?.best ?? 0,
          freezesAvailable: streakRow?.freeze_available ?? 1,
          lastCompletionDate: streakRow?.last_completion_date ?? null,
        },
        mastery: masteryMap,
        completedProblems: completedSet,
        drafts: draftsMap,
      });
    } catch (err) {
      console.warn('Failed to load DB state, using defaults', err);
    }
  },

  setTheme: (theme) => {
    set({ theme });
    try {
      getDb().runSync('UPDATE profile SET theme = ? WHERE id = 1', [theme]);
    } catch (e) {}
  },

  saveDraft: (problemId, code) => {
    set((state) => ({ drafts: { ...state.drafts, [problemId]: code } }));
    try {
      const db = getDb();
      db.runSync(
        `INSERT INTO problem_progress (problem_id, draft_code) VALUES (?, ?)
         ON CONFLICT(problem_id) DO UPDATE SET draft_code = excluded.draft_code`,
        [problemId, code]
      );
    } catch (e) {}
  },

  recordCompletion: ({ problem, kind, tutorRequests, runs, code }) => {
    const state = get();
    const db = getDb();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Gamification XP
    const xpResult = awardProblemXp(state.totalXp, kind, tutorRequests);

    // 2. Streak
    const streakResult = updateStreak(state.streak, todayStr);

    // 3. Mastery
    const currentConcept = state.mastery[problem.primaryConcept];
    const newConcept = updateMasteryScore(currentConcept, kind);
    const newMastery = { ...state.mastery, [problem.primaryConcept]: newConcept };

    // 4. Consecutive struggles: struggle if abandoned or runs >= 3
    const isStruggle = runs >= 3;
    const newStruggles = isStruggle ? state.consecutiveStruggles + 1 : 0;

    // 5. Update completed set
    const newCompleted = new Set(state.completedProblems);
    newCompleted.add(problem.id);

    set({
      totalXp: xpResult.newTotalXp,
      level: xpResult.newLevel,
      consecutiveStruggles: newStruggles,
      streak: streakResult.state,
      mastery: newMastery,
      completedProblems: newCompleted,
    });

    try {
      db.runSync(
        'UPDATE profile SET xp_total = ?, consecutive_struggles = ? WHERE id = 1',
        [xpResult.newTotalXp, newStruggles]
      );
      db.runSync(
        'UPDATE streak SET current = ?, best = ?, freeze_available = ?, last_completion_date = ? WHERE id = 1',
        [
          streakResult.state.currentStreak,
          streakResult.state.longestStreak,
          streakResult.state.freezesAvailable,
          streakResult.state.lastCompletionDate,
        ]
      );
      db.runSync(
        `INSERT INTO concept_mastery (concept_id, score, attempted, last_delta, updated_at)
         VALUES (?, ?, 1, ?, ?)
         ON CONFLICT(concept_id) DO UPDATE SET score = excluded.score, attempted = 1, last_delta = excluded.last_delta, updated_at = excluded.updated_at`,
        [problem.primaryConcept, newConcept.score, newConcept.lastDelta, Date.now()]
      );
      db.runSync(
        `INSERT INTO problem_progress (problem_id, status, draft_code, completed_at, completion_kind, times_completed)
         VALUES (?, 'completed', ?, ?, ?, 1)
         ON CONFLICT(problem_id) DO UPDATE SET status = 'completed', draft_code = excluded.draft_code, completed_at = excluded.completed_at, completion_kind = excluded.completion_kind, times_completed = times_completed + 1`,
        [problem.id, code, Date.now(), kind]
      );
      db.runSync(
        'INSERT INTO xp_events (ts, kind, amount) VALUES (?, ?, ?)',
        [Date.now(), kind, xpResult.totalAwarded]
      );
    } catch (e) {
      console.warn('DB error on completion', e);
    }

    return {
      xpAwarded: xpResult.totalAwarded,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
    };
  },

  recordAbandonment: (problemId, conceptId) => {
    const state = get();
    const currentConcept = state.mastery[conceptId];
    const newConcept = updateMasteryScore(currentConcept, 'abandoned');
    const newMastery = { ...state.mastery, [conceptId]: newConcept };
    const newStruggles = state.consecutiveStruggles + 1;

    set({
      mastery: newMastery,
      consecutiveStruggles: newStruggles,
    });

    try {
      const db = getDb();
      db.runSync(
        'UPDATE profile SET consecutive_struggles = ? WHERE id = 1',
        [newStruggles]
      );
      db.runSync(
        `INSERT INTO concept_mastery (concept_id, score, attempted, last_delta, updated_at)
         VALUES (?, ?, 1, ?, ?)
         ON CONFLICT(concept_id) DO UPDATE SET score = excluded.score, attempted = 1, last_delta = excluded.last_delta, updated_at = excluded.updated_at`,
        [conceptId, newConcept.score, newConcept.lastDelta, Date.now()]
      );
    } catch (e) {}
  },
}));
