jest.mock('../../src/services/tutor-service', () => ({
  getOrInitLlama: jest.fn().mockResolvedValue(null),
}));

import { LESSONS } from '../../src/content/lessons';
import { ConceptId } from '../../src/core/types';
import {
  getOfflineFaqAnswer,
  getDefaultConceptAnswer,
  askLessonTutor,
} from '../../src/services/lesson-tutor-service';

describe('Lesson Content & Pedagogical Structure', () => {
  const REQUIRED_CONCEPTS: ConceptId[] = [
    'variables_types',
    'conditionals',
    'loops',
    'functions',
    'arrays_lists',
  ];

  it('has comprehensive lessons for all core concepts', () => {
    REQUIRED_CONCEPTS.forEach((conceptId) => {
      const lesson = LESSONS[conceptId];
      expect(lesson).toBeDefined();
      expect(lesson.title).toBeTruthy();
      expect(lesson.analogy.title).toBeTruthy();
      expect(lesson.analogy.description.length).toBeGreaterThan(20);
      expect(lesson.conceptsExplained.length).toBeGreaterThanOrEqual(2);
      expect(lesson.codeExamples.length).toBeGreaterThanOrEqual(1);
      expect(lesson.commonPitfalls.length).toBeGreaterThanOrEqual(1);
      expect(lesson.quickCheck.options.length).toBeGreaterThanOrEqual(3);
      expect(lesson.quickCheck.correctIndex).toBeGreaterThanOrEqual(0);
      expect(lesson.quickCheck.correctIndex).toBeLessThan(lesson.quickCheck.options.length);
      expect(lesson.suggestedQuestions.length).toBeGreaterThanOrEqual(3);
      expect(lesson.offlineFaq.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('provides matching FAQ answers for common beginner questions offline', () => {
    const constLetAnswer = getOfflineFaqAnswer('variables_types', 'What is the difference between const and let?');
    expect(constLetAnswer).not.toBeNull();
    expect(constLetAnswer).toContain('const');
    expect(constLetAnswer).toContain('let');

    const ifElseAnswer = getOfflineFaqAnswer('conditionals', 'when should I use if vs else?');
    expect(ifElseAnswer).not.toBeNull();
    expect(ifElseAnswer).toContain('condition');

    const loopForeverAnswer = getOfflineFaqAnswer('loops', 'What is an infinite loop?');
    expect(loopForeverAnswer).not.toBeNull();
    expect(loopForeverAnswer).toContain('forever');

    const returnAnswer = getOfflineFaqAnswer('functions', 'why do I need a return statement?');
    expect(returnAnswer).not.toBeNull();
    expect(returnAnswer).toContain('return');

    const indexZeroAnswer = getOfflineFaqAnswer('arrays_lists', 'Why do arrays start at index 0?');
    expect(indexZeroAnswer).not.toBeNull();
    expect(indexZeroAnswer).toContain('0');
  });

  it('provides an encouraging default concept answer if question is novel', () => {
    const answer = getDefaultConceptAnswer('variables_types', 'Is a variable like a pocket in a backpack?');
    expect(answer).toContain('Variables & Data Types');
    expect(answer).toContain('storage box');
  });

  it('askLessonTutor returns an offline answer seamlessly without network', async () => {
    const result = await askLessonTutor({
      conceptId: 'variables_types',
      question: 'What is const vs let?',
    });

    expect(result).toBeDefined();
    expect(result.answer.length).toBeGreaterThan(10);
    expect(['ai', 'knowledge_base', 'fallback']).toContain(result.source);
  });
});
