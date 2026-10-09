import { validateTutorOutput } from '../../src/core/tutor/guards';
import { buildUserPrompt, buildSystemPrompt } from '../../src/core/tutor/prompt';
import { Problem } from '../../src/core/types';

describe('AI Tutor Pipeline', () => {
  const refSolution = 'function sumUpTo(n) { let s = 0; for (let i = 1; i <= n; i++) s += i; return s; }';

  describe('Output Guards (G1 - G6)', () => {
    it('passes compliant tutor responses', () => {
      const goodHint =
        'Look at your loop condition carefully. Notice when your variable stops counting. Could it be off by one?';
      const res = validateTutorOutput(goodHint, refSolution, 'hint');
      expect(res.valid).toBe(true);
    });

    it('rejects markdown code blocks (G1)', () => {
      const bad = 'You should write ```for (let i = 0)```. What do you think?';
      const res = validateTutorOutput(bad, refSolution, 'hint');
      expect(res.valid).toBe(false);
      expect(res.failedGuardId).toBe('G1');
    });

    it('rejects code characters like braces and semicolons (G6)', () => {
      const bad = 'You need a loop { let i = 0; } here?';
      const res = validateTutorOutput(bad, refSolution, 'hint');
      expect(res.valid).toBe(false);
      expect(res.failedGuardId).toBe('G6');
    });

    it('rejects hint that does not end with a question mark (G4)', () => {
      const bad = 'Check your loop condition because it might be stopping too early.';
      const res = validateTutorOutput(bad, refSolution, 'hint');
      expect(res.valid).toBe(false);
      expect(res.failedGuardId).toBe('G4');
    });

    it('rejects text that leaks reference solution substring (G5)', () => {
      // 12+ chars of ref solution: "function sumUpTo" -> "functionsumupto"
      const leak = 'Make sure you use functionsumupto in your code?';
      const res = validateTutorOutput(leak, refSolution, 'hint');
      expect(res.valid).toBe(false);
      expect(res.failedGuardId).toBe('G5');
    });
  });

  describe('Prompt Builder', () => {
    const mockProblem: Problem = {
      id: 'p1',
      language: 'javascript',
      type: 'write_function',
      primaryConcept: 'loops',
      secondaryConcepts: [],
      title: 'Sum',
      statement: 'Add numbers 1 to n',
      starterCode: 'function sumUpTo(n) {}',
      functionName: 'sumUpTo',
      visibleTests: [],
      hiddenTests: { args: [], edgeCases: [] },
      referenceSolution: refSolution,
      requiredConstructs: ['for_loop'],
      prewrittenHints: ['hint 1', 'hint 2'],
      conceptNote: 'Loops repeat actions.',
      commonMistakes: [],
      difficulty: 1,
      order: 1,
    };

    it('builds system and user prompts without crashing', () => {
      const sys = buildSystemPrompt('javascript');
      expect(sys).toContain('You are a patient coding tutor');

      const userPrompt = buildUserPrompt({
        problem: mockProblem,
        action: 'hint',
        hintLevel: 1,
        learnerCode: 'function sumUpTo(n) { return 0; }',
      });
      expect(userPrompt).toContain('PROBLEM: Add numbers 1 to n');
      expect(userPrompt).toContain('TASK:');
      expect(userPrompt).toContain('LEARNER CODE:');
    });
  });
});
