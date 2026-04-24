# Obsidian Highlight Extractor Constitution

<!-- SYNC_IMPACT_REPORT v1.0.0 -->
<!-- Version: 0.1.0 → 1.0.0 | RATIFIED: 2026-04-23 | LAST_AMENDED: 2026-04-23 -->
<!-- Modified Principles: N/A (initial constitution) -->
<!-- Added Sections: Obsidian API Integration, Development Workflow -->
<!-- Removed Sections: N/A -->
<!-- Templates requiring updates: -->
<!--   ✅ .specify/templates/plan-template.md (Constitution Check section remains valid) -->
<!--   ✅ .specify/templates/spec-template.md (general template, valid for plugin specs) -->
<!--   ✅ .specify/templates/tasks-template.md (general template, valid for plugin tasks) -->
<!--   ✅ .specify/templates/checklist-template.md (general template, valid for plugin checklists) -->
<!-- Deferred Items: None -->

## Core Principles

### I. Obsidian Plugin Architecture

All development MUST follow the official Obsidian plugin guidelines at https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin.

- Plugins MUST implement the `Plugin` interface with `onload()` and `onunload()` lifecycle methods
- Settings MUST be persisted using Obsidian's `loadData()` and `saveData()` APIs
- Plugin must declare all permissions explicitly in manifest.json
- All UI elements MUST use Obsidian's Component-based cleanup system

Rationale: Ensures compatibility with Obsidian ecosystem and proper resource management.

### II. Hotkey-First Design

Keyboard shortcuts MUST be the primary interaction method.

- A default hotkey MUST be assigned and configurable by users
- All functionality MUST be accessible without mouse interaction
- Hotkey binding MUST use Obsidian's `addCommand()` API with proper keybinding registration

Rationale: Efficiency for power users; aligns with Obsidian's keyboard-centric philosophy.

### III. Non-Destructive Output

The plugin MUST NEVER modify or delete existing document content.

- Extracted highlights are INSERTED at document beginning as a new section
- Original formatting and content MUST remain untouched
- Output section MUST be clearly delimited with clear markers

Rationale: User trust is paramount; accidental data loss is unacceptable.

### IV. LLM-Optimized Output Format

Extracted highlights MUST be formatted for optimal LLM consumption.

- Output MUST use clean Markdown with hierarchical structure
- Each highlight MUST be prefixed with its heading context for provenance
- Output MUST include metadata: extraction timestamp, source file reference
- Highlights MUST be deduplicated and ordered logically (by document position)

Rationale: Primary use case is feeding highlights to LLMs; formatting quality directly impacts utility.

### V. Minimal Dependencies

The plugin MUST have zero external runtime dependencies beyond Obsidian APIs.

- No npm packages beyond TypeScript types for development
- No external services or network calls
- All functionality implemented using vanilla TypeScript and Obsidian API

Rationale: Reduces security surface, ensures offline functionality, and minimizes compatibility issues.

## Obsidian API Integration

### API Boundaries

- **Reading**: Use `app.workspace.getActiveFile()` and `app.vault.read()` for document access
- **Writing**: Use `app.vault.modify()` or `app.vault.process()` for document updates
- **Selection**: Use `app.workspace.activeLeaf.view.editor` for editor operations

### Permission Requirements

The following permissions MUST be declared in manifest.json:
- `"permissions": ["read", "write"]` - for document access and modification

## Development Workflow

### Build Requirements

- TypeScript MUST be used with strict mode enabled
- Build output MUST be a single .js file in main.js for the manifest
- Development MUST use `npm run dev` for hot-reload testing

### Testing Strategy

- Manual testing via Obsidian's community plugin development workflow
- Test in both Live Preview and Source mode
- Verify behavior with various highlight styles (single line, multi-line, nested)

## Governance

### Constitution Supremacy

This constitution supersedes all other development practices. When conflicts arise, constitution principles take precedence.

### Amendment Procedure

All amendments MUST:
1. Be documented with rationale
2. Update the version number following semantic versioning
3. Include the amendment date

### Versioning Policy

- **MAJOR**: Backward-incompatible API changes or principle removals
- **MINOR**: New principles or materially expanded guidance
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Verification

- All PRs and reviews MUST verify compliance with Core Principles
- Complexity MUST be justified against Simplicity principle (V)
- New dependencies MUST be rejected unless essential and approved by consensus

**Version**: 1.0.0 | **Ratified**: 2026-04-23 | **Last Amended**: 2026-04-23