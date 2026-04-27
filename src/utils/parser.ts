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
                headingContext: '',
                comments: []
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
                isColorDefinition: !!colorTag && text === `@${colorTag}`
            });
        }
    }

    return comments;
}

/**
 * Find the nearest heading context above a position
 */
export function findHeadingContext(content: string, position: number): string {
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
 * Associate comments with the nearest preceding highlight
 * Comments within 2000 characters after a highlight are considered associated with it
 */
function associateCommentsWithHighlights(highlights: Highlight[], comments: Comment[]): void {
    for (const comment of comments) {
        if (comment.isColorDefinition) {
            // Color tags apply to the most recent highlight
            if (highlights.length > 0) {
                const lastHighlight = highlights[highlights.length - 1];
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