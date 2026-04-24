/**
 * Parser for highlights (==text==) and comments (<!--text-->)
 */

import { Highlight, Comment, ParsedDocument } from '../models/types';

/**
 * Parse all highlights from document content
 */
export function parseHighlights(content: string): Highlight[] {
  const highlights: Highlight[] = [];
  const regex = /==([^=]+)==/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 0) {
      highlights.push({
        text,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        headingContext: '' // Will be filled by parseDocument
      });
    }
  }

  return highlights;
}

/**
 * Parse all HTML comments from document content
 */
export function parseComments(content: string): Comment[] {
  const comments: Comment[] = [];
  const regex = /<!--([\s\S]*?)-->/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 0) {
      // Check for color tag pattern: @colorname
      const colorTagMatch = text.match(/^@(\w+)$/);
      const colorTag = colorTagMatch ? colorTagMatch[1] : null;
      
      comments.push({
        text,
        colorTag,
        startIndex: match.index,
        isColorDefinition: !!colorTag
      });
    }
  }

  return comments;
}

/**
 * Find the nearest heading context above a position
 */
export function findHeadingContext(content: string, position: number): string {
  // Match markdown headings: # Heading, ## Heading, etc.
  const headingRegex = /^#{1,6}\s+.+$/gm;
  let lastHeading = '';
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    if (match.index < position) {
      lastHeading = match[0];
    } else {
      break;
    }
  }

  return lastHeading;
}

/**
 * Parse both highlights and comments, filling heading contexts
 */
export function parseDocument(content: string): ParsedDocument {
  const highlights = parseHighlights(content);
  const comments = parseComments(content);

  // Fill heading context for each highlight
  for (const highlight of highlights) {
    highlight.headingContext = findHeadingContext(content, highlight.startIndex);
  }

  return { highlights, comments };
}

/**
 * Extract color tag from comment text
 */
export function extractColorTag(text: string): string | null {
  const match = text.match(/<!--\s*@(\w+)\s*-->/);
  return match ? match[1] : null;
}
