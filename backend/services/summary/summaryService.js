/**
 * AI Summary Service — powered by Google Gemini
 * -------------------------------------------------------
 * Sends extracted text to Gemini and returns a structured summary.
 *
 * Requires GEMINI_API_KEY in environment variables.
 * Get one free at: https://aistudio.google.com/apikey
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
 * Summarize extracted text using Gemini.
 * @param {string} text - The extracted text from a document
 * @param {object} [options] - Optional settings
 * @param {string} [options.topic] - Optional topic to focus the summary on
 * @param {string} [options.language] - Language preference (default: same as input)
 * @returns {Promise<object>} Summary object with title, summary, key_points, and study_tips
 */
const summarize = async (text, options = {}) => {
  if (!text || text.trim().length === 0) {
    console.log('[SummaryService] No text provided to summarize.');
    return null;
  }

  const client = getClient();

  const topicContext = options.topic
    ? `Focus the summary on the topic: "${options.topic}".\n`
    : '';

  const prompt = `You are an expert study assistant. Analyze the following text and provide a comprehensive study summary.

${topicContext}
Return ONLY a valid JSON object (no markdown, no code fences) with exactly these fields:
{
  "title": "A concise title for this content",
  "summary": "A 2-4 paragraph summary of the main content",
  "key_points": ["Array of 5-10 key points, each as a string"],
  "study_tips": ["Array of 2-4 study tips based on this content"]
}

Text to summarize:
---
${text.slice(0, 30000)}
---

JSON response:`;

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    let rawText = response.text;

    // Strip markdown code fences if present (```json ... ```)
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Try to extract JSON from the response
    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      // Try to extract JSON from surrounding text using greedy match
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch {
          // Last resort: try to find the first { and last } and parse between them
          const firstBrace = rawText.indexOf('{');
          const lastBrace = rawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            try {
              result = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
            } catch {
              console.error('[SummaryService] Failed to parse Gemini response as JSON. Response preview:', rawText.substring(0, 200));
              return null;
            }
          } else {
            console.error('[SummaryService] No JSON found in response.');
            return null;
          }
        }
      } else {
        console.error('[SummaryService] No JSON found in response. Preview:', rawText.substring(0, 200));
        return null;
      }
    }

    console.log('[SummaryService] Summary generated successfully.');
    return {
      title: result.title || 'Untitled',
      summary: result.summary || '',
      key_points: Array.isArray(result.key_points) ? result.key_points : [],
      study_tips: Array.isArray(result.study_tips) ? result.study_tips : [],
    };
  } catch (error) {
    console.error('[SummaryService] Gemini API error:', error.message);
    return null;
  }
};

module.exports = { summarize };
