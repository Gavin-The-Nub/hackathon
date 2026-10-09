import { isEqual } from '../../src/core/harness/compare';
import { generateArgs } from '../../src/core/harness/generators';
import { mulberry32 } from '../../src/core/harness/prng';
import { runProblemTests } from '../../src/core/harness/run-tests';
import { Problem } from '../../src/core/types';

describe('Core Harness', () => {
  describe('mulberry32 PRNG', () => {
    it('produces deterministic pseudorandom numbers for a given seed', () => {
      const prng1 = mulberry32(12345);
      const prng2 = mulberry32(12345);
      const seq1 = [prng1(), prng1(), prng1()];
      const seq2 = [prng2(), prng2(), prng2()];
      expect(seq1).toEqual(seq2);
      expect(seq1[0]).toBeGreaterThanOrEqual(0);
      expect(seq1[0]).toBeLessThan(1);
    });
  });

  describe('isEqual comparator', () => {
    it('handles primitives correctly', () => {
      expect(isEqual(5, 5)).toBe(true);
      expect(isEqual(5, 6)).toBe(false);
      expect(isEqual('hello', 'hello')).toBe(true);
      expect(isEqual(true, false)).toBe(false);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(NaN, NaN)).toBe(true);
    });

    it('handles arrays and nested objects', () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(isEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] })).toBe(true);
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('respects floatTolerance', () => {
      expect(isEqual(0.1 + 0.2, 0.3, 0.0001)).toBe(true);
      expect(isEqual(0.1, 0.2, 0.05)).toBe(false);
    });
  });

  describe('runProblemTests', () => {
    const mockProblem: Problem = {
      id: 'mock-sum',
      language: 'javascript',
      type: 'write_function',
      primaryConcept: 'loops',
      secondaryConcepts: [],
      title: 'Sum Up To N',
      statement: 'Sum numbers 1 to n',
      starterCode: 'function sumUpTo(n) {}',
      functionName: 'sumUpTo',
      visibleTests: [
        { id: 't1', args: [1], expected: 1 },
        { id: 't2', args: [3], expected: 6 },
        { id: 't3', args: [5], expected: 15 },
      ],
      hiddenTests: {
        count: 5,
        edgeCases: [[0], [10]],
        args: [{ gen: 'intInRange', min: 1, max: 20 }],
      },
      referenceSolution: 'function sumUpTo(n) { let s = 0; for (let i = 1; i <= n; i++) s += i; return s; }',
      requiredConstructs: ['for_loop'],
      prewrittenHints: ['Use a loop', 'Count from 1 to n'],
      conceptNote: 'Loops repeat code',
      commonMistakes: [],
      difficulty: 1,
      order: 1,
    };

    const refFn = (n: number) => {
      let s = 0;
      for (let i = 1; i <= n; i++) s += i;
      return s;
    };

    it('passes completely when userFn matches reference', () => {
      const userFn = (n: number) => (n * (n + 1)) / 2;
      const res = runProblemTests(mockProblem, userFn, refFn, { seed: 42 });
      expect(res.status).toBe('tests_passed');
      expect(res.visible.length).toBe(3);
      expect(res.visible.every((t) => t.status === 'pass')).toBe(true);
      expect(res.hiddenPassed).toBe(5);
      expect(res.firstFailing).toBeNull();
    });

    it('fails visible test on incorrect implementation', () => {
      const userFn = (n: number) => n + 1; // Wrong logic
      const res = runProblemTests(mockProblem, userFn, refFn, { seed: 42 });
      expect(res.status).toBe('tests_failed');
      expect(res.firstFailing).not.toBeNull();
      expect(res.firstFailing?.id).toBe('t1'); // sumUpTo(1) = 2, expected 1
    });

    it('fails hidden test when only visible tests are hardcoded', () => {
      // Hardcodes only visible test answers
      const userFn = (n: number) => {
        if (n === 1) return 1;
        if (n === 3) return 6;
        if (n === 5) return 15;
        return 0; // fails edgeCases [10] or random
      };
      const res = runProblemTests(mockProblem, userFn, refFn, { seed: 42 });
      expect(res.status).toBe('tests_failed');
      expect(res.visible.every((t) => t.status === 'pass')).toBe(true);
      expect(res.firstFailing).not.toBeNull();
      expect(res.firstFailing?.hidden).toBe(true);
    });
  });
});
