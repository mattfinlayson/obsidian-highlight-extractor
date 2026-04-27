# Obsidian Highlight Extractor

Extract highlights and comments from your Obsidian documents and format them for LLM consumption.

> **⚠️ Important**: Requires the [Highlightr](https://github.com/nickmackenzie/obsidian-highlightr) plugin for `==highlight==` syntax support.

## Features

- **One-Key Extraction**: Press `Cmd+Alt+E` to extract all highlights
- **LLM-Optimized Output**: Markdown format with provenance markers
- **Non-Destructive**: Original content is never modified
- **Comment Association**: Comments are attached to their nearest highlight
- **Smart Deduplication**: Duplicate highlights are automatically removed

## Installation

### Community Plugin Marketplace (Recommended)

1. Open Obsidian Settings → Community Plugins
2. Search for "Highlight Extractor"
3. Install and enable

### Manual Installation

1. Download the latest release from GitHub
2. Copy `main.js`, `manifest.json`, and `styles.css` to:
   - `.obsidian/plugins/highlight-extractor/` in your vault
3. Enable in Community Plugins settings

## Usage

### Document Format

Add highlights with `==` syntax and comments with HTML comments:

```markdown
==This is an important passage== <!-- This is my note about this passage -->

==Another highlight==
```

### Extracting Highlights

1. Open a document with highlights
2. Press `Cmd+Alt+E` (or search "Extract Highlights" in Command Palette)
3. Highlights are inserted at the document top in LLM-ready format:

```markdown
<!-- highlights -->
## Highlights (2)

**Source**: [[document-name]] | Extracted: 2026-04-27T18:00:00Z

### Highlights

> **Highlight text here**
> Location: Section Title
> Comment: My note about this highlight

---

<!-- /highlights -->
```

## How It Works

1. **Extract**: Press the hotkey
2. **Review**: Edit the generated section as needed
3. **Use**: Copy highlights to your LLM for content creation

## Keyboard Shortcut

Default: `Cmd+Alt+E`

Customize in Settings → Hotkeys → "Highlight Extractor: Extract Highlights"

## Settings

- **Include Timestamp**: Add extraction time to output (default: on)
- **Deduplicate Highlights**: Remove duplicate highlights (default: on)

## License

MIT License - Copyright (c) 2026 Matthew Finlayson