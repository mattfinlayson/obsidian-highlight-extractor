# Obsidian Highlight Extractor

A plugin that collects all your highlighted text and comments from a document and places them at the top in a format ready for use with language models (ChatGPT, Claude, etc.).

## What It Does

When you're reading articles or documents in Obsidian, you probably highlight key passages using the `==highlight syntax==`. This plugin extracts all those highlights—along with any comments you've added—and formats them neatly at the top of your document.

This makes it easy to:

- **Feed highlights to an LLM** for summary, analysis, or content generation
- **Create LinkedIn posts or blog threads** from your reading highlights
- **Review all key points** from a long document in one place
- **Build a second brain** by extracting insights for later reference

## How It Works

### Before (your document with highlights)

```markdown
# Article Title

This is some text with ==an important highlight== that I want to remember.

<!-- A note about this highlight -->

More content here with ==another highlight==.
```

### After (press `Cmd+Alt+E`)

```markdown
# Article Title

<!-- highlights -->
## Highlights (2)

**Source**: [[article-title]] | Extracted: 2026-04-27T18:00:00Z

### Highlights

> **an important highlight that I want to remember**
> Location: # Article Title
> Comment: A note about this highlight

> **another highlight**
> Location: # Article Title

<!-- /highlights -->

This is some text with ==an important highlight==...
```

The extracted section is clearly marked with `<!-- highlights -->` markers, so you can remove it or re-extract later.

## Installation

### Option 1: Community Plugins (Recommended)

1. Open Obsidian → Settings → Community Plugins
2. Search for "Highlight Extractor"
3. Install and enable

### Option 2: Manual Installation

1. Download the latest release from GitHub
2. Extract and copy `main.js`, `manifest.json`, `styles.css` to:
   `.obsidian/plugins/highlight-extractor/`
3. Enable in Community Plugins settings

## Usage

1. **Add highlights** to your document using `==text==` syntax
2. **Add comments** using `<!-- comment -->` right after a highlight
3. **Press `Cmd+Alt+E`** (or search "Extract Highlights" in the command palette)
4. **Use the output** - copy the highlighted section and paste it into your favorite LLM

### Syntax Examples

```markdown
==This is a highlight== <!-- This is a comment -->

==Another important passage==

==Third highlight== <!-- @tag This has a color tag -->
```

## Dependencies

**Requires a plugin that enables `==highlight==` syntax**

Obsidian doesn't support `==highlight==` syntax natively. You need one of:

- [Highlightr](https://github.com/nickmackenzie/obsidian-highlightr) - popular highlight plugin
- Or any other plugin that adds `==text==` syntax support

## Keyboard Shortcut

Default: `Cmd+Alt+E`

Change it in Settings → Hotkeys → "Highlight Extractor: Extract Highlights"

## Settings

- **Include Timestamp**: Adds extraction date to the output (default: on)
- **Deduplicate Highlights**: Removes duplicate highlights (default: on)

## Why This Plugin?

If you read articles in Obsidian (via Web Clipper or otherwise) and want to:

- Create content from your highlights
- Summarize what you read with an LLM
- Build a collection of key insights

...then manually copying highlights is tedious. This plugin does it instantly with one keypress.

## License

MIT License - Copyright (c) 2026 Matthew Finlayson