import { JsonValue } from '../types';

export function isEqual(actual: any, expected: any, floatTolerance?: number): boolean {
  if (typeof actual === 'number' && typeof expected === 'number') {
    if (Object.is(actual, expected)) {
      return true;
    }
    if (Number.isNaN(actual) && Number.isNaN(expected)) {
      return true;
    }
    if (floatTolerance !== undefined && floatTolerance > 0) {
      return Math.abs(actual - expected) <= floatTolerance;
    }
    return actual === expected;
  }

  if (actual === expected) {
    return true;
  }

  if (actual === null || expected === null || actual === undefined || expected === undefined) {
    return actual === expected;
  }

  if (typeof actual !== typeof expected) {
    return false;
  }

  if (Array.isArray(actual)) {
    if (!Array.isArray(expected)) return false;
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < actual.length; i++) {
      if (!isEqual(actual[i], expected[i], floatTolerance)) {
        return false;
      }
    }
    return true;
  }

  if (typeof actual === 'object') {
    if (Array.isArray(expected)) return false;
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (actualKeys.length !== expectedKeys.length) return false;
    for (const key of actualKeys) {
      if (!Object.prototype.hasOwnProperty.call(expected, key)) return false;
      if (!isEqual(actual[key], expected[key], floatTolerance)) {
        return false;
      }
    }
    return true;
  }

  return false;
}
