import { READY_THRESHOLD } from '../../config/constants';
import { ConceptId } from '../types';
import { ConceptMasteryRecord } from './update';

export const ACTIVE_CONCEPTS: ConceptId[] = [
  'variables_types',
  'conditionals',
  'loops',
  'functions',
  'arrays_lists',
];

export function checkReadiness(
  masteryMap: Partial<Record<ConceptId, ConceptMasteryRecord>>
): { isReady: boolean; readyCount: number; totalActive: number } {
  let readyCount = 0;
  for (const cid of ACTIVE_CONCEPTS) {
    const rec = masteryMap[cid];
    if (rec && rec.attempted && rec.score >= READY_THRESHOLD) {
      readyCount++;
    }
  }
  return {
    isReady: readyCount === ACTIVE_CONCEPTS.length,
    readyCount,
    totalActive: ACTIVE_CONCEPTS.length,
  };
}
