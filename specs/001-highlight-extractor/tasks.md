# Tasks: Highlight Extractor

**Input**: Design documents from `specs/001-highlight-extractor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included per spec.md (not explicitly requested).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Obsidian plugin**: Project root (not src/), following community plugin conventions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per plan.md with directories: `src/models/`, `src/utils/`, `tests/`
- [X] T002 Initialize `package.json` with Obsidian API types: `npm install --save-dev @obsidianmd/obsidian-api`
- [X] T003 Create `manifest.json` with plugin metadata (id, name, version, description, author, minAppVersion)
- [X] T004 Create `tsconfig.json` with TypeScript strict mode, ES2020 target, commonjs module

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Create `src/models/types.ts` with TypeScript interfaces: `Highlight`, `Comment`, `ExtractionResult`, `ExtractedSection`, `PluginSettings`
- [X] T006 [P] Create `src/utils/parser.ts` with functions: `parseHighlights(content: string): Highlight[]`, `parseComments(content: string): Comment[]`
- [X] T007 [P] Create `src/utils/formatter.ts` with function: `formatExtraction(highlights: Highlight[], comments: Comment[], options: FormatterOptions): string`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Extract Highlights with Comments (Priority: P1) 🎯 MVP

**Goal**: Extract all `==highlight==` text and `<!--comments-->` from document

**Independent Test**: Activate plugin on document with highlights/comments, verify all are captured in order

### Implementation for User Story 1

- [X] T008 [P] [US1] Implement `findHeadingContext(content: string, position: number): string` in `src/utils/parser.ts`
- [X] T009 [P] [US1] Implement `parseDocument(content: string): ParsedDocument` in `src/utils/parser.ts` integrating highlight + comment parsing
- [X] T010 [US1] Create `src/HighlightExtractor.ts` with method `extract(file: TFile): Promise<string>` using `app.vault.read(file)`
- [X] T011 [US1] Create `src/main.ts` with plugin entry point extending `Plugin`, implement `onload()` with command registration
- [X] T012 [US1] Implement `app.workspace.getActiveFile()` check and `new Notice()` for no-document error in main.ts

**Checkpoint**: User Story 1 complete - highlights and comments are extractable

---

## Phase 4: User Story 2 - LLM-Optimized Output Format (Priority: P1)

**Goal**: Output is Markdown with provenance markers, metadata, and deduplicated highlights

**Independent Test**: Extract highlights, verify output has clear delimiters, headings, timestamp, source reference

### Implementation for User Story 2

- [X] T013 [P] [US2] Update `src/utils/formatter.ts` to add section headers `## Highlights`, `### Comments & Tags`
- [X] T014 [P] [US2] Update `src/utils/formatter.ts` to prefix each highlight with heading context from `headingContext` field
- [X] T015 [US2] Update `src/utils/formatter.ts` to include metadata: extraction timestamp (ISO8601), source document title
- [X] T016 [US2] Update `src/utils/formatter.ts` to deduplicate highlights while preserving order using Set

**Checkpoint**: User Story 2 complete - output is LLM-ready with provenance and metadata

---

## Phase 5: User Story 3 - Non-Destructive Document Modification (Priority: P1)

**Goal**: Insert extraction section after frontmatter, never modify original content

**Independent Test**: Extract from document with known content, verify original body unchanged after extraction

### Implementation for User Story 3

- [X] T017 [P] [US3] Implement `findInsertionPoint(content: string): number` in `src/HighlightExtractor.ts` detecting frontmatter boundary
- [X] T018 [P] [US3] Implement `findExistingSectionEnd(content: string): number` in `src/HighlightExtractor.ts` to locate previous `<!-- /highlights -->`
- [X] T019 [US3] Implement `updateDocument(content: string, extractionContent: string): string` in `src/HighlightExtractor.ts`
- [X] T020 [US3] Integrate document update via `app.vault.process(file, callback)` in main.ts for atomic read-modify-write
- [X] T021 [US3] Wrap extraction section with delimiters `<!-- highlights -->` and `<!-- /highlights -->` in formatter output

**Checkpoint**: User Story 3 complete - document is modified non-destructively with clear section boundaries

---

## Phase 6: User Story 4 - Hotkey Activation and Reusability (Priority: P2)

**Goal**: Extract via configurable hotkey, re-extraction replaces (not appends)

**Independent Test**: Press hotkey, verify extraction runs; re-run, verify previous output replaced

### Implementation for User Story 4

- [X] T022 [P] [US4] Register default hotkey `Mod+Shift+H` in main.ts via `this.addCommand({ hotkeys: [...] })`
- [X] T023 [P] [US4] Create `src/settings.ts` with `PluginSettings` interface and `DEFAULT_SETTINGS`
- [X] T024 [US4] Implement `loadSettings()` using `this.loadData()` and `saveSettings()` using `this.saveData()`
- [X] T025 [US4] Add settings tab via `this.addSettingTab()` with hotkey configuration UI using Obsidian `setTING` components
- [X] T026 [US4] Verify re-extraction flow: T018 (findExistingSectionEnd) removes previous section before T019 (updateDocument)

**Checkpoint**: User Story 4 complete - hotkey activation works with settings persistence

---

## Phase 7: User Story 5 - Tagging and Organization Support (Priority: P2)

**Goal**: Output includes color-derived tags and document metadata for knowledge management

**Independent Test**: Extract from document with `<!-- @lightpink-->`, verify output contains `#highlight/lightpink`

### Implementation for User Story 5

- [X] T027 [P] [US5] Implement color tag extraction in `src/utils/parser.ts`: regex `<!--\s*@(\w+)-->` on comment text
- [X] T028 [P] [US5] Update `src/models/types.ts` to add `colorTag: string | null` field to `Comment` interface
- [X] T029 [US5] Implement `mapColorTagToObsidianTag(colorName: string): string` in `src/utils/formatter.ts` returning `#highlight/{colorname}`
- [X] T030 [US5] Update `formatExtraction()` in formatter.ts to include color tags in Comments section as Obsidian tags
- [X] T031 [US5] Update `PluginSettings` interface in settings.ts with optional `tagColorMapping: Record<string, string>` for custom mappings

**Checkpoint**: User Story 5 complete - color tags are extracted and mapped to Obsidian tags

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T032 [P] Create `styles.css` with minimal CSS for delimiter styling (subtle background on `<!-- highlights -->` section)
- [X] T033 Add error handling: empty document, no highlights found, frontmatter parsing edge cases
- [X] T034 Verify SC-001 (5s extraction) via performance profiling on 10,000-word test document
- [X] T035 Create `tests/parser.test.ts` with Jest unit tests covering: highlight parsing, comment parsing, color tag extraction
- [X] T036 Create `tests/formatter.test.ts` with Jest unit tests covering: Markdown output, deduplication, metadata inclusion
- [X] T037 Add `npm run build` script to `package.json` for production build outputting `main.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Core extraction
- **User Story 2 (P1)**: Depends on US1 parser (Phase 3) - Output formatting
- **User Story 3 (P1)**: Depends on US1 extraction (Phase 3) - Document modification
- **User Story 4 (P2)**: Depends on US3 update flow (Phase 5) - Hotkey + settings
- **User Story 5 (P2)**: Depends on US1 parser (Phase 3) - Tag extraction

### Within Each User Story

- Models (types.ts) before utilities (parser.ts, formatter.ts)
- Utilities before integration (HighlightExtractor.ts)
- Integration before plugin wiring (main.ts)
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks (T005, T006, T007) can run in parallel
- All User Story 1 implementation tasks (T008, T009) can run in parallel
- All User Story 2 formatter updates (T013, T014) can run in parallel
- All User Story 3 insertion tasks (T017, T018) can run in parallel
- All User Story 4 setup tasks (T022, T023) can run in parallel
- All User Story 5 parser updates (T027, T028) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test highlight/comment extraction independently
5. User has basic functional MVP at this point

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 → Test → Core extraction MVP
3. Add US2 → Test → LLM-optimized output
4. Add US3 → Test → Safe document modification
5. Add US4 → Test → Hotkey activation
6. Add US5 → Test → Tagging support
7. Polish → Final release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
