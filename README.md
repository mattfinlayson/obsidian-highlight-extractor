# Reading Assistant

A plugin that lets you create annotated highlights in Obsidian, then collect those highlights and comments at the top of a document in a format ready for use with language models (ChatGPT, Claude, etc.).

## What It Does

When you're reading articles or documents in Obsidian, you can highlight key passages, add comments, use colors, and extract the results for later use. This plugin combines annotation tools from [obsidian-note-annotations](https://github.com/mattfinlayson/obsidian-note-annotations) with the highlight extraction workflow in this repository.

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
2. Search for "Reading Assistant"
3. Install and enable

### Option 2: Manual Installation

1. Download the latest release from GitHub
2. Extract and copy `main.js`, `manifest.json`, `styles.css` to:
   `.obsidian/plugins/obsidian-reading-assistant/`
3. Enable in Community Plugins settings

## Usage

1. **Add highlights** to your document using the command palette, highlight mode, or `==text==` syntax
2. **Add comments and colors** by clicking highlighted text in live preview
3. **Press `Cmd+Alt+E`** (or search "Extract Highlights" in the command palette)
4. **Use the output** - copy the highlighted section and paste it into your favorite LLM

### Syntax Examples

```markdown
==This is a highlight== <!-- This is a comment -->

==Another important passage==

==Third highlight==<!-- This has a color tag @blue -->

%%highlight-start:abc123%%
Multi-line highlighted text
%%highlight-end:abc123%%<!-- A multi-line annotation @lightpink -->
```

## Annotation Commands

- **Highlight selection**: wraps the current selection as an annotation
- **Toggle highlight mode**: highlights selected text automatically in live preview
- **Delete annotation at cursor**: removes annotation markup while preserving text
- **Clear all annotations**: removes highlight/comment markup from the current document
- **Extract highlights**: inserts or replaces the generated highlights section

## References

- [obsidian-note-annotations](https://github.com/mattfinlayson/obsidian-note-annotations) - source plugin merged into this repository
- [Obsidian Plugin Skill](https://github.com/gapmiss/obsidian-plugin-skill) - guidance and tooling for Obsidian plugin development

## Keyboard Shortcut

Default: `Cmd+Alt+E`

Change it in Settings → Hotkeys → "Reading Assistant: Extract Highlights"

## Settings

- **Include Timestamp**: Adds extraction date to the output (default: on)
- **Deduplicate Highlights**: Removes duplicate highlights (default: on)
- **Expand Annotation Selection**: Expands selections to word boundaries when creating annotations (default: on)
- **Annotation Colors**: Comma-separated color names available in the annotation popover

## Why This Plugin?

If you read articles in Obsidian (via Web Clipper or otherwise) and want to:

- Create content from your highlights
- Summarize what you read with an LLM
- Build a collection of key insights

...then manually copying highlights is tedious. This plugin does it instantly with one keypress.

## License

MIT License - Copyright (c) 2026 Matthew Finlayson
