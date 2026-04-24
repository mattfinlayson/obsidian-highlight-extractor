/**
 * Parser for highlights (==text==) and comments (<!--text-->)
 */
import { Highlight, Comment, ParsedDocument } from '../models/types';
/**
 * Parse all highlights from document content
 */
export declare function parseHighlights(content: string): Highlight[];
/**
 * Parse all HTML comments from document content
 */
export declare function parseComments(content: string): Comment[];
/**
 * Find the nearest heading context above a position
 */
export declare function findHeadingContext(content: string, position: number): string;
/**
 * Parse both highlights and comments, filling heading contexts
 */
export declare function parseDocument(content: string): ParsedDocument;
/**
 * Extract color tag from comment text
 */
export declare function extractColorTag(text: string): string | null;
