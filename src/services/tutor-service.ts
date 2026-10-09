import { AI, MODEL_UNLOAD_AFTER_BACKGROUND_MS } from '../config/constants';
import { MODEL_CONFIG } from '../config/model';
import { Problem, RunError, TestResult, TutorAction } from '../core/types';
import { getPrewrittenHint, getExplainFallback } from '../core/tutor/fallback';
import { buildSystemPrompt, buildUserPrompt } from '../core/tutor/prompt';
import { HINT_EXPLAIN_GRAMMAR } from '../core/tutor/grammar';
import { validateTutorOutput } from '../core/tutor/guards';
import * as FileSystem from 'expo-file-system/legacy';

// Dynamic import or typed handle for llama.rn
let llamaContext: any = null;
let isInitializing = false;

export async function getOrInitLlama(): Promise<any | null> {
  if (llamaContext) return llamaContext;
  if (isInitializing) return null;

  isInitializing = true;
  try {
    const { initLlama } = require('llama.rn');
    const modelPath = `${FileSystem.documentDirectory}${MODEL_CONFIG.filename}`;
    const info = await FileSystem.getInfoAsync(modelPath);

    if (!info.exists) {
      console.log(`Model file not found at ${modelPath}. Using prewritten tutor fallback.`);
      isInitializing = false;
      return null;
    }

    console.log(`Initializing llama.rn from ${modelPath}...`);
    llamaContext = await initLlama({
      model: modelPath,
      n_ctx: AI.nCtx,
      n_threads: AI.nThreads,
      n_gpu_layers: AI.nGpuLayers,
      use_mlock: AI.useMlock,
    });
    console.log('llama.rn initialized successfully!');
    isInitializing = false;
    return llamaContext;
  } catch (err) {
    console.warn('llama.rn initialization failed, falling back to prewritten hints:', err);
    isInitializing = false;
    return null;
  }
}

export interface TutorRequestParams {
  problem: Problem;
  action: TutorAction;
  hintLevel?: 1 | 2 | 3;
  failingTest?: TestResult | null;
  error?: RunError;
  mistakeLearnerText?: string | null;
  learnerCode: string;
  onToken?: (token: string, fullText: string) => void;
}

export interface TutorResponse {
  source: 'ai' | 'prewritten';
  text: string;
  quickText: string;
}

export async function requestTutorHelp(params: TutorRequestParams): Promise<TutorResponse> {
  const {
    problem,
    action,
    hintLevel = 1,
    failingTest,
    error,
    mistakeLearnerText,
    learnerCode,
    onToken,
  } = params;

  // 1. Instant prewritten fallback text
  const quickText =
    action === 'explain'
      ? getExplainFallback(failingTest, error)
      : getPrewrittenHint(problem, hintLevel);

  // 2. Try on-device LLM
  const context = await getOrInitLlama();
  if (!context) {
    return {
      source: 'prewritten',
      text: quickText,
      quickText,
    };
  }

  try {
    const systemPrompt = buildSystemPrompt(problem.language);
    const userPrompt = buildUserPrompt({
      problem,
      action,
      hintLevel,
      failingTest,
      error,
      mistakeLearnerText,
      learnerCode,
    });

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
        temperature: AI.temperature,
        n_predict: AI.nPredict,
        stop: ['<|im_end|>', '<|endoftext|>', '<|im_start|>'],
      },
      (data: { token: string }) => {
        firstTokenReceived = true;
        generatedText += data.token;
        if (onToken) onToken(data.token, generatedText);
      }
    );

    await Promise.race([completionPromise, timeoutPromise]);

    let cleanedText = generatedText.trim();
    // For hints and explanations, sanitize by trimming to the final guiding question mark
    if (action === 'hint' || action === 'explain') {
      const lastQ = cleanedText.lastIndexOf('?');
      if (lastQ > 20) {
        cleanedText = cleanedText.substring(0, lastQ + 1).trim();
      } else if (!cleanedText.endsWith('?')) {
        const sentences = cleanedText.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
        if (sentences.length <= 2 && (cleanedText.endsWith('.') || cleanedText.endsWith('!'))) {
          cleanedText = `${cleanedText} What do you think you should check next?`;
        }
      }

      // If the model produced more than 3 sentences, distill to at most 3 sentences:
      // keep the opening context (up to 2 sentences) and the closing guiding question
      const sentences = cleanedText.match(/[^.!?]+[.!?]+(\s|$)/g);
      if (sentences && sentences.length > 3) {
        const firstTwo = sentences.slice(0, 2).map((s) => s.trim()).join(' ');
        const lastQuestion = sentences[sentences.length - 1].trim();
        cleanedText = `${firstTwo} ${lastQuestion}`.trim();
      }
    }

    console.log(`[AI Tutor] Processed generation (${cleanedText.length} chars):`, JSON.stringify(cleanedText));

    // 3. Post-generation guard validation
    const validation = validateTutorOutput(cleanedText, problem.referenceSolution, action);
    if (!validation.valid) {
      console.warn(`AI tutor output failed guard ${validation.failedGuardId}: ${validation.reason}`);
      return {
        source: 'prewritten',
        text: quickText,
        quickText,
      };
    }

    return {
      source: 'ai',
      text: cleanedText,
      quickText,
    };
  } catch (err) {
    console.log('AI generation aborted or failed, using prewritten fallback:', err);
    return {
      source: 'prewritten',
      text: quickText,
      quickText,
    };
  }
}
