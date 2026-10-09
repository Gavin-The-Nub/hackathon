import { CommonMistake, Problem, RunError, TestResult } from '../types';
import { isEqual } from '../harness/compare';

export function classifyRuntimeError(error?: RunError): string {
  if (!error) return 'unknown';
  switch (error.kind) {
    case 'syntax':
      return 'syntax_error';
    case 'reference':
    case 'missing_function':
      return 'undefined_name';
    case 'type':
      return 'type_error';
    case 'runtime':
      return 'runtime_error';
  }
}

export function classifyMistake(
  problem: Problem,
  failingTests: TestResult[],
  executeVariantFn: (variantCode: string, functionName: string, args: any[]) => any,
  timeout = false
): string {
  if (timeout) {
    return 'possible_infinite_loop';
  }

  if (!failingTests || failingTests.length === 0) {
    return 'unknown';
  }

  // Take up to 5 failing test inputs
  const sampleFailing = failingTests.slice(0, 5);

  for (const cm of problem.commonMistakes) {
    let allMatched = true;
    for (const test of sampleFailing) {
      try {
        const variantOutput = executeVariantFn(cm.variantCode, problem.functionName, test.args);
        if (!isEqual(variantOutput, test.actual, problem.floatTolerance)) {
          allMatched = false;
          break;
        }
      } catch (err) {
        allMatched = false;
        break;
      }
    }

    if (allMatched) {
      return cm.tag;
    }
  }

  return 'unknown';
}
