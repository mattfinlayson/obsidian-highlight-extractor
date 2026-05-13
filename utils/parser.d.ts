/**
 * Parser for highlights (==text==) and comments (<!--text-->)
 */
import type { Comment, Highlight, ParsedDocument } from '../models/types';
/**
 * Parse all highlights from document content
 */
export declare function parseHighlights(content: string, colorOptions?: string[]): Highlight[];
/**
 * Parse all HTML comments from document content
 */
export declare function parseComments(content: string, colorOptions?: string[]): Comment[];
/**
 * Find the nearest heading context above a position
 */
export declare function findHeadingContext(content: string, position: number): string;
/**
 * Parse both highlights and comments, filling heading contexts and associating comments
 */
export declare function parseDocument(content: string, colorOptions?: string[]): ParsedDocument;
/**
 * Extract color tag from comment text
 */
export declare function extractColorTag(text: string): string | null;
