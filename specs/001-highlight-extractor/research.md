# Research: Highlight Extractor Plugin

**Feature**: Highlight Extractor | **Date**: 2026-04-24
**Status**: ✅ Complete (all clarifications resolved)

---

## Technical Decisions

### 1. Highlight Parsing Regex

**Decision**: `==([^=]+)==` for highlights, `<!--([\s\S]*?)-->` for comments

**Rationale**: 
- `==([^=]+)==` captures text between double-equals, excluding single `=` characters within
- `<!--([\s\S]*?)-->` captures HTML comments including multiline (non-greedy)
- Edge case: `===text===` would be split; assume user uses standard `==text==` format

**Alternatives considered**:
- Balance regex (`%%...%%`): Not standard Obsidian, would require custom styling
- Markers plugin format: Not universal across user's existing documents

### 2. Document Access APIs

**Decision**: Read via `app.vault.read(file)`, Write via `app.vault.process()`

**Rationale**:
- `app.workspace.getActiveFile()` gets current file reference
- `app.vault.read()` returns full document content as string
- `app.vault.process()` performs atomic read-modify-write preventing race conditions
- `app.vault.modify()` is simpler but less safe for concurrent access

**Alternatives considered**:
- `editor.getValue()`: Works but gives unsaved buffer; vault.read() ensures persistence
- File system direct access: Breaks Obsidian sandbox and vault abstraction

### 3. Frontmatter Detection

**Decision**: YAML block regex `^---\n[\s\S]*?\n---\n`

**Rationale**:
- Standard Obsidian/ Jekyll frontmatter format
- Regex handles multiline frontmatter correctly
- Insertion point is after closing `---` line

**Alternatives considered**:
- Check for existing `---` at document start: Simpler but less robust
- Parse YAML library: Overkill for simple insertion point detection

### 4. Color Tag Mapping

**Decision**: `<!--\s*@(\w+)-->` extracts color name → `#highlight/{name}`

**Rationale**:
- Color tag is part of comment content (e.g., `<!-- @lightpink-->`)
- Mapped to nested tag `#highlight/lightpink` for organization
- Preserves original comment text alongside tag

**Alternatives considered**:
- Plain tag `#colorname`: Less organized, mixes with user tags
- Skip color tags: Loses user categorization intent (per FR-012)

### 5. Hotkey Registration

**Decision**: Obsidian `addCommand()` with `hotkeys` array

**Rationale**:
- Built-in Obsidian API, no plugin dependency
- Supports multiple keybindings per command
- Default hotkey configurable in plugin settings
- Persisted via Obsidian's built-in hotkey manager

**Alternatives considered**:
- Manual `Keymap` API manipulation: More complex, less maintainable
- User-defined trigger (e.g., specific text): Less discoverable

### 6. Settings Persistence

**Decision**: `this.saveData()` / `this.loadData()` Obsidian API

**Rationale**:
- Native Obsidian API, JSON serialization
- Automatic vault-relative path management
- Handles vault sync correctly

**Alternatives considered**:
- LocalStorage: Not vault-synced, plugin-specific issues
- Custom file in vault: More control but unnecessary complexity

---

## No Outstanding Clarifications

All technical decisions resolved. Implementation can proceed with confidence.
