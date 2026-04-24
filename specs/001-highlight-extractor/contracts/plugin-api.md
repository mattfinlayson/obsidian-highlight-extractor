# Interface Contracts: Highlight Extractor Plugin

**Feature**: Highlight Extractor | **Date**: 2026-04-24

---

## Obsidian Plugin Interface

### Plugin Lifecycle

```typescript
// Entry point: main.ts
export default class HighlightExtractorPlugin extends Plugin {
  async onload(): void {
    // Initialize plugin
    // Register command: "Extract Highlights"
    // Register hotkey
    // Load settings
  }

  onunload(): void {
    // Cleanup: remove ribbons, commands, keybindings
  }
}
```

### User Command Interface

**Command ID**: `highlight-extractor:extract`

**Activation**:
- Via Command Palette: "Highlight Extractor: Extract Highlights"
- Via Hotkey: User-configured (default: `Mod+Shift+H`)

**Input**: Active document in Obsidian workspace

**Output**: Document modified with extraction section inserted after frontmatter

**Side Effects**:
- Previous extraction section replaced (not appended)
- Original content preserved byte-for-byte

---

## Parser Interface

### Highlight Parser

```typescript
interface Highlight {
  text: string;        // Content between == delimiters
  startIndex: number;   // Position in document
  endIndex: number;     // End position in document
  headingContext: string;  // Nearest heading above
}

/**
 * Parse highlights from document content
 * @param content - Full document text
 * @param headingMap - Map of positions to heading names
 * @returns Array of extracted highlights
 */
function parseHighlights(content: string, headingMap: Map<number, string>): Highlight[];
```

### Comment Parser

```typescript
interface Comment {
  text: string;         // Full comment content
  colorTag: string | null;  // @colorname if present
  startIndex: number;   // Position in document
  isColorDefinition: boolean;  // True if purely color tag
}

/**
 * Parse comments from document content
 * @param content - Full document text
 * @returns Array of extracted comments
 */
function parseComments(content: string): Comment[];
```

### Combined Parser

```typescript
interface ParsedDocument {
  highlights: Highlight[];
  comments: Comment[];
}

/**
 * Parse both highlights and comments from document
 * @param content - Full document text
 * @returns Combined parsed result
 */
function parseDocument(content: string): ParsedDocument;
```

---

## Formatter Interface

### Output Formatter

```typescript
interface FormatterOptions {
  delimiterStart: string;      // e.g., "<!-- highlights -->"
  delimiterEnd: string;        // e.g., "<!-- /highlights -->"
  includeTimestamp: boolean;   // Include extraction time
  deduplicate: boolean;        // Remove duplicate highlights
  colorToTagMapping: Record<string, string>;  // @lightpink → #highlight/lightpink
}

/**
 * Format extraction result as LLM-optimized Markdown
 * @param result - ParsedDocument with metadata
 * @param options - Formatting options
 * @returns Markdown string ready for insertion
 */
function formatExtraction(
  result: ParsedDocument,
  options: FormatterOptions
): string;
```

### Output Format Example

```markdown
<!-- highlights -->
## Highlights (4)

**Source**: [[article-ai-progress]] | Extracted: 2026-04-24T14:30:00Z

### Highlights

> ==First key insight from the document==
> Location: Introduction

> ==Second key insight==
> Location: Section 1.2

### Comments & Tags

- **Comment**: "How is quality measured here?"
- **Comment**: "@lightpink" → #highlight/lightpink

---

## Document Modification Interface

### Insertion Point Detection

```typescript
/**
 * Find insertion point (after frontmatter or document start)
 * @param content - Full document text
 * @returns Character index for insertion
 */
function findInsertionPoint(content: string): number;
```

### Document Update

```typescript
/**
 * Replace or insert extraction section in document
 * @param originalContent - Full document text
 * @param extractionContent - Formatted extraction Markdown
 * @returns Modified document content
 */
function updateDocument(
  originalContent: string,
  extractionContent: string
): string;
```

---

## Settings Interface

```typescript
interface PluginSettings {
  defaultHotkey: string;
  delimiterStyle: 'html-comment' | 'markdown-header';
  includeTimestamp: boolean;
  deduplicateHighlights: boolean;
  tagColorMapping: Record<string, string>;
}

/**
 * Load settings from persisted storage
 */
async function loadSettings(): Promise<PluginSettings>;

/**
 * Save settings to persisted storage
 */
async function saveSettings(settings: PluginSettings): Promise<void>;
```

---

## No External Interfaces

This plugin has no external HTTP APIs, CLI interfaces, or system integrations beyond Obsidian APIs. All contracts are internal TypeScript interfaces.
