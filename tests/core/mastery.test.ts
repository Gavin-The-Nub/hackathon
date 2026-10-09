import {
  determineCompletionKind,
  getMasteryBand,
  updateMasteryScore,
  ConceptMasteryRecord,
} from '../../src/core/mastery/update';
import { checkReadiness } from '../../src/core/mastery/readiness';
import { recommendNext } from '../../src/core/mastery/recommend';
import { Problem } from '../../src/core/types';

describe('Mastery & Recommendation Logic', () => {
  const initialRecord: ConceptMasteryRecord = {
    conceptId: 'variables_types',
    score: 0,
    attempted: false,
    lastDelta: 0,
    inReviewQueue: false,
  };

  it('determines completion kind correctly', () => {
    expect(determineCompletionKind(false, 0, 1)).toBe('not_genuine');
    expect(determineCompletionKind(true, 1, 1)).toBe('hints');
    expect(determineCompletionKind(true, 0, 2)).toBe('retries');
    expect(determineCompletionKind(true, 0, 1)).toBe('first_try');
  });

  it('updates mastery score accurately on first_try (+15)', () => {
    const updated = updateMasteryScore(initialRecord, 'first_try');
    expect(updated.score).toBe(15);
    expect(updated.attempted).toBe(true);
    expect(updated.lastDelta).toBe(15);
    expect(updated.inReviewQueue).toBe(false);
  });

  it('handles abandonment and enters review queue when falling below 40', () => {
    const recordAt30: ConceptMasteryRecord = {
      conceptId: 'loops',
      score: 30,
      attempted: true,
      lastDelta: 10,
      inReviewQueue: false,
    };
    const abandoned = updateMasteryScore(recordAt30, 'abandoned');
    expect(abandoned.score).toBe(25);
    expect(abandoned.lastDelta).toBe(-5);
    expect(abandoned.inReviewQueue).toBe(true); // < 40 and negative delta
  });

  it('evaluates mastery bands', () => {
    expect(getMasteryBand(initialRecord).band).toBe('not_started');
    expect(getMasteryBand({ ...initialRecord, score: 25, attempted: true }).band).toBe('needs_work');
    expect(getMasteryBand({ ...initialRecord, score: 55, attempted: true }).band).toBe('getting_there');
    expect(getMasteryBand({ ...initialRecord, score: 75, attempted: true }).band).toBe('strong');
  });

  it('verifies readiness when all 5 active concepts >= 70', () => {
    const activeConcepts = ['variables_types', 'conditionals', 'loops', 'functions', 'arrays_lists'] as const;
    const masteryMap: any = {};
    for (const c of activeConcepts) {
      masteryMap[c] = { conceptId: c, score: 70, attempted: true, inReviewQueue: false, lastDelta: 15 };
    }
    expect(checkReadiness(masteryMap).isReady).toBe(true);

    // If one is below 70
    masteryMap['loops'].score = 65;
    expect(checkReadiness(masteryMap).isReady).toBe(false);
  });
});
