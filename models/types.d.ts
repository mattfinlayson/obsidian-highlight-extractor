/**
 * TypeScript interfaces for Highlight Extractor Plugin
 */
export interface Highlight {
    text: string;
    startIndex: number;
    endIndex: number;
    headingContext: string;
}
export interface Comment {
    text: string;
    colorTag: string | null;
    startIndex: number;
    isColorDefinition: boolean;
}
export interface ParsedDocument {
    highlights: Highlight[];
    comments: Comment[];
}
export interface ExtractionResult {
    highlights: Highlight[];
    comments: Comment[];
    documentTitle: string;
    extractedAt: string;
    highlightCount: number;
    commentCount: number;
}
export interface ExtractedSection {
    content: string;
    delimiterStart: string;
    delimiterEnd: string;
    isUpdate: boolean;
}
export interface PluginSettings {
    defaultHotkey: string;
    delimiterStyle: 'html-comment' | 'markdown-header';
    includeTimestamp: boolean;
    deduplicateHighlights: boolean;
    tagColorMapping: Record<string, string>;
}
export declare const DEFAULT_SETTINGS: PluginSettings;
export interface FormatterOptions {
    delimiterStart: string;
    delimiterEnd: string;
    includeTimestamp: boolean;
    deduplicate: boolean;
    colorToTagMapping: Record<string, string>;
}
