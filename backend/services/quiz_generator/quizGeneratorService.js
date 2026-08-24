/**
 * Quiz Generator Service — powered by Google Gemini
 * -------------------------------------------------------
 * Generates quiz questions from source text or topic using Gemini.
 *
 * Requires GEMINI_API_KEY in environment variables.
 * Get one free at: https://aistudio.google.com/apikey
 *
 * Supports: mcq, true_false, direct, mixed
 */

const { GoogleGenAI } = require('@google/genai');

const MODEL = 'gemini-2.5-flash';

let ai;
function getClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

/**
 * Generate quiz questions using Gemini.
 * @param {object} params
 * @param {string|null} params.sourceText - Extracted text from a note (can be null if topic provided)
 * @param {string} params.quiz_type - 'mcq' | 'true_false' | 'direct' | 'mixed'
 * @param {number} params.num_questions - Number of questions to generate (1-20)
 * @param {string|null} params.topic - Optional topic/topic name
 * @returns {Promise<Array>} Array of question objects
 */
const generate = async ({ sourceText, quiz_type, num_questions, topic }) => {
  const count = Math.max(1, Math.min(num_questions || 5, 20));

  // If no source text and no topic, fall back to sample questions
  if (!sourceText && !topic) {
    console.log('[QuizGeneratorService] No source text or topic provided, returning sample questions.');
    return generateSampleQuestions(quiz_type, count);
  }

  // If API key is not configured, fall back to sample questions
  if (!process.env.GEMINI_API_KEY) {
    console.log('[QuizGeneratorService] GEMINI_API_KEY not set, falling back to sample questions.');
    return generateSampleQuestions(quiz_type, count);
  }

  const client = getClient();

  // Build the type instructions
  let typeInstructions;
  switch (quiz_type) {
    case 'mcq':
      typeInstructions = `Generate ONLY multiple choice questions with exactly 4 options each.
Each question must have exactly one correct answer.`;
      break;
    case 'true_false':
      typeInstructions = `Generate ONLY true/false questions.
Each question must have "True" or "False" as the correct answer.`;
      break;
    case 'direct':
      typeInstructions = `Generate ONLY direct/short-answer questions.
Each question requires a specific short answer (no options).`;
      break;
    default: // mixed
      typeInstructions = `Generate a MIX of question types: multiple choice (with 4 options), true/false, and direct/short-answer questions.
Distribute them roughly evenly.`;
      break;
  }

  const sourceContext = sourceText
    ? `Use the following text as the source material:\n---\n${sourceText.slice(0, 25000)}\n---\n`
    : '';

  const topicContext = topic
    ? `The quiz topic is: "${topic}".\n`
    : '';

  const prompt = `You are an expert quiz maker for students. Generate exactly ${count} quiz questions.

${topicContext}${sourceContext}
${typeInstructions}

IMPORTANT: Return ONLY a valid JSON array (no markdown, no code fences). Each object must have exactly these fields:
- "question_type": "mcq" | "true_false" | "direct" (match the requested type)
- "question_text": the question as a string
- "options": array of option strings for MCQ (4 items), ["True", "False"] for true_false, or null for direct
- "correct_answer": the correct answer as a string
- "explanation": a brief explanation of why this is the correct answer

JSON array:`;

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const rawText = response.text;

    // Try to parse the JSON array
    let questions;
    try {
      questions = JSON.parse(rawText);
    } catch {
      // Try to extract JSON array from the response
      const arrayMatch = rawText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        questions = JSON.parse(arrayMatch[0]);
      } else {
        console.error('[QuizGeneratorService] Failed to parse Gemini response as JSON.');
        return generateSampleQuestions(quiz_type, count);
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('[QuizGeneratorService] Gemini returned empty or invalid questions.');
      return generateSampleQuestions(quiz_type, count);
    }

    // Normalize and validate each question
    const normalized = questions.map((q, i) => ({
      question_type: q.question_type || quiz_type,
      question_text: q.question_text || `[Q${i + 1}] Unnamed question`,
      options: q.options || null,
      correct_answer: q.correct_answer || 'Unknown',
      explanation: q.explanation || null,
    }));

    console.log(`[QuizGeneratorService] Generated ${normalized.length} questions via Gemini.`);
    return normalized.slice(0, count);
  } catch (error) {
    console.error('[QuizGeneratorService] Gemini API error:', error.message);
    return generateSampleQuestions(quiz_type, count);
  }
};

// ── Fallback sample questions (used when Gemini is unavailable) ──

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

function generateSampleQuestions(quiz_type, count) {
  console.log('[QuizGeneratorService] Falling back to sample questions.');
  const questions = [];

  for (let i = 0; i < count; i++) {
    if (quiz_type === 'mcq') questions.push({ ...SAMPLE_MCQ });
    else if (quiz_type === 'true_false') questions.push({ ...SAMPLE_TRUE_FALSE });
    else if (quiz_type === 'direct') questions.push({ ...SAMPLE_DIRECT });
    else {
      const types = [SAMPLE_MCQ, SAMPLE_TRUE_FALSE, SAMPLE_DIRECT];
      questions.push({ ...types[i % 3] });
    }
    questions[i].question_text = `[Q${i + 1}] ${questions[i].question_text}`;
  }

  return questions;
}

module.exports = { generate };
