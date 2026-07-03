/**
 * PLACEHOLDER — Text Extraction Service
 * -------------------------------------------------------
 * Current: returns null (no extraction).
 * Future:  implement per file type:
 *   - pdf  → pdf-parse
 *   - docx → mammoth
 *   - pptx → pptx-text or officegen
 *
 * OpenAI integration point:
 *   After extraction, send extracted_text to OpenAI for
 *   summarization via services/summary/summaryService.js
 *
 * Cognee integration point:
 *   After extraction, ingest document into Cognee memory
 *   via services/memory/cogneeService.js
 */

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

async function extractPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);

  return data.text.trim();
}

async function extractDocx(filePath) {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  return result.value.trim();
}

async function extractPptx(filePath) {
  // Placeholder until we implement PPTX extraction properly.
  // This keeps uploads working instead of crashing.
  return '[PPT/PPTX text extraction coming soon]';
}

async function extract(filePath, fileType) {
  try {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case '.pdf':
        return await extractPdf(filePath);

      case '.docx':
        return await extractDocx(filePath);

      case '.ppt':
      case '.pptx':
        return await extractPptx(filePath);

      default:
        console.warn(`[ExtractionService] Unsupported file type: ${extension}`);
        return null;
    }
  } catch (error) {
    console.error('[ExtractionService]', error);
    return null;
  }
}

module.exports = {
  extract,
};