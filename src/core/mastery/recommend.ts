import { STRUGGLES_BEFORE_EASY_REVIEW } from '../../config/constants';
import { ConceptId, Problem } from '../types';
import { ACTIVE_CONCEPTS, checkReadiness } from './readiness';
import { ConceptMasteryRecord } from './update';

export type RecommendationReason =
  | 'confidence_boost'
  | 'review'
  | 'lowest_mastery'
  | 'ready_all_done'
  | 'practice_again';

export interface RecommendationState {
  unlockedProblems: Problem[];
  completedProblemIds: Set<string>;
  masteryMap: Record<ConceptId, ConceptMasteryRecord>;
  consecutiveStruggles: number;
  recentCompletions?: string[]; // IDs ordered most recent first
}

export interface RecommendationResult {
  problem: Problem | null;
  reason: RecommendationReason;
  targetConcept?: ConceptId;
}

const CONCEPT_ORDER: Record<ConceptId, number> = {
  variables_types: 0,
  operators: 1,
  conditionals: 2,
  loops: 3,
  functions: 4,
  arrays_lists: 5,
  strings: 6,
  reading_fixing_code: 7,
};

export function recommendNext(state: RecommendationState): RecommendationResult {
  const {
    unlockedProblems,
    completedProblemIds,
    masteryMap,
    consecutiveStruggles,
    recentCompletions = [],
  } = state;

  const helperPickItem = (concept: ConceptId): Problem | null => {
    // 1. uncompleted base items in that concept, lowest order first
    const uncompletedBase = unlockedProblems
      .filter((p) => p.primaryConcept === concept && !completedProblemIds.has(p.id) && !p.variantOf)
      .sort((a, b) => a.order - b.order);
    if (uncompletedBase.length > 0) return uncompletedBase[0];

    // 2. uncompleted variants in that concept
    const uncompletedVariants = unlockedProblems
      .filter((p) => p.primaryConcept === concept && !completedProblemIds.has(p.id) && !!p.variantOf)
      .sort((a, b) => a.order - b.order);
    if (uncompletedVariants.length > 0) return uncompletedVariants[0];

    // 3. least recently completed item in concept
    const completedInConcept = unlockedProblems.filter(
      (p) => p.primaryConcept === concept && completedProblemIds.has(p.id)
    );
    if (completedInConcept.length === 0) return null;

    // Sort by position in recentCompletions (largest index = least recent)
    return completedInConcept.sort((a, b) => {
      const idxA = recentCompletions.indexOf(a.id);
      const idxB = recentCompletions.indexOf(b.id);
      return (idxB === -1 ? 9999 : idxB) - (idxA === -1 ? 9999 : idxA);
    })[0];
  };

  // 1. Confidence boost if consecutive struggles >= 2
  if (consecutiveStruggles >= STRUGGLES_BEFORE_EASY_REVIEW) {
    const completedItems = unlockedProblems.filter((p) => completedProblemIds.has(p.id));
    if (completedItems.length > 0) {
      // Easiest item (lowest difficulty; ties: highest concept score, then most recent)
      const sorted = [...completedItems].sort((a, b) => {
        if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
        const scoreA = masteryMap[a.primaryConcept]?.score ?? 0;
        const scoreB = masteryMap[b.primaryConcept]?.score ?? 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        const idxA = recentCompletions.indexOf(a.id);
        const idxB = recentCompletions.indexOf(b.id);
        return (idxA === -1 ? 9999 : idxA) - (idxB === -1 ? 9999 : idxB);
      });
      return { problem: sorted[0], reason: 'confidence_boost', targetConcept: sorted[0].primaryConcept };
    }
  }

  // 2. Review queue
  const reviewConcepts = ACTIVE_CONCEPTS.filter((cid) => masteryMap[cid]?.inReviewQueue);
  if (reviewConcepts.length > 0) {
    reviewConcepts.sort((a, b) => {
      const sA = masteryMap[a]?.score ?? 0;
      const sB = masteryMap[b]?.score ?? 0;
      if (sA !== sB) return sA - sB;
      return CONCEPT_ORDER[a] - CONCEPT_ORDER[b];
    });
    const target = reviewConcepts[0];
    const candidate = helperPickItem(target);
    if (candidate) {
      return { problem: candidate, reason: 'review', targetConcept: target };
    }
  }

  // 3. Open items not completed
  const openItems = unlockedProblems.filter((p) => !completedProblemIds.has(p.id));
  if (openItems.length > 0) {
    openItems.sort((a, b) => {
      const sA = masteryMap[a.primaryConcept]?.score ?? 0;
      const sB = masteryMap[b.primaryConcept]?.score ?? 0;
      if (sA !== sB) return sA - sB;
      const oA = CONCEPT_ORDER[a.primaryConcept];
      const oB = CONCEPT_ORDER[b.primaryConcept];
      if (oA !== oB) return oA - oB;
      return a.order - b.order;
    });
    return {
      problem: openItems[0],
      reason: 'lowest_mastery',
      targetConcept: openItems[0].primaryConcept,
    };
  }

  // 4. Ready all done
  const readiness = checkReadiness(masteryMap);
  if (readiness.isReady) {
    return { problem: null, reason: 'ready_all_done' };
  }

  // 5. Practice again on active concept with lowest score
  const activeSorted = [...ACTIVE_CONCEPTS].sort((a, b) => {
    const sA = masteryMap[a]?.score ?? 0;
    const sB = masteryMap[b]?.score ?? 0;
    if (sA !== sB) return sA - sB;
    return CONCEPT_ORDER[a] - CONCEPT_ORDER[b];
  });
  const targetConcept = activeSorted[0];
  return {
    problem: helperPickItem(targetConcept),
    reason: 'practice_again',
    targetConcept,
  };
}

export function getCoachTemplate(reason: RecommendationReason, conceptName = 'this concept'): string {
  switch (reason) {
    case 'lowest_mastery':
      return `Next up: ${conceptName}. It's your lowest skill right now, so a little practice goes a long way.`;
    case 'review':
      return `Let's revisit ${conceptName}. A quick review will lock it in.`;
    case 'confidence_boost':
      return "Here's a quick one you can win. Then we'll get back to the tougher stuff.";
    case 'practice_again':
      return `You've done every new problem here. Let's sharpen ${conceptName} again.`;
    case 'ready_all_done':
      return "You're ready to build a real program!";
  }
}
