import { ConceptId, LanguageId } from '../core/types';
import { LESSONS } from '../content/lessons';
import { getOrInitLlama } from './tutor-service';
import { AI } from '../config/constants';

export interface AskLessonQuestionParams {
  conceptId: ConceptId;
  question: string;
  language?: LanguageId;
  onToken?: (token: string, fullText: string) => void;
}

export interface LessonQuestionResponse {
  source: 'ai' | 'knowledge_base' | 'fallback';
  answer: string;
}

/**
 * Searches the lesson's pre-authored offline knowledge base for an immediate match
 */
export function getOfflineFaqAnswer(conceptId: ConceptId, question: string): string | null {
  const lesson = LESSONS[conceptId];
  if (!lesson || !lesson.offlineFaq || lesson.offlineFaq.length === 0) return null;

  const qLower = question.toLowerCase().trim();

  // 1. Direct or multi-keyword match
  for (const faq of lesson.offlineFaq) {
    for (const pattern of faq.questionPatterns) {
      if (qLower.includes(pattern.toLowerCase())) {
        return faq.answer;
      }
    }
  }

  return null;
}

/**
 * Provides an intelligent fallback answer based on the lesson's conceptual fundamentals
 */
export function getDefaultConceptAnswer(conceptId: ConceptId, question: string): string {
  const lesson = LESSONS[conceptId];
  if (!lesson) {
    return 'In programming, we build software by giving the computer small, exact instructions step by step. Try writing a small test line in the editor to see how it behaves!';
  }

  return (
    `Great question about ${lesson.title}! ${lesson.analogy.description} ` +
    `Remember: in ${lesson.language}, practice is the fastest way to understand. Tap "Ready to Code" below to try it out hands-on!`
  );
}

/**
 * Asks the on-device AI tutor a question about the current lesson
 */
export async function askLessonTutor(
  params: AskLessonQuestionParams
): Promise<LessonQuestionResponse> {
  const { conceptId, question, language = 'javascript', onToken } = params;
  const lesson = LESSONS[conceptId] || LESSONS.variables_types;

  // 1. Check offline knowledge base first for instant answers if available
  const faqAnswer = getOfflineFaqAnswer(conceptId, question);

  // 2. Try on-device Llama model
  try {
    const context = await getOrInitLlama();
    if (context) {
      const systemPrompt =
        `You are a patient, encouraging coding teacher for complete beginners with no prior programming knowledge. ` +
        `The learner is reading the lesson on "${lesson.title}" in ${language}.\n` +
        `Rules:\n` +
        `- Write in plain, simple English at a 12-year-old reading level.\n` +
        `- Keep your explanation concise (at most 3 short sentences).\n` +
        `- Use a relatable everyday analogy if helpful.\n` +
        `- Never write long code blocks or confusing technical jargon.\n` +
        `- End with an encouraging tip for the beginner.`;

      const userPrompt =
        `LESSON: ${lesson.title}\n` +
        `ANALOGY: ${lesson.analogy.title} - ${lesson.analogy.description}\n` +
        `LEARNER QUESTION: ${question}\n` +
        `TASK: Answer the learner's question directly, simply, and warmly.`;

      const fullPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${userPrompt}<|im_end|>\n<|im_start|>assistant\n`;

      let generatedText = '';
      let firstTokenReceived = false;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          if (!firstTokenReceived) {
            reject(new Error('First token timeout'));
          }
        }, AI.firstTokenTimeoutMs)
      );

      const completionPromise = context.completion(
        {
          prompt: fullPrompt,
          temperature: 0.4,
          n_predict: 140,
          stop: ['<|im_end|>', '<|endoftext|>', '<|im_start|>'],
        },
        (data: { token: string }) => {
          firstTokenReceived = true;
          generatedText += data.token;
          if (onToken) onToken(data.token, generatedText);
        }
      );

      await Promise.race([completionPromise, timeoutPromise]);

      const cleaned = generatedText.trim();
      if (cleaned.length > 15) {
        return {
          source: 'ai',
          answer: cleaned,
        };
      }
    }
  } catch (err) {
    console.log('[Lesson Tutor] AI generation skipped or timed out, using knowledge base');
  }

  // 3. Fallback to knowledge base or concept summary
  if (faqAnswer) {
    return {
      source: 'knowledge_base',
      answer: faqAnswer,
    };
  }

  return {
    source: 'fallback',
    answer: getDefaultConceptAnswer(conceptId, question),
  };
}
