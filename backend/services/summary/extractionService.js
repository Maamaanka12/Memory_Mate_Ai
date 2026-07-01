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

const extract = async (filePath, fileType) => {
  // TODO: implement extraction
  console.log(`[ExtractionService] Placeholder — ${fileType} at ${filePath}`);
  return null;
};

module.exports = { extract };
