// Execution
export const RUN_TIMEOUT_MS = 3000;                  // [PRD0.1]
export const RESULTS_TARGET_MS = 1000;               // [PRD0.1] target, not a guarantee
export const PRINTED_OUTPUT_CAP_CHARS = 4000;        // [ADDED]

// Hidden tests and genuine-use
export const HIDDEN_TEST_COUNT = 20;                 // [ADDED]
export const GENUINE_SAMPLE_INPUTS = 10;             // [ADDED]
export const GENUINE_PHASE_BUDGET_MS = 3000;         // [ADDED]
export const MUTATION_UNCHANGED_RATIO = 0.9;         // [ADDED] tune with cheat suites
export const MUTATION_RUN_TIMEOUT_MS = 300;          // [ADDED]
export const GENUINE_GATE: 'soft' | 'hard' = 'soft'; // [OPEN O10]

// Mastery
export const MASTERY_MIN = 0;
export const MASTERY_MAX = 100;
export const MASTERY_INITIAL = 0;
export const MASTERY_DELTA = {
  firstTry: 15,
  retries: 10,
  hints: 5,
  notGenuine: 5,
  abandoned: -5,
} as const;                                          // [PRD0.1]
export const REVIEW_THRESHOLD = 40;                  // [PRD0.1] (4/10)
export const READY_THRESHOLD = 70;                   // [OPEN O2] (7/10)
export const STRUGGLE_ATTEMPTS_TO_PASS = 3;          // [OPEN O3]
export const STRUGGLES_BEFORE_EASY_REVIEW = 2;       // [DESIGN §2]

// Gamification (DESIGN §6)
export const XP_BASE = { firstTry: 20, retries: 15, hints: 10, notGenuine: 10 } as const;
export const XP_CLEAN_BONUS = 5;
export const xpToNextLevel = (level: number): number => 100 * level;   // [OPEN O4]
export const STREAK_FREEZE_REFILL_EVERY = 7;

export function levelFromXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpToNextLevel(level) };
}

// AI tutor
export const AI = {
  temperature: 0.3,                // [PRD0.1]
  nPredict: 120,                   // [PRD0.1]
  nCtx: 2048,
  nThreads: 4,                     // [VERIFY] tune on the demo phone
  nGpuLayers: 0,                   // [ADDED] CPU only (D15)
  useMlock: false,                 // [ADDED] avoid pinning memory on low-RAM phones
  promptTokenTarget: 300,          // [ADDED] D14
  promptTokenMax: 800,             // [PRD0.1]
  codeLinesMax: 40,                // [ADDED] D14 (PRD v0.1 said 60)
  firstTokenTimeoutMs: 8000,       // [DESIGN §5.5]
  totalTimeoutMs: 30000,           // [ADDED]
  maxRegenerations: 1,             // [PRD0.1]
} as const;
export const MODEL_UNLOAD_AFTER_BACKGROUND_MS = 60000;  // [ADDED]
export const LOG_AI_TEXT_DEFAULT = false;               // [ADDED]
