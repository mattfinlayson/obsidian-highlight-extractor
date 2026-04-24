# Obsidian Highlight Extractor

Extract highlights and comments from your Obsidian documents and format them for LLM consumption. Perfect for creating LinkedIn posts, blog content, and building a structured knowledge base from your reading highlights.

## Features

- **One-Key Extraction**: Press `Cmd+Alt+H` to extract all highlights from your document
- **LLM-Optimized Output**: Formatted Markdown with provenance markers, making it perfect for pasting into AI tools
- **Non-Destructive**: Your original content is never modified — highlights are inserted at the document top
- **Color Tag Support**: Extract color-coded annotations and map them to Obsidian tags (`<!-- @lightpink -->` → `#highlight/lightpink`)
- **Smart Deduplication**: Duplicate highlights are automatically removed while preserving order

## Usage

### Highlight Syntax

This plugin works with the [Obsidian Highlightr](https://github.com/runebreegbe/obsidian-highlightr) plugin syntax:

```
==This is a highlighted passage==
```

Add comments with HTML comments:

```
==Important insight== <!-- This is my note about this passage -->
```

Use color tags for organization:

```
==Key point== <!-- @important This point is important -->
```

### Output Format

When you press `Cmd+Alt+H`, the plugin extracts all highlights and comments, formatting them like this:

```markdown
<!-- highlights -->
## Highlights (4)

**Source**: [[article-title]] | Extracted: 2026-04-24T14:30:00Z

### Highlights

> ==First key insight==
> Location: # Introduction

> ==Second key insight==
> Location: ## Key Findings

---

### Comments & Tags

- **Comment**: "This is my note about this passage"
- **Comment**: "@important" → #highlight/important

<!-- /highlights -->
```

## Installation

### From GitHub Release

1. Download the latest release from the [Releases page](https://github.com/mattfinlayson/obsidian-highlight-extractor/releases)
2. Extract the ZIP file
3. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/highlight-extractor/` directory
4. Enable the plugin in Obsidian's Community Plugins settings

### From Source

```bash
# Clone the repository
git clone https://github.com/mattfinlayson/obsidian-highlight-extractor.git

# Install dependencies
npm install

# Build
npm run build

# Copy files to your vault
cp main.js manifest.json styles.css ~/.obsidian/plugins/highlight-extractor/
```

## Requirements

- [Obsidian](https://obsidian.md/) 1.0.0 or higher
- For highlighting syntax, install [Obsidian Highlightr](https://github.com/runebreegbe/obsidian-highlightr)

## How It Works

1. **Extract**: Press `Cmd+Alt+H` while viewing a document with highlights
2. **Review**: The plugin inserts a formatted section at the document top
3. **Use**: Copy the highlights section and paste it into your favorite LLM
4. **Iterate**: Re-extract to update — previous output is automatically replaced

## Example Use Cases

- **Content Creation**: Extract highlights from articles to create LinkedIn posts or blog threads
- **Research Notes**: Quickly review all your annotations from a research paper
- **Knowledge Management**: Build a second brain by extracting and organizing key insights
- **LLM-Assisted Writing**: Feed highlights to AI tools for summaries, expansions, or new content

## Keyboard Shortcut

Default: `Cmd+Alt+H`

You can customize this in Obsidian's Settings → Hotkeys → "Highlight Extractor: Extract Highlights"

## License

MIT License - Copyright (c) 2026 Matthew Finlayson

## Contributing

Contributions welcome! Feel free to submit issues and pull requests.
