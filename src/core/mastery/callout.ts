import { ConceptId } from '../types';
import { ACTIVE_CONCEPTS } from './readiness';
import { ConceptMasteryRecord } from './update';

export const CONCEPT_NAMES: Record<ConceptId, string> = {
  variables_types: 'Variables',
  operators: 'Operators',
  conditionals: 'Conditionals',
  loops: 'Loops',
  functions: 'Functions',
  arrays_lists: 'Arrays & Lists',
  strings: 'Strings',
  reading_fixing_code: 'Reading & Fixing',
};

export interface HeaderSummaryResult {
  headline: string;
  strongestConcept?: ConceptId;
  weakestConcept?: ConceptId;
}

export function getHeaderSummary(
  masteryMap: Partial<Record<ConceptId, ConceptMasteryRecord>>
): HeaderSummaryResult {
  const attemptedList = ACTIVE_CONCEPTS.filter((cid) => masteryMap[cid]?.attempted);

  if (attemptedList.length === 0) {
    return {
      headline: 'Solve your first problem to see your skills.',
    };
  }

  if (attemptedList.length === 1) {
    const name = CONCEPT_NAMES[attemptedList[0]];
    const score = ((masteryMap[attemptedList[0]]?.score ?? 0) / 10).toFixed(1);
    return {
      headline: `You started with ${name} (${score}/10). Keep going!`,
      strongestConcept: attemptedList[0],
      weakestConcept: attemptedList[0],
    };
  }

  // Sort descending by score
  attemptedList.sort((a, b) => (masteryMap[b]?.score ?? 0) - (masteryMap[a]?.score ?? 0));
  const strongest = attemptedList[0];
  const weakest = attemptedList[attemptedList.length - 1];

  return {
    headline: `You're strongest at ${CONCEPT_NAMES[strongest]}. ${CONCEPT_NAMES[weakest]} needs work.`,
    strongestConcept: strongest,
    weakestConcept: weakest,
  };
}

export interface WeakestCalloutResult {
  conceptId: ConceptId;
  conceptName: string;
  displayScore: string;
  advice: string;
}

export function getWeakestConceptCallout(
  masteryMap: Partial<Record<ConceptId, ConceptMasteryRecord>>,
  mistakeTagCounts?: Partial<Record<string, number>>,
  mistakeTextMap?: Record<string, string>
): WeakestCalloutResult | null {
  const attempted = ACTIVE_CONCEPTS.filter((cid) => masteryMap[cid]?.attempted);
  if (attempted.length === 0) return null;

  attempted.sort((a, b) => (masteryMap[a]?.score ?? 0) - (masteryMap[b]?.score ?? 0));
  const weakestId = attempted[0];
  const record = masteryMap[weakestId]!;
  const displayScore = `${(record.score / 10).toFixed(1)}/10`;

  let advice = 'This skill needs more practice.';

  if (mistakeTagCounts && mistakeTextMap) {
    let maxCount = 0;
    let mostFrequentTag: string | null = null;
    for (const [tag, count] of Object.entries(mistakeTagCounts)) {
      if (count && count > maxCount) {
        maxCount = count;
        mostFrequentTag = tag;
      }
    }
    if (mostFrequentTag && mistakeTextMap[mostFrequentTag]) {
      advice = mistakeTextMap[mostFrequentTag];
    }
  }

  return {
    conceptId: weakestId,
    conceptName: CONCEPT_NAMES[weakestId],
    displayScore,
    advice,
  };
}
