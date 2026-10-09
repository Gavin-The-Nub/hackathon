export type JsonValue =
  | null | boolean | number | string
  | JsonValue[] | { [key: string]: JsonValue };

export type LanguageId = 'javascript' | 'python';

export type ConceptId =
  | 'variables_types' | 'operators' | 'conditionals' | 'loops'
  | 'functions' | 'arrays_lists' | 'strings' | 'reading_fixing_code';

export type ProblemType = 'write_function' | 'predict_output' | 'fix_code' | 'parsons';

export type RequiredConstruct = 'for_loop' | 'while_loop' | 'any_loop' | 'recursion';

export type ArgGenerator =
  | { gen: 'intInRange'; min: number; max: number }
  | { gen: 'intArray'; minLen: number; maxLen: number; min: number; max: number }
  | { gen: 'asciiWord'; minLen: number; maxLen: number }
  | { gen: 'sentence'; minWords: number; maxWords: number };

export interface TestCase {
  id: string;                 // 't1', 't2', ...
  args: JsonValue[];
  expected: JsonValue;
}

export interface HiddenTestSpec {
  count?: number;             // default HIDDEN_TEST_COUNT (20)
  args: ArgGenerator[];       // one generator per positional argument
  edgeCases: JsonValue[][];   // each entry is a full args array; always run first
}

export interface CommonMistake {
  tag: string;                // key into mistakes map
  variantCode: string;        // buggy implementation showing the mistake. NEVER sent to model (H1)
}

export interface Problem {
  id: string;                 // e.g. 'js-loops-01'
  language: LanguageId;
  type: ProblemType;
  primaryConcept: ConceptId;
  secondaryConcepts: ConceptId[];
  title: string;
  statement: string;          // plain paragraphs and inline `code` only
  example?: string;
  starterCode: string;
  functionName: string;
  visibleTests: TestCase[];
  hiddenTests: HiddenTestSpec;
  floatTolerance?: number;    // absolute tolerance for number comparison
  referenceSolution: string;  // NEVER sent to the model (H1). Must use required constructs
  requiredConstructs: RequiredConstruct[];
  prewrittenHints: string[];  // 2 or 3 entries; index = hint level - 1
  conceptNote: string;        // 150 words or fewer
  commonMistakes: CommonMistake[];
  difficulty: 1 | 2 | 3;
  order: number;              // order within its stage
  variantOf?: string;         // base problem id when this is a practice variant
}

export type TestStatus = 'pass' | 'fail' | 'error' | 'timeout';

export interface TestResult {
  id: string;
  hidden: boolean;
  status: TestStatus;
  args: JsonValue[];
  expected: JsonValue;
  actual: JsonValue | null;
  errorMessage?: string;
}

export type RunStatus = 'tests_passed' | 'tests_failed' | 'error' | 'timeout';

export interface RunError {
  kind: 'syntax' | 'reference' | 'type' | 'runtime' | 'missing_function';
  message: string;            // already translated to plain words
  line?: number;
}

export interface RunResult {
  runId: string;
  seed: number;
  status: RunStatus;
  visible: TestResult[];
  hiddenPassed: number;
  hiddenTotal: number;
  firstFailing: TestResult | null;  // first failing visible test, else first failing hidden test
  printed: string;                  // capped at 4000 characters
  error?: RunError;
  mistakeTag?: string | null;       // FR-MISTAKE-01..02
  durationMs: number;
}

export type GenuineLabel =
  | 'GENUINE' | 'GENUINE_UNVERIFIED' | 'CORRECT_NOT_GENUINE' | 'NOT_CHECKED';

export type GenuineReason =
  | 'missing_construct' | 'loop_not_doing_work'
  | 'unsupported_structure' | 'parse_failed' | 'budget_exceeded' | null;

export interface GenuineResult {
  runId: string;
  label: GenuineLabel;
  reason: GenuineReason;
  missingConstruct?: RequiredConstruct;
  loops?: { id: number; scaled: boolean; unchangedRatio: number; genuine: boolean }[];
}

export type CompletionKind = 'first_try' | 'retries' | 'hints' | 'not_genuine';
export type AttemptState = 'open' | 'completed' | 'abandoned';
export type TutorAction = 'hint' | 'explain' | 'coach';
export type TutorState = 'no_model' | 'downloading' | 'paused' | 'ready' | 'failed' | 'out_of_storage';
