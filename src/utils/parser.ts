/**
 * Parser for highlights (==text==) and comments (<!--text-->)
 */

import { MARKER_END, MARKER_START } from '../annotations/utils';
import type { Comment, Highlight, ParsedDocument } from '../models/types';

const KNOWN_COLOR_NAMES = new Set([
  'lightpink',
  'palegreen',
  'paleturquoise',
  'violet',
  'yellow',
  'blue',
  'green',
  'red',
  'orange',
  'pink',
  'purple',
]);

/**
 * Parse all highlights from document content
 */
export function parseHighlights(content: string): Highlight[] {
  const highlights: Highlight[] = [];
  const rangesToSkip: Array<{ start: number; end: number }> = [];
  const multilineStartRegex = new RegExp(
    `${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^%]+)%%`,
    'g',
  );
  for (
    let multilineMatch = multilineStartRegex.exec(content);
    multilineMatch !== null;
    multilineMatch = multilineStartRegex.exec(content)
  ) {
    const id = multilineMatch[1].trim();
    const afterStart = multilineMatch.index + multilineMatch[0].length;
    const endMarker = `${MARKER_END}${id}%%`;
    const endIndex = content.indexOf(endMarker, afterStart);

    if (endIndex === -1) {
      continue;
    }

    const fullEnd = endIndex + endMarker.length;
    const text = content
      .substring(afterStart, endIndex)
      .replace(/^\n/, '')
      .replace(/\n$/, '')
      .trim();

    rangesToSkip.push({ start: multilineMatch.index, end: fullEnd });

    if (text.length > 0) {
      highlights.push({
        text,
        startIndex: multilineMatch.index,
        endIndex: fullEnd,
        headingContext: '',
        comments: [],
      });
    }
  }

  const regex = /==([^=]+)==/g;

  for (let match = regex.exec(content); match !== null; match = regex.exec(content)) {
    const matchStart = match.index;
    if (rangesToSkip.some((range) => matchStart >= range.start && matchStart < range.end)) {
      continue;
    }

    const text = match[1].trim();
    if (text.length > 0) {
      highlights.push({
        text,
        startIndex: matchStart,
        endIndex: matchStart + match[0].length,
        headingContext: '',
        comments: [],
      });
    }
  }

  return highlights.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Parse all HTML comments from document content
 */
export function parseComments(content: string): Comment[] {
  const comments: Comment[] = [];
  const regex = /<!--([\s\S]*?)-->/g;

  for (let match = regex.exec(content); match !== null; match = regex.exec(content)) {
    const text = match[1].trim();
    if (text.length > 0) {
      const colorTag = extractKnownColorTag(text);

      comments.push({
        text,
        colorTag,
        startIndex: match.index,
        isColorDefinition: !!colorTag && text === `@${colorTag}`,
      });
    }
  }

  return comments;
}

function extractKnownColorTag(text: string): string | null {
  const colorTagMatch = text.match(/(?:^|\s)@(\w+)\s*$/);
  if (!colorTagMatch) {
    return null;
  }

  const colorTag = colorTagMatch[1];
  return KNOWN_COLOR_NAMES.has(colorTag) ? colorTag : null;
}

/**
 * Find the nearest heading context above a position
 */
export function findHeadingContext(content: string, position: number): string {
  const headingRegex = /^#{1,6}\s+.+$/gm;
  let lastHeading = '';

  for (let match = headingRegex.exec(content); match !== null; match = headingRegex.exec(content)) {
    if (match.index < position) {
      lastHeading = match[0];
    } else {
      break;
    }
  }

  return lastHeading;
}

/**
 * Associate comments with the nearest preceding highlight
 * Comments within 2000 characters after a highlight are considered associated with it
 */
function associateCommentsWithHighlights(highlights: Highlight[], comments: Comment[]): void {
  for (const comment of comments) {
    if (comment.isColorDefinition) {
      // Color tags apply to the most recent highlight
      if (highlights.length > 0) {
        const lastHighlight = highlights[highlights.length - 1];
        lastHighlight.comments ??= [];
        lastHighlight.comments.push(comment);
      }
    } else {
      // Regular comments: find the nearest highlight that ends before this comment
      let nearestHighlight: Highlight | null = null;
      let nearestDistance = Infinity;

      for (const highlight of highlights) {
        // Comment must come after highlight
        if (comment.startIndex > highlight.endIndex) {
          const distance = comment.startIndex - highlight.endIndex;
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestHighlight = highlight;
          }
        }
      }

      // Only associate if comment is close to the highlight (within 2000 chars)
      if (nearestHighlight && nearestDistance < 2000) {
        nearestHighlight.comments ??= [];
        nearestHighlight.comments.push(comment);
      }
    }
  }
}

/**
 * Parse both highlights and comments, filling heading contexts and associating comments
 */
export function parseDocument(content: string): ParsedDocument {
  const highlights = parseHighlights(content);
  const comments = parseComments(content);

  // Fill heading context for each highlight
  for (const highlight of highlights) {
    highlight.headingContext = findHeadingContext(content, highlight.startIndex);
  }

  // Associate comments with highlights
  associateCommentsWithHighlights(highlights, comments);

  return { highlights, comments };
}

/**
 * Extract color tag from comment text
 */
export function extractColorTag(text: string): string | null {
  const match = text.match(/<!--\s*@(\w+)\s*-->/);
  return match ? match[1] : null;
}
