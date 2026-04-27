/**
 * TypeScript interfaces for Highlight Extractor Plugin
 */

// Highlight entity - text marked with ==...==
export interface Highlight {
  text: string;          // Content between == delimiters
  startIndex: number;    // Character position in original document
  endIndex: number;      // End character position
  headingContext: string; // Nearest heading above for provenance
  comments: Comment[];   // Comments associated with this highlight
}

// Comment entity - HTML comments including color tags
export interface Comment {
  text: string;              // Full comment content including color tag
  colorTag: string | null;   // Color name if <!-- @colorname--> detected
  startIndex: number;       // Character position in document
  isColorDefinition: boolean; // True if purely a color tag definition
}

// Parsed document result
export interface ParsedDocument {
  highlights: Highlight[];
  comments: Comment[];
}

// Extraction result container
export interface ExtractionResult {
  highlights: Highlight[];
  comments: Comment[];
  documentTitle: string;
  extractedAt: string; // ISO8601 timestamp
  highlightCount: number;
  commentCount: number;
}

// Extracted section for document insertion
export interface ExtractedSection {
  content: string;          // Formatted Markdown ready for insertion
  delimiterStart: string;  // Opening marker
  delimiterEnd: string;    // Closing marker
  isUpdate: boolean;        // True if replacing existing section
}

// Plugin settings
export interface PluginSettings {
  defaultHotkey: string;
  delimiterStyle: 'html-comment' | 'markdown-header';
  includeTimestamp: boolean;
  deduplicateHighlights: boolean;
  tagColorMapping: Record<string, string>;
}

// Default settings
export const DEFAULT_SETTINGS: PluginSettings = {
  defaultHotkey: 'Mod+Alt+E',
  delimiterStyle: 'html-comment',
  includeTimestamp: true,
  deduplicateHighlights: true,
  tagColorMapping: {}
};

// Formatter options
export interface FormatterOptions {
  delimiterStart: string;
  delimiterEnd: string;
  includeTimestamp: boolean;
  deduplicate: boolean;
  colorToTagMapping: Record<string, string>;
}