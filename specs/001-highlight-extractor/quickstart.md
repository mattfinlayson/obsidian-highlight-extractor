# Quickstart: Highlight Extractor Plugin Development

**Feature**: Highlight Extractor | **Last Updated**: 2026-04-24

---

## Prerequisites

- Node.js 18+ and npm
- Obsidian 1.x installed
- Basic TypeScript knowledge
- Obsidian community plugin development workflow

---

## Setup

### 1. Initialize Plugin

```bash
# Clone or create your plugin directory
mkdir obsidian-highlight-extractor
cd obsidian-highlight-extractor

# Initialize npm project
npm init -y

# Install Obsidian API types (dev dependency only per Constitution V)
npm install --save-dev @obsidianmd/obsidian-api
```

### 2. Create Project Structure

```
obsidian-highlight-extractor/
├── src/
│   ├── main.ts          # Plugin entry point
│   ├── HighlightExtractor.ts
│   ├── models/
│   │   └── types.ts
│   └── utils/
│       ├── parser.ts
│       └── formatter.ts
├── tests/
│   ├── parser.test.ts
│   └── formatter.test.ts
├── manifest.json
├── styles.css
├── package.json
└── tsconfig.json
```

### 3. Configure TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

---

## Development Workflow

### Run Hot Reload (Dev Mode)

```bash
npm run dev
```

This compiles TypeScript and sets up hot-reload for Obsidian. Enable community plugins in Obsidian settings and point to your plugin folder.

### Build for Release

```bash
npm run build
```

Outputs:
- `main.js` - Compiled plugin code
- `manifest.json` - Plugin metadata

### Run Tests

```bash
npm test
```

Runs unit tests for parser and formatter.

---

## Key Files

### `src/main.ts` - Plugin Entry

```typescript
import { Plugin, Notice, Menu, moment } from 'obsidian';
import { HighlightExtractor } from './HighlightExtractor';
import { loadSettings, saveSettings, defaultSettings } from './settings';

export default class HighlightExtractorPlugin extends Plugin {
  settings = defaultSettings;

  async onload() {
    await loadSettings(this);
    this.addCommand({
      id: 'extract-highlights',
      name: 'Extract Highlights',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'h' }],
      callback: () => this.extractHighlights()
    });
  }

  onunload() {
    // Cleanup
  }

  async extractHighlights() {
    // Implementation in HighlightExtractor.ts
  }
}
```

### `src/utils/parser.ts` - Core Parsing

```typescript
// Extract ==highlight== text
export function parseHighlights(content: string): Highlight[];

// Extract <!--comments-->
export function parseComments(content: string): Comment[];

// Find nearest heading for provenance
export function findHeadingContext(content: string, position: number): string;
```

### `src/utils/formatter.ts` - Output Formatting

```typescript
export interface FormatterOptions {
  delimiterStart: string;
  delimiterEnd: string;
  includeTimestamp: boolean;
  deduplicate: boolean;
  colorToTagMapping: Record<string, string>;
}

export function formatExtraction(
  highlights: Highlight[],
  comments: Comment[],
  options: FormatterOptions
): string;
```

---

## Testing

### Manual Testing Checklist

- [ ] Test with document containing `==highlights==`
- [ ] Test with `<!--comments-->`
- [ ] Test with color tags `<!-- @lightpink-->`
- [ ] Test with frontmatter present
- [ ] Test without frontmatter
- [ ] Test re-extraction (output replaced)
- [ ] Test hotkey activation
- [ ] Test in Source mode
- [ ] Test in Live Preview mode
- [ ] Verify original content unchanged

### Sample Test Document

```markdown
---
title: AI Progress Report
tags: [ai, research]
---

# Introduction

This is an important topic about ==AI capabilities improving rapidly==.

<!-- @lightpink This is interesting -->

# Results

According to ==researchers at METR==, the trend is clear.

<!-- How does this compare to human performance? -->

The end.
```

---

## Common Issues

### "Plugin not loading"

1. Check `manifest.json` has valid JSON
2. Verify `main.js` exports default class
3. Check Obsidian console (Ctrl+Shift+I) for errors

### "Highlights not detected"

1. Verify exact `==text==` syntax (no spaces inside delimiters)
2. Check for nested `==` (e.g., `===text===` may not parse correctly)
3. Ensure not inside code blocks

### "Extraction not appearing"

1. Verify frontmatter exists or document has content
2. Check insertion point detection
3. Verify `app.vault.process()` is completing

---

## Next Steps

1. Complete Phase 2: Run `/speckit.tasks` to generate implementation tasks
2. Implement core parsing in `src/utils/parser.ts`
3. Implement formatting in `src/utils/formatter.ts`
4. Implement document modification in `src/HighlightExtractor.ts`
5. Test thoroughly in Obsidian
