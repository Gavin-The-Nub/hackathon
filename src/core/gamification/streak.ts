import { STREAK_FREEZE_REFILL_EVERY } from '../../config/constants';

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  lastCompletionDate: string | null; // 'YYYY-MM-DD'
}

export function getDaysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(`${dateStr1}T00:00:00Z`).getTime();
  const d2 = new Date(`${dateStr2}T00:00:00Z`).getTime();
  const diffMs = Math.abs(d2 - d1);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function updateStreak(
  state: StreakState,
  todayStr: string // 'YYYY-MM-DD'
): {
  state: StreakState;
  streakIncremented: boolean;
  freezeConsumed: boolean;
  freezeRefilled: boolean;
  streakLost: boolean;
} {
  const { currentStreak, longestStreak, freezesAvailable, lastCompletionDate } = state;

  if (!lastCompletionDate) {
    // First completion ever
    const newStreak = 1;
    return {
      state: {
        currentStreak: newStreak,
        longestStreak: Math.max(longestStreak, newStreak),
        freezesAvailable,
        lastCompletionDate: todayStr,
      },
      streakIncremented: true,
      freezeConsumed: false,
      freezeRefilled: false,
      streakLost: false,
    };
  }

  const gap = getDaysBetween(lastCompletionDate, todayStr);

  if (gap === 0) {
    // Completed another problem on same day: no change to streak count
    return {
      state,
      streakIncremented: false,
      freezeConsumed: false,
      freezeRefilled: false,
      streakLost: false,
    };
  }

  let newStreak = currentStreak;
  let newFreezes = freezesAvailable;
  let freezeConsumed = false;
  let streakLost = false;

  if (gap === 1) {
    // Consecutive day
    newStreak += 1;
  } else if (gap === 2 && freezesAvailable > 0) {
    // Missed exactly 1 day with a freeze available
    newFreezes -= 1;
    freezeConsumed = true;
    newStreak += 1;
  } else {
    // Streak broken
    newStreak = 1;
    streakLost = currentStreak > 0;
  }

  // Refill freeze when streak hits multiple of 7
  let freezeRefilled = false;
  if (newStreak > 0 && newStreak % STREAK_FREEZE_REFILL_EVERY === 0 && newFreezes < 1) {
    newFreezes = 1;
    freezeRefilled = true;
  }

  return {
    state: {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      freezesAvailable: newFreezes,
      lastCompletionDate: todayStr,
    },
    streakIncremented: true,
    freezeConsumed,
    freezeRefilled,
    streakLost,
  };
}
