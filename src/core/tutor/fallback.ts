import { Problem, RunError, TestResult } from '../types';

export function getPrewrittenHint(problem: Problem, hintLevel: 1 | 2 | 3): string {
  const index = Math.max(0, Math.min(hintLevel - 1, problem.prewrittenHints.length - 1));
  return problem.prewrittenHints[index] ?? 'Review the problem statement and test cases carefully.';
}

export function getExplainFallback(
  failingTest?: TestResult | null,
  error?: RunError
): string {
  if (error) {
    return `Your code ran into an error: ${error.message}. Check line ${error.line ?? '1'}.`;
  }
  if (failingTest) {
    const inputStr = JSON.stringify(failingTest.args);
    const expectedStr = JSON.stringify(failingTest.expected);
    const actualStr = JSON.stringify(failingTest.actual);
    return `When given ${inputStr}, your code returned ${actualStr}, but expected ${expectedStr}. Check how your function handles this input.`;
  }
  return 'Review your logic to make sure it handles all cases.';
}
