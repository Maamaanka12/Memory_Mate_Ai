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
const PPTX2Json = require('pptx2json');

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
  const pptx = new PPTX2Json();
  const json = await pptx.toJson(filePath);

  // Extract text from a:t nodes in each slide
  const slideKeys = Object.keys(json)
    .filter(k => k.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
      return numA - numB;
    });

  const slideTexts = [];

  for (const key of slideKeys) {
    const slideText = extractTextFromSlide(json[key]);
    if (slideText.trim()) {
      slideTexts.push(slideText.trim());
    }
  }

  return slideTexts.join('\n\n');
}

/**
 * Recursively extract text from a:t (text run) nodes in slide XML.
 * PPTX2Json returns a parsed XML tree where a:t contains actual text content.
 */
function extractTextFromSlide(slideData) {
  const textRuns = [];

  function walk(node) {
    if (!node || typeof node === 'string') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === 'object') {
      for (const [key, val] of Object.entries(node)) {
        if (key === 'a:t') {
          // a:t is a text run — extract all strings
          const text = extractAllStrings(val).trim();
          if (text) textRuns.push(text);
        } else {
          walk(val);
        }
      }
    }
  }

  function extractAllStrings(obj) {
    if (typeof obj === 'string') return obj;
    if (Array.isArray(obj)) return obj.map(extractAllStrings).join('');
    if (typeof obj === 'object') return Object.values(obj).map(extractAllStrings).join('');
    return '';
  }

  walk(slideData);
  return textRuns.join(' ');
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