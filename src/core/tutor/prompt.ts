import { AI } from '../../config/constants';
import { Problem, RunError, TestResult, TutorAction } from '../types';

export interface PromptInput {
  problem: Problem;
  action: TutorAction;
  hintLevel?: 1 | 2 | 3;
  failingTest?: TestResult | null;
  error?: RunError;
  mistakeLearnerText?: string | null;
  learnerCode: string;
}

export function buildSystemPrompt(language: string): string {
  const langName = language === 'python' ? 'Python' : 'JavaScript';
  return `You are a patient coding tutor for beginners. You help a learner who is stuck on a small ${langName} problem.

Rules:
- Use plain English with short, simple words.
- Write at most 2 brief sentences, then 1 guiding question (at most 3 sentences total).
- Talk about the failing test or error the learner sees.
- Never write code. Never give the full answer.
- Always end with one guiding question that helps the learner decide their next step.`;
}

export function getTaskInstruction(action: TutorAction, hintLevel?: 1 | 2 | 3): string {
  if (action === 'explain') {
    return 'Explain in plain words what the failing test or error shows: what was expected, what the code gave, and what that suggests. Do not fix it. Write at most 2 brief sentences, and end with one guiding question.';
  }
  if (action === 'coach') {
    return 'Give a brief, encouraging one-sentence coach message.';
  }
  switch (hintLevel) {
    case 1:
      return 'Say what kind of mistake this looks like and which part of the code to check. Do not explain the fix. Write 1 or 2 brief sentences, and end with one guiding question.';
    case 2:
      return 'Explain the idea behind this concept in words, using the concept note. Do not list the steps. Write 1 or 2 brief sentences, and end with one guiding question.';
    case 3:
    default:
      return 'Describe the next step in words. Do not write code. Do not give the final answer. Write 1 or 2 brief sentences, and end with one guiding question.';
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function buildUserPrompt(input: PromptInput): string {
  const { problem, action, hintLevel, failingTest, error, mistakeLearnerText, learnerCode } = input;

  let includeConceptNote = action === 'hint' && hintLevel === 2;
  let statementText = problem.statement;
  let codeLines = learnerCode.split('\n').slice(0, AI.codeLinesMax);

  const assemble = (includeNote: boolean, stmt: string, lines: string[]): string => {
    const parts: string[] = [];
    parts.push(`PROBLEM: ${stmt}`);
    if (includeNote && problem.conceptNote) {
      parts.push(`CONCEPT NOTE: ${problem.conceptNote}`);
    }

    if (failingTest) {
      parts.push(
        `FAILING TEST: input ${JSON.stringify(failingTest.args)}, expected ${JSON.stringify(
          failingTest.expected
        )}, got ${JSON.stringify(failingTest.actual)}`
      );
    } else {
      parts.push('FAILING TEST: none yet');
    }

    if (error) {
      parts.push(`ERROR: ${error.message} (line ${error.line ?? 'unknown'})`);
    }

    if (mistakeLearnerText) {
      parts.push(`MISTAKE TYPE: ${mistakeLearnerText}`);
    }

    parts.push(`LEARNER CODE:\n${lines.join('\n')}`);
    parts.push(`TASK: ${getTaskInstruction(action, hintLevel)}`);

    return parts.join('\n');
  };

  let prompt = assemble(includeConceptNote, statementText, codeLines);

  // If over target, trim in specified order
  if (estimateTokens(prompt) > AI.promptTokenTarget) {
    if (includeConceptNote && hintLevel !== 2) {
      includeConceptNote = false;
      prompt = assemble(includeConceptNote, statementText, codeLines);
    }

    if (estimateTokens(prompt) > AI.promptTokenTarget && statementText.length > 400) {
      statementText = statementText.substring(0, 400) + '...';
      prompt = assemble(includeConceptNote, statementText, codeLines);
    }

    if (estimateTokens(prompt) > AI.promptTokenTarget && codeLines.length > 15) {
      const errorLine = error?.line ?? 1;
      const start = Math.max(0, errorLine - 8);
      codeLines = codeLines.slice(start, start + 15);
      prompt = assemble(includeConceptNote, statementText, codeLines);
    }
  }

  return prompt;
}
