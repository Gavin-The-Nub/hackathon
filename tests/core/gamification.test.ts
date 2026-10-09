import { awardProblemXp, calculateXpEarned } from '../../src/core/gamification/xp';
import { updateStreak, StreakState } from '../../src/core/gamification/streak';

describe('Gamification (XP & Streaks)', () => {
  describe('XP calculation', () => {
    it('awards clean bonus (+5) on first_try with 0 tutor requests', () => {
      const res = calculateXpEarned('first_try', 0);
      expect(res.baseXp).toBe(20);
      expect(res.bonusXp).toBe(5);
      expect(res.totalXp).toBe(25);
    });

    it('awards no bonus when tutor was used', () => {
      const res = calculateXpEarned('hints', 1);
      expect(res.baseXp).toBe(10);
      expect(res.bonusXp).toBe(0);
      expect(res.totalXp).toBe(10);
    });

    it('detects level ups', () => {
      const res = awardProblemXp(90, 'first_try', 0); // 90 + 25 = 115 XP (Level 1 requires 100)
      expect(res.newTotalXp).toBe(115);
      expect(res.previousLevel).toBe(1);
      expect(res.newLevel).toBe(2);
      expect(res.leveledUp).toBe(true);
    });
  });

  describe('Streak management', () => {
    const initialState: StreakState = {
      currentStreak: 0,
      longestStreak: 0,
      freezesAvailable: 1,
      lastCompletionDate: null,
    };

    it('starts streak at 1 on first ever completion', () => {
      const { state, streakIncremented } = updateStreak(initialState, '2026-10-09');
      expect(state.currentStreak).toBe(1);
      expect(state.lastCompletionDate).toBe('2026-10-09');
      expect(streakIncremented).toBe(true);
    });

    it('increments streak on consecutive day', () => {
      const activeState: StreakState = {
        currentStreak: 3,
        longestStreak: 3,
        freezesAvailable: 1,
        lastCompletionDate: '2026-10-08',
      };
      const { state, streakIncremented } = updateStreak(activeState, '2026-10-09');
      expect(state.currentStreak).toBe(4);
      expect(streakIncremented).toBe(true);
    });

    it('does not increment on same calendar day', () => {
      const activeState: StreakState = {
        currentStreak: 3,
        longestStreak: 3,
        freezesAvailable: 1,
        lastCompletionDate: '2026-10-09',
      };
      const { state, streakIncremented } = updateStreak(activeState, '2026-10-09');
      expect(state.currentStreak).toBe(3);
      expect(streakIncremented).toBe(false);
    });

    it('uses freeze when 1 day missed (gap 2)', () => {
      const activeState: StreakState = {
        currentStreak: 5,
        longestStreak: 5,
        freezesAvailable: 1,
        lastCompletionDate: '2026-10-07',
      };
      const { state, freezeConsumed } = updateStreak(activeState, '2026-10-09');
      expect(state.currentStreak).toBe(6);
      expect(state.freezesAvailable).toBe(0);
      expect(freezeConsumed).toBe(true);
    });

    it('breaks streak when gap > 1 and no freeze available', () => {
      const activeState: StreakState = {
        currentStreak: 5,
        longestStreak: 5,
        freezesAvailable: 0,
        lastCompletionDate: '2026-10-07',
      };
      const { state, streakLost } = updateStreak(activeState, '2026-10-09');
      expect(state.currentStreak).toBe(1);
      expect(streakLost).toBe(true);
    });
  });
});
