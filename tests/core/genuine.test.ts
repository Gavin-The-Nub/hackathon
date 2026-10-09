import { checkConstructs } from '../../src/core/genuine/constructs';

describe('Genuine Use - AST Construct Verification', () => {
  it('passes code containing the required for_loop', () => {
    const code = `
      function sumUpTo(n) {
        let total = 0;
        for (let i = 1; i <= n; i++) {
          total += i;
        }
        return total;
      }
    `;
    const res = checkConstructs(code, 'sumUpTo', ['for_loop']);
    expect(res.label).toBe('GENUINE');
    expect(res.reason).toBeNull();
  });

  it('fails code lacking the required for_loop (e.g. arithmetic formula trick)', () => {
    const code = `
      function sumUpTo(n) {
        return (n * (n + 1)) / 2;
      }
    `;
    const res = checkConstructs(code, 'sumUpTo', ['for_loop']);
    expect(res.label).toBe('CORRECT_NOT_GENUINE');
    expect(res.reason).toBe('missing_construct');
    expect(res.missingConstruct).toBe('for_loop');
  });

  it('verifies while_loop when required', () => {
    const code = `
      function countdown(n) {
        while (n > 0) {
          n--;
        }
        return n;
      }
    `;
    const res = checkConstructs(code, 'countdown', ['while_loop']);
    expect(res.label).toBe('GENUINE');
  });

  it('handles parse error gracefully with GENUINE_UNVERIFIED', () => {
    const badSyntax = 'function broken(';
    const res = checkConstructs(badSyntax, 'broken', ['for_loop']);
    expect(res.label).toBe('GENUINE_UNVERIFIED');
    expect(res.reason).toBe('parse_failed');
  });

  it('verifies Python for_loop construct', () => {
    const validPython = `def sum_up_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total`;
    const res = checkConstructs(validPython, 'sum_up_to', ['for_loop'], 'run-py', 'python');
    expect(res.label).toBe('GENUINE');
    expect(res.reason).toBeNull();

    const missingLoop = `def sum_up_to(n):\n    return n * (n + 1) // 2`;
    const failRes = checkConstructs(missingLoop, 'sum_up_to', ['for_loop'], 'run-py', 'python');
    expect(failRes.label).toBe('CORRECT_NOT_GENUINE');
    expect(failRes.missingConstruct).toBe('for_loop');
  });
});
