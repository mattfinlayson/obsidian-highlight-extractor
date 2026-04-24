# Feature Specification: Highlight Extractor

**Feature Branch**: `[001-highlight-extractor]`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "Id like an obsidian plugin, its to be used with the web clipper plugin. I want to take articles Ive read and highlighted and collect those highlights and comments and place them at the top of the document, right after the frontmatter, formatted and identifed for LLM consumption. My intent is to use those for LinkedIn and blog posts, as well as to help me tag, organize, and find new connections based on the pieces of the document I find interesting and my comments. The format for hightlights is like this: ==METR's researchers attempted to track this by creating a benchmark of software engineering tasks...==<!--How is quality measured here?--> ==What they found was surprising...==<!-- @lightpink-->"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extract Highlights with Comments (Priority: P1)

As a researcher and content creator, I want to collect all highlighted text and associated comments from my web-clipped articles so that I can quickly review my annotations.

**Why this priority**: This is the core value proposition - without extraction, the user cannot accomplish any downstream goal.

**Independent Test**: Can be fully tested by activating the plugin on a document containing highlights and comments, and verifying that all `==highlighted text==` and `<!--comments-->` are captured.

**Acceptance Scenarios**:

1. **Given** a document with multiple highlights (==text==) and comments (<!--text-->), **When** I activate the plugin, **Then** all highlights and comments are extracted in document order
2. **Given** a document with no highlights, **When** I activate the plugin, **Then** I receive a clear message indicating no highlights were found
3. **Given** a document with highlights only (no comments), **When** I activate the plugin, **Then** all highlights are extracted without any empty comment placeholders
4. **Given** a document with color-tagged comments like `<!-- @lightpink-->`, **When** I activate the plugin, **Then** the color tags are preserved in the extracted comments

---

### User Story 2 - LLM-Optimized Output Format (Priority: P1)

As a content creator using LLMs for writing, I want the extracted highlights and comments formatted in a clear, structured way so that I can paste them into AI tools for generating LinkedIn posts and blog content.

**Why this priority**: The primary use case is LLM-assisted content creation - poor formatting directly undermines this goal.

**Independent Test**: Can be tested by extracting highlights from a sample document and verifying the output contains clear delimiters, provenance markers, and follows a predictable structure that an LLM can parse.

**Acceptance Scenarios**:

1. **Given** highlights from a document, **When** extraction completes, **Then** each highlight is prefixed with its heading context or location for provenance
2. **Given** extraction output, **When** displayed, **Then** it uses clear Markdown formatting with section headers distinguishing highlights from comments
3. **Given** extraction output, **When** displayed, **Then** it includes metadata (extraction timestamp, source file reference)
4. **Given** duplicate highlights, **When** extraction completes, **Then** duplicates are removed from output while preserving order

---

### User Story 3 - Non-Destructive Document Modification (Priority: P1)

As a user who values my original content, I want the extracted highlights to be inserted at the document start without modifying or deleting any existing content so that I retain full access to my source material.

**Why this priority**: Trust is critical - accidental modification of original content would break user confidence in the tool.

**Independent Test**: Can be tested by extracting highlights from a document with known content, then verifying the original body text remains unchanged.

**Acceptance Scenarios**:

1. **Given** a document with frontmatter and body text, **When** extraction completes, **Then** the extracted section is inserted immediately after frontmatter
2. **Given** a document without frontmatter, **When** extraction completes, **Then** the extracted section is inserted at the very beginning of the document
3. **Given** a document, **When** extraction completes, **Then** the original body content is unchanged (no deletions, no modifications)
4. **Given** a document, **When** extraction completes, **Then** the extracted section is clearly delimited with visual markers so it can be distinguished from original content

---

### User Story 4 - Hotkey Activation and Reusability (Priority: P2)

As a power user, I want to activate the highlight extraction with a keyboard shortcut so that I can quickly extract highlights without interrupting my reading flow.

**Why this priority**: Efficiency for power users - while the feature works without hotkeys, the full Obsidian experience requires keyboard-centric interaction.

**Independent Test**: Can be tested by assigning a hotkey to the plugin command and verifying extraction triggers correctly via the hotkey.

**Acceptance Scenarios**:

1. **Given** the plugin is installed and active, **When** I press the assigned hotkey on a document with highlights, **Then** extraction executes automatically
2. **Given** a user has changed their hotkey preference, **When** they press the new hotkey, **Then** extraction uses their custom binding
3. **Given** the user runs extraction multiple times on the same document, **When** each extraction completes, **Then** the previous extraction output is replaced (not appended)

---

### User Story 5 - Tagging and Organization Support (Priority: P2)

As a researcher building a knowledge base, I want extracted highlights to include metadata that helps me tag, categorize, and discover connections between my annotations so I can build a structured second brain.

**Why this priority**: This enables the knowledge management use case beyond just content extraction - supports LinkedIn/blog content creation through organized tagging.

**Independent Test**: Can be tested by extracting highlights and verifying the output includes category tags, source references, and timestamp metadata that can be used for Obsidian tagging and searching.

**Acceptance Scenarios**:

1. **Given** extracted highlights, **When** output is generated, **Then** it includes the source document title as a reference
2. **Given** extracted highlights, **When** output is generated, **Then** it includes tags derived from color annotations (e.g., @lightpink mapped to #tag)
3. **Given** extracted highlights, **When** output is generated, **Then** it includes timestamp for when extraction occurred

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST extract all text wrapped in `==...==` syntax as highlights
- **FR-002**: System MUST extract all HTML comments `<!--...-->` as comments, including color tag definitions like `<!-- @lightpink-->`
- **FR-003**: System MUST preserve the reading order of highlights and their associated comments
- **FR-004**: System MUST insert extracted content immediately after frontmatter (or at document start if no frontmatter exists)
- **FR-005**: System MUST format output using Markdown with clear section headers
- **FR-006**: System MUST prefix each highlight with its heading context for provenance
- **FR-007**: System MUST include extraction timestamp and source file reference in output metadata
- **FR-008**: System MUST deduplicate highlights while preserving original order
- **FR-009**: System MUST NOT modify or delete any original document content
- **FR-010**: System MUST provide a configurable hotkey for activation
- **FR-011**: System MUST replace existing extraction output when re-running (not append)
- **FR-012**: System MUST map color tags in comments to Obsidian-compatible tags (e.g., `<!-- @lightpink-->` → `#highlight/lightpink`)

### Key Entities

- **Highlight**: Text fragment marked with `==...==` syntax, extracted from document body
- **Comment**: HTML comment `<!--...-->` associated with or near a highlight, includes optional color tag
- **Color Tag**: Part of comment indicating visual category (format: `<!-- @colorname-->`)
- **Extraction Output**: Markdown section containing all extracted highlights and comments
- **Frontmatter**: YAML metadata block at document start (preserved and respected as insertion point)
- **Provenance Marker**: Heading context or location reference attached to each highlight

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can extract all highlights from a 10,000-word document in under 5 seconds
- **SC-002**: 100% of highlights (==text==) are captured and included in output
- **SC-003**: 100% of comments (<!--text-->) within highlight proximity are captured
- **SC-004**: Original document content is 100% preserved (byte-for-byte identical except for inserted extraction section)
- **SC-005**: Output format is parseable by LLMs for content generation tasks
- **SC-006**: Deduplication removes 100% of exact duplicate highlights
- **SC-007**: Users can complete highlight extraction workflow in under 10 seconds from activation to output
- **SC-008**: Extraction section is clearly distinguishable from original content via delimiters

## Assumptions

- **Assumption about source documents**: Documents are assumed to be plain Markdown or Obsidian-flavored Markdown (Web Clipper format)
- **Assumption about highlight density**: Most documents will have 1-50 highlights; plugin handles edge cases for empty or very long documents
- **Assumption about color tag usage**: Color tags are optional; when present they indicate user categorization intent
- **Assumption about frontmatter**: Web Clipper documents include standard YAML frontmatter; plugin handles documents with or without frontmatter
- **Assumption about re-extraction**: Users may re-extract highlights after editing - output must be replaceable, not cumulative
- **Assumption about Obsidian modes**: Plugin works in both Live Preview and Source modes
- **Assumption about offline use**: No network connectivity required for extraction (local-only processing)
