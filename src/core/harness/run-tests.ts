import { HIDDEN_TEST_COUNT } from '../../config/constants';
import { Problem, RunResult, TestResult, JsonValue } from '../types';
import { isEqual } from './compare';
import { generateArgs } from './generators';
import { mulberry32 } from './prng';

export function runProblemTests(
  problem: Problem,
  userFn: (...args: any[]) => any,
  refFn: (...args: any[]) => any,
  options?: {
    seed?: number;
    runId?: string;
    printed?: string;
  }
): RunResult {
  const startTime = Date.now();
  const seed = options?.seed ?? Math.floor(Math.random() * 1000000);
  const runId = options?.runId ?? `run-${Date.now()}`;
  const printed = options?.printed ?? '';

  const visibleResults: TestResult[] = [];
  let firstFailing: TestResult | null = null;

  // 1. Run visible tests
  for (const tc of problem.visibleTests) {
    let actual: any = null;
    let status: TestResult['status'] = 'pass';
    let errorMessage: string | undefined;

    try {
      actual = userFn(...tc.args);
      if (!isEqual(actual, tc.expected, problem.floatTolerance)) {
        status = 'fail';
      }
    } catch (err: any) {
      status = 'error';
      errorMessage = err?.message || String(err);
    }

    const testRes: TestResult = {
      id: tc.id,
      hidden: false,
      status,
      args: tc.args,
      expected: tc.expected,
      actual: actual !== undefined ? actual : null,
      errorMessage,
    };

    visibleResults.push(testRes);
    if (status !== 'pass' && !firstFailing) {
      firstFailing = testRes;
    }
  }

  // If any visible test failed, return immediately without running hidden tests
  if (firstFailing) {
    return {
      runId,
      seed,
      status: 'tests_failed',
      visible: visibleResults,
      hiddenPassed: 0,
      hiddenTotal: 0,
      firstFailing,
      printed,
      durationMs: Date.now() - startTime,
    };
  }

  // 2. Run hidden tests
  const prng = mulberry32(seed);
  const totalHiddenCount = problem.hiddenTests.count ?? HIDDEN_TEST_COUNT;
  const edgeCases = problem.hiddenTests.edgeCases ?? [];

  let hiddenPassed = 0;
  let hiddenTotal = 0;
  let firstFailingHidden: TestResult | null = null;

  // Run edge cases first
  for (let i = 0; i < edgeCases.length; i++) {
    const args = edgeCases[i];
    hiddenTotal++;
    let expected: any;
    let actual: any;
    let status: TestResult['status'] = 'pass';
    let errorMessage: string | undefined;

    try {
      expected = refFn(...args);
    } catch (err: any) {
      expected = null;
    }

    try {
      actual = userFn(...args);
      if (!isEqual(actual, expected, problem.floatTolerance)) {
        status = 'fail';
      }
    } catch (err: any) {
      status = 'error';
      errorMessage = err?.message || String(err);
    }

    if (status === 'pass') {
      hiddenPassed++;
    } else if (!firstFailingHidden) {
      firstFailingHidden = {
        id: `h-edge-${i + 1}`,
        hidden: true,
        status,
        args,
        expected,
        actual: actual !== undefined ? actual : null,
        errorMessage,
      };
    }
  }

  // Run generated hidden samples
  const remainingCount = Math.max(0, totalHiddenCount - edgeCases.length);
  for (let i = 0; i < remainingCount; i++) {
    const args = generateArgs(problem.hiddenTests.args, prng);
    hiddenTotal++;
    let expected: any;
    let actual: any;
    let status: TestResult['status'] = 'pass';
    let errorMessage: string | undefined;

    try {
      expected = refFn(...args);
    } catch (err: any) {
      expected = null;
    }

    try {
      actual = userFn(...args);
      if (!isEqual(actual, expected, problem.floatTolerance)) {
        status = 'fail';
      }
    } catch (err: any) {
      status = 'error';
      errorMessage = err?.message || String(err);
    }

    if (status === 'pass') {
      hiddenPassed++;
    } else if (!firstFailingHidden) {
      firstFailingHidden = {
        id: `h-gen-${i + 1}`,
        hidden: true,
        status,
        args,
        expected,
        actual: actual !== undefined ? actual : null,
        errorMessage,
      };
    }
  }

  const allHiddenPassed = hiddenPassed === hiddenTotal;

  return {
    runId,
    seed,
    status: allHiddenPassed ? 'tests_passed' : 'tests_failed',
    visible: visibleResults,
    hiddenPassed,
    hiddenTotal,
    firstFailing: firstFailingHidden,
    printed,
    durationMs: Date.now() - startTime,
  };
}
