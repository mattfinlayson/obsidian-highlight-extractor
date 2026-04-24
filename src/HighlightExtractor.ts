/**
 * Highlight Extractor - Core extraction logic
 */

import { Notice, TFile } from 'obsidian';
import { parseDocument } from './utils/parser';
import { formatExtraction, DEFAULT_FORMATTER_OPTIONS, mapColorTagToObsidianTag } from './utils/formatter';
import { Highlight, Comment, PluginSettings, DEFAULT_SETTINGS } from './models/types';

/**
 * Find the insertion point for extracted content (after frontmatter)
 */
export function findInsertionPoint(content: string): number {
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n?/;
  const match = frontmatterRegex.exec(content);
  
  if (match) {
    return match.index + match[0].length;
  }
  
  return 0; // Insert at document start if no frontmatter
}

/**
 * Find the end of any existing extraction section
 */
export function findExistingSectionEnd(content: string): number {
  const endMarker = '<!-- /highlights -->';
  const endIndex = content.indexOf(endMarker);
  
  if (endIndex !== -1) {
    return endIndex + endMarker.length;
  }
  
  return -1; // No existing section
}

/**
 * Update document with extraction section
 */
export function updateDocument(
  originalContent: string,
  extractionContent: string,
  insertionPoint: number
): string {
  // Remove existing extraction section if present
  const existingEnd = findExistingSectionEnd(originalContent);
  let startPoint = insertionPoint;
  
  if (existingEnd !== -1) {
    // Check if there's an extraction section before our insertion point
    const startMarker = '<!-- highlights -->';
    const startIndex = originalContent.indexOf(startMarker);
    
    if (startIndex !== -1 && startIndex >= insertionPoint - 100) {
      startPoint = startIndex;
    }
  }
  
  // Build the new content
  const before = originalContent.substring(0, startPoint);
  const after = existingEnd !== -1 
    ? originalContent.substring(existingEnd).trimStart()
    : originalContent.substring(insertionPoint);
  
  return before + '\n' + extractionContent + '\n\n' + after;
}

/**
 * Extract highlights and comments from a file
 */
export async function extractHighlights(
  app: any,
  file: TFile,
  settings: PluginSettings = DEFAULT_SETTINGS
): Promise<string> {
  // Read document content
  const content = await app.vault.read(file);
  
  // Parse document
  const parsed = parseDocument(content);
  
  if (parsed.highlights.length === 0) {
    return ''; // No highlights to extract
  }
  
  // Prepare formatter options
  const options = {
    delimiterStart: '<!-- highlights -->',
    delimiterEnd: '<!-- /highlights -->',
    includeTimestamp: settings.includeTimestamp,
    deduplicate: settings.deduplicateHighlights,
    colorToTagMapping: settings.tagColorMapping
  };
  
  // Format extraction
  const extraction = formatExtraction(
    parsed.highlights,
    parsed.comments,
    options,
    file.basename
  );
  
  return extraction;
}

/**
 * Insert extraction into document at correct position
 */
export async function insertExtraction(
  app: any,
  file: TFile,
  extractionContent: string
): Promise<void> {
  const content = await app.vault.read(file);
  const insertionPoint = findInsertionPoint(content);
  const updatedContent = updateDocument(content, extractionContent, insertionPoint);
  
  await app.vault.process(file, () => updatedContent);
}
