/**
 * PLACEHOLDER — AI Summary Service
 * -------------------------------------------------------
 * Current: returns null.
 * Future:  send extracted_text to OpenAI and return summary.
 *
 * OpenAI integration point:
 *   const { OpenAI } = require('openai');
 *   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *   const response = await client.chat.completions.create({ ... });
 *
 * Cognee integration point:
 *   Query Cognee memory graph for relevant chunks,
 *   build context-aware summary.
 */

const summarize = async (text) => {
  // TODO: implement AI summarization
  console.log('[SummaryService] Placeholder — summarization not yet implemented.');
  return null;
};

module.exports = { summarize };
