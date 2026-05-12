<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

<!-- Current implementation plan: specs/001-highlight-extractor/plan.md -->

# Project Instructions

This repository is an Obsidian community plugin written in TypeScript. Source code lives under `src/`, unit tests live under `tests/`, and generated plugin artifacts are emitted at the repository root for Obsidian (`main.js`, declarations, sourcemaps, etc.).

Before making code changes, read the current Speckit plan linked above and check `package.json` for the current script names. Keep implementation aligned with the active feature documents in `specs/001-highlight-extractor/`.

## Engineering Workflow

- Use TDD for behavior changes: write or update a focused failing test first, implement the smallest change that makes it pass, then refactor while keeping tests green.
- Keep tests close to the behavior they protect. Parser and formatting behavior should have unit coverage in `tests/`; Obsidian integration behavior should be isolated behind small typed units where practical.
- Preserve the plugin's non-destructive document behavior. Extraction may insert or replace the generated highlights section, but must not rewrite the source article content outside that section.
- Favor small, explicit TypeScript functions over broad abstractions. The plugin should remain easy to audit for vault read/write behavior.
- Do not add runtime dependencies without a strong reason. Development dependencies for tests, typechecking, Husky, and Biome are acceptable.

## TypeScript Standards

- Write production and test code in TypeScript.
- Keep `strict` TypeScript enabled and treat type errors as blocking.
- Avoid `any`; use explicit interfaces in `src/models/types.ts` or local narrow types.
- Keep Obsidian API usage behind typed plugin classes and helper modules. Use the local `src/obsidian.d.ts` shim only as needed for tests or compile-time compatibility.
- Prefer pure, testable utilities for parsing and formatting. Avoid coupling regex parsing, output formatting, and vault mutation in the same function.

## Tooling Expectations

Use npm scripts as the canonical interface for local checks. The intended baseline is:

```bash
npm test
npm run typecheck
npm run check
npm run build
```

When tooling is updated, maintain these scripts in `package.json`:

- `test`: run the automated test suite.
- `typecheck`: run TypeScript without emitting build artifacts, typically `tsc --noEmit`.
- `check`: run Biome checks for linting and formatting, typically `biome check .`.
- `format`: apply Biome formatting, typically `biome format --write .`.
- `build`: compile and bundle the Obsidian plugin.
- `verify`: run typechecking, tests, Biome checks, and any required build step before handoff.

## Husky And Biome

- Use Biome for formatting and linting. Keep `biome.json` or `biome.jsonc` in the repo once configured.
- Use Husky to enforce checks before code leaves the workstation.
- The pre-commit hook should run fast checks: Biome check, typecheck, and unit tests unless the suite becomes too slow.
- If a slower full build is needed, put it in a pre-push hook or the `verify` script rather than silently skipping it.
- Do not bypass hooks to make progress. If a hook fails, fix the underlying type, test, or formatting issue.

## Verification Before Handoff

For code changes, run the narrowest relevant test first, then the full verification path before finishing:

```bash
npm test
npm run typecheck
npm run check
npm run build
```

If one of these scripts is not configured yet, add it as part of the tooling work or clearly call out the gap. Do not claim a check passed unless it was actually run.
