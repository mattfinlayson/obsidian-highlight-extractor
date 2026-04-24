# Data Model: Highlight Extractor Plugin

**Feature**: Highlight Extractor | **Date**: 2026-04-24

---

## Core Entities

### Highlight

Represents a text fragment marked as important by the user.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `text` | `string` | The highlighted content (without `==` delimiters) | Non-empty, max ~10,000 chars |
| `startIndex` | `number` | Character position in original document | ≥ 0 |
| `endIndex` | `number` | End character position | > startIndex |
| `headingContext` | `string` | Nearest heading above highlight for provenance | Optional, may be empty |

### Comment

Represents a user annotation associated with highlights.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `text` | `string` | Full comment text including color tag | Non-empty |
| `colorTag` | `string \| null` | Color name if `<!-- @colorname-->` detected | Optional, alphanumeric only |
| `startIndex` | `number` | Character position in original document | ≥ 0 |
| `isColorDefinition` | `boolean` | True if comment is purely a color tag | Detected by `<!--\s*@.*-->` |

### ExtractionResult

Container for the complete extraction output.

| Field | Type | Description |
|-------|------|-------------|
| `highlights` | `Highlight[]` | All extracted highlights |
| `comments` | `Comment[]` | All extracted comments |
| `documentTitle` | `string` | File basename for reference |
| `extractedAt` | `ISO8601 string` | Timestamp of extraction |
| `highlightCount` | `number` | Total highlights (after dedup) |
| `commentCount` | `number` | Total comments |

### ExtractedSection

The Markdown-formatted section to insert into document.

| Field | Type | Description |
|-------|------|-------------|
| `content` | `string` | Formatted Markdown ready for insertion |
| `delimiterStart` | `string` | Opening marker (e.g., `<!-- highlights -->`) |
| `delimiterEnd` | `string` | Closing marker (e.g., `<!-- /highlights -->`) |
| `isUpdate` | `boolean` | True if replacing existing section |

### PluginSettings

User-configurable preferences.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `defaultHotkey` | `string` | `Mod+Shift+H` | Default keyboard shortcut |
| `delimiterStyle` | `enumerated` | `html-comment` | Visual style for section markers |
| `includeTimestamp` | `boolean` | `true` | Include extraction time in output |
| `deduplicateHighlights` | `boolean` | `true` | Remove exact duplicate highlights |
| `tagColorMapping` | `Record<string,string>` | `{}` | Custom color → tag mappings |

---

## State Transitions

### Document State Machine

```
[No Document Open]
       ↓
[Document Loaded] ← → [Document Modified externally]
       ↓
[Extraction Initiated]
       ↓
[Existing Section?]
  ├─ NO  → [Insert New Section]
  └─ YES → [Remove Old Section] → [Insert New Section]
       ↓
[Document Saved]
```

### Extraction Section Lifecycle

1. **Non-existent**: No `<!-- highlights -->` markers found
2. **Created**: First extraction inserts section after frontmatter
3. **Updated**: Subsequent extractions replace existing section (not append)
4. **Deleted**: User manually removes section markers

---

## Validation Rules

| Rule | Entity | Description |
|------|--------|-------------|
| V1 | Highlight | `text` must not be empty after trimming |
| V2 | Highlight | `text` must not be just whitespace |
| V3 | Highlight | Length must be < 100,000 characters |
| V4 | Comment | `colorTag` must match `/^\w+$/` if present |
| V5 | Comment | `text` must not be only whitespace |
| V6 | ExtractionResult | `highlights` may be empty (valid for no-highlight docs) |
| V7 | ExtractionResult | `comments` may be empty |
| V8 | ExtractionResult | `extractedAt` must be valid ISO8601 |

---

## Relationships

```
Document (Obsidian)
  │
  ├── contains: Frontmatter (YAML)
  │
  ├── contains: Highlight[] (==text==)
  │
  ├── contains: Comment[] (<!--text-->)
  │
  └── contains: ExtractionSection (inserted output)
                    │
                    ├── references: DocumentTitle
                    ├── references: Timestamp
                    └── contains: Tag[] (from color mappings)
```

---

## No Outstanding Model Questions

All entity definitions complete and sufficient for implementation.
