/**
 * PLACEHOLDER — Quiz Generator Service
 * -------------------------------------------------------
 * Current: returns hardcoded sample questions by type.
 * Future:  generate questions from source text using OpenAI
 *          or Cognee memory graph.
 *
 * OpenAI integration point:
 *   Send sourceText + quiz_type + num_questions to GPT,
 *   parse JSON response into question objects.
 *
 * Cognee integration point:
 *   Query memory graph for relevant facts,
 *   build questions from retrieved knowledge nodes.
 */

const SAMPLE_MCQ = {
  question_type: 'mcq',
  question_text: 'This is a sample multiple choice question.',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct_answer: 'Option A',
  explanation: 'Placeholder explanation.',
};

const SAMPLE_TRUE_FALSE = {
  question_type: 'true_false',
  question_text: 'This is a sample true/false question. The answer is True.',
  options: ['True', 'False'],
  correct_answer: 'True',
  explanation: 'Placeholder explanation.',
};

const SAMPLE_DIRECT = {
  question_type: 'direct',
  question_text: 'This is a sample direct question. Answer: "Sample Answer".',
  options: null,
  correct_answer: 'Sample Answer',
  explanation: 'Placeholder explanation.',
};

const generate = async ({ sourceText, quiz_type, num_questions, topic }) => {
  console.log('[QuizGeneratorService] Placeholder — returning sample questions.');

  const count = Math.max(1, Math.min(num_questions, 20));
  const questions = [];

  for (let i = 0; i < count; i++) {
    if (quiz_type === 'mcq')        questions.push({ ...SAMPLE_MCQ });
    else if (quiz_type === 'true_false') questions.push({ ...SAMPLE_TRUE_FALSE });
    else if (quiz_type === 'direct')    questions.push({ ...SAMPLE_DIRECT });
    else {
      // mixed — cycle through types
      const types = [SAMPLE_MCQ, SAMPLE_TRUE_FALSE, SAMPLE_DIRECT];
      questions.push({ ...types[i % 3] });
    }
    questions[i].question_text = `[Q${i + 1}] ${questions[i].question_text}`;
  }

  return questions;
};

module.exports = { generate };
