import { ArgGenerator, JsonValue } from '../types';

export function intInRange(min: number, max: number, prng: () => number): number {
  return Math.floor(prng() * (max - min + 1)) + min;
}

export function intArray(
  minLen: number,
  maxLen: number,
  min: number,
  max: number,
  prng: () => number
): number[] {
  const len = intInRange(minLen, maxLen, prng);
  const arr: number[] = new Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = intInRange(min, max, prng);
  }
  return arr;
}

export function asciiWord(minLen: number, maxLen: number, prng: () => number): string {
  const len = intInRange(minLen, maxLen, prng);
  let str = '';
  for (let i = 0; i < len; i++) {
    const code = 97 + Math.floor(prng() * 26); // a-z
    str += String.fromCharCode(code);
  }
  return str;
}

export function sentence(minWords: number, maxWords: number, prng: () => number): string {
  const numWords = intInRange(minWords, maxWords, prng);
  const words: string[] = [];
  for (let i = 0; i < numWords; i++) {
    words.push(asciiWord(2, 8, prng));
  }
  return words.join(' ');
}

export function generateArg(gen: ArgGenerator, prng: () => number): JsonValue {
  switch (gen.gen) {
    case 'intInRange':
      return intInRange(gen.min, gen.max, prng);
    case 'intArray':
      return intArray(gen.minLen, gen.maxLen, gen.min, gen.max, prng);
    case 'asciiWord':
      return asciiWord(gen.minLen, gen.maxLen, prng);
    case 'sentence':
      return sentence(gen.minWords, gen.maxWords, prng);
    default:
      throw new Error(`Unknown generator: ${(gen as any).gen}`);
  }
}

export function generateArgs(generators: ArgGenerator[], prng: () => number): JsonValue[] {
  return generators.map((g) => generateArg(g, prng));
}
