# Implementation Plan: Highlight Extractor

**Branch**: `001-highlight-extractor` | **Date**: 2026-04-24 | **Spec**: [specs/001-highlight-extractor/spec.md](specs/001-highlight-extractor/spec.md)
**Input**: Feature specification from `specs/001-highlight-extractor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

An Obsidian plugin that extracts highlights (`==text==`) and comments (`<!--text-->`) from web-clipped articles and inserts them at the document start as LLM-optimized Markdown. The plugin operates non-destructively, preserves document order, deduplicates highlights, and maps color tags to Obsidian tags. Primary use cases are LinkedIn/blog content creation and knowledge management via tagging.

## Technical Context

**Language/Version**: TypeScript 5.x (Obsidian standard)  
**Primary Dependencies**: @obsidianmd/obsidian-api (compile-time types only per Constitution V)  
**Storage**: Obsidian vault (file-based via app.vault API)  
**Testing**: Manual testing via `npm run dev` hot-reload + automated regex unit tests  
**Target Platform**: Obsidian 1.x (desktop, Electron)  
**Project Type**: Obsidian Community Plugin  
**Performance Goals**: <5s extraction for 10,000-word document (per SC-001)  
**Constraints**: Zero external runtime dependencies, offline-capable, read/write vault permissions  
**Scale/Scope**: Single-user local vault, 1-50 highlights per document expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Obsidian Plugin Architecture | Plugin interface, loadData/saveData, manifest.json | ✅ PASS | Full compliance |
| II. Hotkey-First Design | Default hotkey, configurable, addCommand() API | ✅ PASS | FR-010 maps directly |
| III. Non-Destructive Output | Insert only, never modify original content | ✅ PASS | FR-009 guarantees this |
| IV. LLM-Optimized Output | Markdown, provenance, metadata, deduplication | ✅ PASS | FR-005 to FR-008 |
| V. Minimal Dependencies | Zero external runtime deps | ✅ PASS | Only Obsidian API types |

**Gate Result**: ✅ ALL GATES PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-highlight-extractor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Obsidian plugin interface)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT here)
```

### Source Code (Obsidian plugin standard layout)

```text
obsidian-highlight-extractor/
├── src/
│   ├── main.ts          # Plugin entry point (onload/onunload)
│   ├── HighlightExtractor.ts    # Core extraction logic
│   ├── models/
│   │   └── types.ts    # TypeScript interfaces
│   └── utils/
│       ├── parser.ts   # ==text== and <!--comment--> regex parsing
│       └── formatter.ts # LLM-optimized Markdown output formatting
├── tests/
│   ├── parser.test.ts  # Unit tests for highlight/comment parsing
│   └── formatter.test.ts # Unit tests for output formatting
├── manifest.json        # Obsidian plugin manifest
├── styles.css          # Optional: minimal styling for delimiters
├── package.json
└── tsconfig.json
```

**Structure Decision**: Single-plugin structure following Obsidian community plugin conventions. Source code lives at repository root (standard for Obsidian plugins, not under `src/`). Test directory follows Jest convention.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All principles satisfied with minimal complexity.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | - | - |

## Phase 0: Research Notes

Research completed inline (see research.md for full details):

**Key Decisions**:
1. **Regex patterns**: `==([^=]+)==` for highlights, `<!--([\s\S]*?)-->` for comments
2. **Document reading**: `app.workspace.getActiveFile()` → `app.vault.read(file)`
3. **Document writing**: `app.vault.process()` for atomic read-modify-write
4. **Frontmatter detection**: YAML block regex `^---\n[\s\S]*?\n---\n`
5. **Color tag mapping**: Regex `<!--\s*@(\w+)-->` extracts color name, maps to `#highlight/{name}`
6. **Hotkey registration**: `this.addCommand({ id: 'extract-highlights', name: 'Extract Highlights', hotkeys: [...] })`
7. **Settings persistence**: `this.saveData()` / `this.loadData()` for user preferences

**No outstanding clarifications needed.**
