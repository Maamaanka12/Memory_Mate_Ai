/**
 * PLACEHOLDER — Cognee Memory Service
 * -------------------------------------------------------
 * Current: no-op stubs.
 * Future:  full Cognee memory graph integration.
 *
 * Integration points:
 *   ingestDocument(text, userId)  → add doc to user memory
 *   queryMemory(query, userId)    → retrieve relevant chunks
 *   deleteMemory(docId, userId)   → remove doc from memory
 *
 * Example (future):
 *   const cognee = require('cognee');
 *   await cognee.add(text, { user_id: userId });
 *   await cognee.cognify();
 *   const results = await cognee.search(query);
 */

const ingestDocument = async (text, userId) => {
  console.log('[MemoryService] Placeholder — Cognee not yet integrated.');
  return null;
};

const queryMemory = async (query, userId) => {
  console.log('[MemoryService] Placeholder — Cognee not yet integrated.');
  return [];
};

const deleteMemory = async (docId, userId) => {
  console.log('[MemoryService] Placeholder — Cognee not yet integrated.');
  return null;
};

module.exports = { ingestDocument, queryMemory, deleteMemory };
