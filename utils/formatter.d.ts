/**
 * Formatter for LLM-optimized Markdown output
 */
import { Highlight, Comment, FormatterOptions, ExtractedSection } from '../models/types';
/**
 * Default formatter options
 */
export declare const DEFAULT_FORMATTER_OPTIONS: FormatterOptions;
/**
 * Map color tag to Obsidian tag
 */
export declare function mapColorTagToObsidianTag(colorName: string, tagMapping: Record<string, string>): string;
/**
 * Format extraction result as LLM-optimized Markdown
 */
export declare function formatExtraction(highlights: Highlight[], comments: Comment[], options: FormatterOptions, documentTitle: string): string;
/**
 * Create an ExtractedSection from formatted content
 */
export declare function createExtractedSection(content: string, options?: FormatterOptions): ExtractedSection;
