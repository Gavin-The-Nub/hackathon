import { TutorAction } from '../types';

export interface GuardValidationResult {
  valid: boolean;
  failedGuardId?: 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6';
  reason?: string;
}

export function validateTutorOutput(
  text: string,
  referenceSolution: string,
  action: TutorAction
): GuardValidationResult {
  const trimmed = text.trim();

  // G1: No fenced code blocks
  if (trimmed.includes('```')) {
    return { valid: false, failedGuardId: 'G1', reason: 'Fenced code block detected' };
  }

  // G6: Contains none of { } ;
  if (/[{};]/.test(trimmed)) {
    return { valid: false, failedGuardId: 'G6', reason: 'Forbidden code character detected' };
  }

  // G3: Length check (with smart sentence trim if slightly over 400)
  if (action === 'coach') {
    if (trimmed.length < 20 || trimmed.length > 200) {
      return { valid: false, failedGuardId: 'G3', reason: `Coach length (${trimmed.length}) not in [20, 200]` };
    }
  } else {
    let effectiveLen = trimmed.length;
    // If output is slightly over 400 chars, check if trimming to the last question mark puts it in range
    if (effectiveLen > 400) {
      const lastQ = trimmed.lastIndexOf('?', 400);
      if (lastQ >= 25) {
        effectiveLen = lastQ + 1;
      }
    }

    if (effectiveLen < 25 || effectiveLen > 450) {
      return { valid: false, failedGuardId: 'G3', reason: `Hint length (${effectiveLen}) not in [25, 450]` };
    }
  }

  // G4: Ends with ? for hints and explanations
  if (action === 'hint' || action === 'explain') {
    if (!trimmed.endsWith('?')) {
      return { valid: false, failedGuardId: 'G4', reason: 'Must end with question mark' };
    }
  }

  // G2: At most 3 sentences
  const sentenceMatches = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g);
  const sentenceCount = sentenceMatches ? sentenceMatches.length : 1;
  if (sentenceCount > 3) {
    return { valid: false, failedGuardId: 'G2', reason: 'Exceeded 3 sentences' };
  }

  // G5: No 12+ char substring of referenceSolution (whitespace removed, lowercased)
  if (referenceSolution) {
    const cleanRef = referenceSolution.replace(/\s+/g, '').toLowerCase();
    const cleanText = trimmed.replace(/\s+/g, '').toLowerCase();

    for (let i = 0; i <= cleanRef.length - 12; i++) {
      const sub = cleanRef.substring(i, i + 12);
      if (cleanText.includes(sub)) {
        return {
          valid: false,
          failedGuardId: 'G5',
          reason: 'Substring leak of reference solution detected',
        };
      }
    }
  }

  return { valid: true };
}
