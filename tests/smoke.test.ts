import { levelFromXp, xpToNextLevel } from '../src/config/constants';

describe('Smoke test & Constants', () => {
  it('calculates level from xp correctly', () => {
    // Level 1 needs 100 xp to get to level 2
    expect(xpToNextLevel(1)).toBe(100);
    expect(levelFromXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNext: 100 });
    expect(levelFromXp(50)).toEqual({ level: 1, xpIntoLevel: 50, xpForNext: 100 });
    // At 100 xp, level 2. Next level (2 to 3) needs 200 xp
    expect(levelFromXp(100)).toEqual({ level: 2, xpIntoLevel: 0, xpForNext: 200 });
    expect(levelFromXp(150)).toEqual({ level: 2, xpIntoLevel: 50, xpForNext: 200 });
    // At 300 xp (100 + 200), level 3
    expect(levelFromXp(300)).toEqual({ level: 3, xpIntoLevel: 0, xpForNext: 300 });
  });
});
