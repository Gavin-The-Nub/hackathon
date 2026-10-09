jest.mock('../../src/services/tutor-service', () => ({
  getOrInitLlama: jest.fn().mockResolvedValue(null),
}));

import { PYTHON_PROBLEMS } from '../../src/content/python-data';
import { getLesson } from '../../src/content/lessons';
import { ConceptId } from '../../src/core/types';
import { checkConstructs } from '../../src/core/genuine/constructs';
import { getOfflineFaqAnswer } from '../../src/services/lesson-tutor-service';

// Load skulpt bundle to test offline skulpt execution in Node
const { SKULPT_CORE_JS, SKULPT_STDLIB_JS } = require('../../src/services/skulpt-bundle');

describe('Python Curriculum and Offline Skulpt Engine', () => {
  const UNITS: ConceptId[] = [
    'variables_types',
    'conditionals',
    'loops',
    'functions',
    'arrays_lists',
  ];

  it('has 25 problems properly partitioned across all 5 units (5 per unit)', () => {
    expect(PYTHON_PROBLEMS.length).toBe(25);

    UNITS.forEach((concept) => {
      const unitProbs = PYTHON_PROBLEMS.filter((p) => p.primaryConcept === concept);
      expect(unitProbs.length).toBe(5);
      unitProbs.forEach((p) => {
        expect(p.language).toBe('python');
        expect(p.functionName).toBeTruthy();
        expect(p.starterCode).toContain('def ');
        expect(p.referenceSolution).toContain('def ');
        expect(p.visibleTests.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  it('provides rich Python lessons for all 5 concepts with Python-specific analogies and pitfalls', () => {
    UNITS.forEach((concept) => {
      const lesson = getLesson(concept, 'python');
      expect(lesson).toBeDefined();
      expect(lesson.language).toBe('python');
      expect(lesson.title).toBeTruthy();
      expect(lesson.analogy.description.length).toBeGreaterThan(20);
      expect(lesson.codeExamples.length).toBeGreaterThanOrEqual(1);
      expect(lesson.commonPitfalls.length).toBeGreaterThanOrEqual(1);
      expect(lesson.quickCheck.options.length).toBeGreaterThanOrEqual(3);
      expect(lesson.offlineFaq.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('answers common Python FAQ questions offline', () => {
    const indentAnswer = getOfflineFaqAnswer('variables_types', 'Why does indentation matter in Python?', 'python');
    expect(indentAnswer).not.toBeNull();
    expect(indentAnswer).toContain('indentation');

    const elifAnswer = getOfflineFaqAnswer('conditionals', 'What does elif stand for?', 'python');
    expect(elifAnswer).not.toBeNull();
    expect(elifAnswer).toContain('elif');

    const rangeAnswer = getOfflineFaqAnswer('loops', 'How does range() work in Python?', 'python');
    expect(rangeAnswer).not.toBeNull();
    expect(rangeAnswer).toContain('range');
  });

  it('validates python constructs accurately', () => {
    const validLoopCode = 'def count_evens(nums):\n    total = 0\n    for n in nums:\n        if n % 2 == 0:\n            total += 1\n    return total\n';
    const loopResult = checkConstructs(validLoopCode, 'count_evens', ['for_loop'], 'py-test-1', 'python');
    expect(loopResult.label).toBe('GENUINE');

    const noLoopCode = 'def count_evens(nums):\n    return 42\n';
    const noLoopResult = checkConstructs(noLoopCode, 'count_evens', ['for_loop'], 'py-test-2', 'python');
    expect(noLoopResult.label).toBe('CORRECT_NOT_GENUINE');
    expect(noLoopResult.missingConstruct).toBe('for_loop');
  });

  it('executes python reference solutions with bundled Skulpt offline engine', async () => {
    // Setup Skulpt environment in Node vm
    const vm = require('vm');
    const ctx: any = {
      console,
      setTimeout,
      clearTimeout,
    };
    ctx.window = ctx;
    ctx.self = ctx;
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext('var window = this; var global = this; var self = this;', ctx);
    vm.runInContext(SKULPT_CORE_JS, ctx);
    vm.runInContext(SKULPT_STDLIB_JS, ctx);

    const Sk = ctx.Sk;
    expect(Sk).toBeDefined();
    expect(typeof Sk.importMainWithBody).toBe('function');

    // Run first 3 python problems as smoke test in Skulpt
    const sampleProblems = PYTHON_PROBLEMS.slice(0, 3);
    for (const prob of sampleProblems) {
      for (const t of prob.visibleTests) {
        const harness = `
${prob.referenceSolution}
__result__ = ${prob.functionName}(*${JSON.stringify(t.args)})
`;
        let output = '';
        Sk.configure({
          output: (txt: string) => { output += txt; },
          read: (x: string) => {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
              throw new Error('File not found: ' + x);
            }
            return Sk.builtinFiles['files'][x];
          },
          __future__: Sk.python3,
        });

        const resPromise = Sk.misceval.asyncToPromise(() => {
          return Sk.importMainWithBody('<stdin>', false, harness, true);
        });

        const mod = await resPromise;
        const pyRes = mod.$d['__result__'];
        const jsRes = Sk.ffi.remapToJs(pyRes);
        expect(jsRes).toEqual(t.expected);
      }
    }
  });
});
