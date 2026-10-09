import {
  MASTERY_DELTA,
  MASTERY_MAX,
  MASTERY_MIN,
  REVIEW_THRESHOLD,
} from '../../config/constants';
import { CompletionKind, ConceptId } from '../types';

export interface ConceptMasteryRecord {
  conceptId: ConceptId;
  score: number;
  attempted: boolean;
  lastDelta: number;
  inReviewQueue: boolean;
}

export type MasteryBand = 'not_started' | 'needs_work' | 'getting_there' | 'strong';

export function determineCompletionKind(
  isGenuine: boolean,
  tutorRequests: number,
  runs: number
): CompletionKind {
  if (!isGenuine) {
    return 'not_genuine';
  }
  if (tutorRequests > 0) {
    return 'hints';
  }
  if (runs > 1) {
    return 'retries';
  }
  return 'first_try';
}

export function computeMasteryDelta(
  outcome: CompletionKind | 'abandoned'
): number {
  if (outcome === 'abandoned') {
    return MASTERY_DELTA.abandoned;
  }
  switch (outcome) {
    case 'first_try':
      return MASTERY_DELTA.firstTry;
    case 'retries':
      return MASTERY_DELTA.retries;
    case 'hints':
      return MASTERY_DELTA.hints;
    case 'not_genuine':
      return MASTERY_DELTA.notGenuine;
  }
}

export function updateMasteryScore(
  current: ConceptMasteryRecord,
  outcome: CompletionKind | 'abandoned'
): ConceptMasteryRecord {
  const delta = computeMasteryDelta(outcome);
  const rawNewScore = current.score + delta;
  const clampedScore = Math.max(MASTERY_MIN, Math.min(MASTERY_MAX, rawNewScore));

  let inReviewQueue = current.inReviewQueue;
  if (delta > 0) {
    // Leaves review queue after a positive delta
    inReviewQueue = false;
  } else if (delta < 0 && clampedScore < REVIEW_THRESHOLD) {
    // Enters review queue if attempted, score < 40, and lastDelta < 0
    inReviewQueue = true;
  }

  return {
    conceptId: current.conceptId,
    score: clampedScore,
    attempted: true,
    lastDelta: delta,
    inReviewQueue,
  };
}

export function getMasteryBand(record: ConceptMasteryRecord): {
  band: MasteryBand;
  label: string;
  displayScore: string;
} {
  if (!record.attempted) {
    return {
      band: 'not_started',
      label: 'Not started',
      displayScore: '-/10',
    };
  }

  const display = (record.score / 10).toFixed(1);
  if (record.score < REVIEW_THRESHOLD) {
    return {
      band: 'needs_work',
      label: 'Needs work',
      displayScore: `${display}/10`,
    };
  }
  if (record.score < 70) {
    return {
      band: 'getting_there',
      label: 'Getting there',
      displayScore: `${display}/10`,
    };
  }
  return {
    band: 'strong',
    label: 'Strong',
    displayScore: `${display}/10`,
  };
}
