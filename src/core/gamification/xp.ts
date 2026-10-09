import { XP_BASE, XP_CLEAN_BONUS, levelFromXp, xpToNextLevel } from '../../config/constants';
import { CompletionKind } from '../types';

export interface XpAwardResult {
  baseXp: number;
  bonusXp: number;
  totalAwarded: number;
  newTotalXp: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

export function calculateXpEarned(
  kind: CompletionKind,
  tutorRequests: number
): { baseXp: number; bonusXp: number; totalXp: number } {
  let baseXp: number = XP_BASE.hints;
  switch (kind) {
    case 'first_try':
      baseXp = XP_BASE.firstTry;
      break;
    case 'retries':
      baseXp = XP_BASE.retries;
      break;
    case 'hints':
      baseXp = XP_BASE.hints;
      break;
    case 'not_genuine':
      baseXp = XP_BASE.notGenuine;
      break;
  }

  let bonusXp = 0;
  if (tutorRequests === 0 && (kind === 'first_try' || kind === 'retries')) {
    bonusXp = XP_CLEAN_BONUS;
  }

  return {
    baseXp,
    bonusXp,
    totalXp: baseXp + bonusXp,
  };
}

export function awardProblemXp(
  currentTotalXp: number,
  kind: CompletionKind,
  tutorRequests: number
): XpAwardResult {
  const { baseXp, bonusXp, totalXp } = calculateXpEarned(kind, tutorRequests);
  const newTotalXp = currentTotalXp + totalXp;

  const prev = levelFromXp(currentTotalXp);
  const next = levelFromXp(newTotalXp);

  return {
    baseXp,
    bonusXp,
    totalAwarded: totalXp,
    newTotalXp,
    previousLevel: prev.level,
    newLevel: next.level,
    leveledUp: next.level > prev.level,
  };
}

export { levelFromXp, xpToNextLevel };
