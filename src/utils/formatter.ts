/**
 * Formatter for LLM-optimized Markdown output
 */

import { Highlight, Comment, FormatterOptions, ExtractedSection } from '../models/types';

/**
 * Default formatter options
 */
export const DEFAULT_FORMATTER_OPTIONS: FormatterOptions = {
  delimiterStart: '<!-- highlights -->',
  delimiterEnd: '<!-- /highlights -->',
  includeTimestamp: true,
  deduplicate: true,
  colorToTagMapping: {}
};

/**
 * Format a single highlight for output
 */
function formatHighlight(highlight: Highlight): string {
  const headingPrefix = highlight.headingContext 
    ? `\n> Location: ${highlight.headingContext}\n` 
    : '';
  return `> ${highlight.text}${headingPrefix}`;
}

/**
 * Format a single comment for output
 */
function formatComment(comment: Comment, tagMapping: Record<string, string>): string {
  let output = `- **Comment**: "${comment.text}"`;
  
  if (comment.colorTag) {
    const obsidianTag = tagMapping[comment.colorTag] || `#highlight/${comment.colorTag}`;
    output += ` → ${obsidianTag}`;
  }
  
  return output;
}

/**
 * Deduplicate highlights while preserving order
 */
function deduplicateHighlights(highlights: Highlight[]): Highlight[] {
  const seen = new Set<string>();
  return highlights.filter(h => {
    if (seen.has(h.text)) return false;
    seen.add(h.text);
    return true;
  });
}

/**
 * Map color tag to Obsidian tag
 */
export function mapColorTagToObsidianTag(colorName: string, tagMapping: Record<string, string>): string {
  return tagMapping[colorName] || `#highlight/${colorName}`;
}

/**
 * Format extraction result as LLM-optimized Markdown
 */
export function formatExtraction(
  highlights: Highlight[],
  comments: Comment[],
  options: FormatterOptions,
  documentTitle: string
): string {
  // Deduplicate if requested
  const processedHighlights = options.deduplicate 
    ? deduplicateHighlights(highlights) 
    : highlights;

  // Filter out color definition only comments for display
  const displayComments = comments.filter(c => !c.isColorDefinition);

  // Build output sections
  const lines: string[] = [];

  // Delimiter start
  lines.push(options.delimiterStart);
  lines.push('');

  // Header
  lines.push(`## Highlights (${processedHighlights.length})`);
  lines.push('');
  lines.push(`**Source**: [[${documentTitle}]]`);

  if (options.includeTimestamp) {
    lines.push(`| Extracted: ${new Date().toISOString()}`);
  }

  lines.push('');

  // Highlights section
  lines.push('### Highlights');
  lines.push('');

  if (processedHighlights.length === 0) {
    lines.push('_No highlights found_');
  } else {
    for (const highlight of processedHighlights) {
      lines.push(formatHighlight(highlight));
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');

  // Comments section
  lines.push('### Comments & Tags');
  lines.push('');

  if (displayComments.length === 0) {
    lines.push('_No comments found_');
  } else {
    for (const comment of displayComments) {
      lines.push(formatComment(comment, options.colorToTagMapping));
    }
  }

  lines.push('');
  lines.push(options.delimiterEnd);

  return lines.join('\n');
}

/**
 * Create an ExtractedSection from formatted content
 */
export function createExtractedSection(
  content: string,
  options: FormatterOptions = DEFAULT_FORMATTER_OPTIONS
): ExtractedSection {
  return {
    content,
    delimiterStart: options.delimiterStart,
    delimiterEnd: options.delimiterEnd,
    isUpdate: false // Will be set appropriately during insertion
  };
}
