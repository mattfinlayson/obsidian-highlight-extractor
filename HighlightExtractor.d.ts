/**
 * Highlight Extractor - Core extraction logic
 */
import { TFile } from 'obsidian';
import { PluginSettings } from './models/types';
/**
 * Find the insertion point for extracted content (after frontmatter)
 */
export declare function findInsertionPoint(content: string): number;
/**
 * Find the end of any existing extraction section
 */
export declare function findExistingSectionEnd(content: string): number;
/**
 * Update document with extraction section
 */
export declare function updateDocument(originalContent: string, extractionContent: string, insertionPoint: number): string;
/**
 * Extract highlights and comments from a file
 */
export declare function extractHighlights(app: any, file: TFile, settings?: PluginSettings): Promise<string>;
/**
 * Insert extraction into document at correct position
 */
export declare function insertExtraction(app: any, file: TFile, extractionContent: string): Promise<void>;
