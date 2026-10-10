/**
 * Adversarial Prompt Injection & Jailbreak Guardrail for LOCODE AI Tutor.
 *
 * Enforces strict boundary defense:
 * 1. Pre-LLM heuristic & pattern inspection against prompt injection, role hijacking,
 *    system prompt leakage, and non-programming requests (e.g. baking recipes, essays).
 * 2. Post-LLM output verification to ensure off-topic content is never emitted.
 */

export interface GuardInspectionResult {
  isAllowed: boolean;
  reason?: string;
  safeResponse?: string;
}

export const SAFE_TUTOR_REFUSAL =
  "I am your LOCODE AI coding tutor and can only assist with programming, code logic, syntax, and debugging. Let me know what code or error you'd like help with!";

/**
 * Regex patterns identifying prompt injection, jailbreak, and instruction overrides
 */
const INJECTION_PATTERNS = [
  // Instruction override attempts
  /ignore\s+(all\s+|previous\s+|prior\s+|earlier\s+|above\s+|system\s+)?instructions/i,
  /disregard\s+(all\s+|previous\s+|prior\s+|earlier\s+|system\s+)?(instructions|rules|prompts|guidelines)/i,
  /forget\s+(all\s+|everything\s+|previous\s+|prior\s+|earlier\s+)?(instructions|rules|prompts|guidelines|above)/i,
  /override\s+(all\s+|system\s+|prompt\s+|instructions\s+|rules\s+|safety\s+|guard\s+)?(system|rules|safety|guidelines)/i,
  /bypass\s+(all\s+|system\s+|prompt\s+|instructions\s+|rules\s+|safety\s+|filter\s+)?(safety|filters|rules|guidelines)/i,
  /reset\s+(instructions|system|rules|persona)/i,

  // Role hijacking and persona changing
  /(you are now|act as|pretend to be|roleplay as|switch to)\s+(a\s+|an\s+)?(unrestricted|unfiltered|jailbroken|free|dan|chef|baker|cook|pirate|storyteller|girlfriend|boyfriend|therapist|poet)/i,
  /from now on you (are|will|must)/i,
  /\bjailbreak\b/i,
  /\bDAN\b(\s+mode)?/i,

  // System prompt leakage
  /(print|reveal|show|display|repeat|dump)\s+(all\s+|your\s+|initial\s+)*(system\s+prompt|instructions|directives|rules)/i,
  /system\s+prompt\s+dump/i,
  /what (is|are) your (system\s+prompt|initial instructions)/i,
];

/**
 * Regex patterns identifying explicit non-programming requests
 */
const OFF_TOPIC_PATTERNS = [
  // Recipes and cooking
  /\brecipe\s+for\b/i,
  /\bhow\s+to\s+(bake|cook|make)\b.*(pie|cake|cookie|cookies|pizza|pasta|bread|soup|pancake|pancakes|dinner|meal|muffin|muffins)/i,
  /\b(ingredients|baking|cooking)\s+(for|instructions)\b/i,
  /\bpreheat\s+(the\s+)?oven\b/i,

  // Creative non-code writing
  /\bwrite\s+(a\s+|an\s+)?(poem|song|lyrics|essay|story|love letter)\b/i,

  // Politics / Elections / Medical advice
  /\b(medical\s+advice|diagnose\s+my)\b/i,
  /\b(who\s+won\s+the\s+.*election|presidential\s+election)\b/i,
];

/**
 * Output red flags that indicate an LLM may have complied with an injection
 */
const OUTPUT_LEAK_PATTERNS = [
  /\b(preheat\s+oven|tablespoon|teaspoon|cups\s+of\s+flour|baking\s+powder|degrees\s+(F|C|fahrenheit))\b/i,
  /\b(recipe\s+for|here\s+is\s+the\s+recipe|ingredients:)\b/i,
  /\b(once\s+upon\s+a\s+time|roses\s+are\s+red)\b/i,
];

/**
 * Inspects user input (question or code comments) for adversarial attacks or off-topic prompts.
 */
export function inspectTutorQuery(userPrompt: string, userCode: string = ''): GuardInspectionResult {
  const combined = `${userPrompt}\n${userCode}`.trim();

  // 1. Check for prompt injection & jailbreak patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(combined)) {
      return {
        isAllowed: false,
        reason: 'Prompt injection or instruction override attempt detected',
        safeResponse: SAFE_TUTOR_REFUSAL,
      };
    }
  }

  // 2. Check for off-topic non-programming queries
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(userPrompt)) {
      return {
        isAllowed: false,
        reason: 'Off-topic non-programming request detected',
        safeResponse: SAFE_TUTOR_REFUSAL,
      };
    }
  }

  return { isAllowed: true };
}

/**
 * Verifies that the LLM output is strictly programming-related and has not leaked off-topic responses.
 */
export function verifyTutorOutput(output: string): string {
  const trimmed = output.trim();
  for (const pattern of OUTPUT_LEAK_PATTERNS) {
    if (pattern.test(trimmed)) {
      return SAFE_TUTOR_REFUSAL;
    }
  }
  return trimmed;
}
