/**
 * Formatter for LLM-optimized Markdown output
 */

import { Highlight, Comment, FormatterOptions, ExtractedSection } from '../models/types';

/**
 * Default formatter options
 */
export const DEFAULT_FORMATTER_OPTIONS: FormatterOptions = {
    delimiterStart: '<!-- highlights -->',
    delimiterEnd: '<!-- /highlights -->',
    includeTimestamp: true,
    deduplicate: true,
    colorToTagMapping: {}
};

/**
 * Map color tag to Obsidian tag
 */
export function mapColorTagToObsidianTag(colorName: string, tagMapping: Record<string, string>): string {
    return tagMapping[colorName] || `#highlight/${colorName}`;
}

/**
 * Format tags for a highlight
 */
function formatTags(highlight: Highlight, tagMapping: Record<string, string>): string[] {
    const tags: string[] = [];
    
    for (const comment of highlight.comments) {
        if (comment.colorTag) {
            tags.push(mapColorTagToObsidianTag(comment.colorTag, tagMapping));
        }
    }
    
    return tags;
}

/**
 * Format a single highlight with its associated comments for output
 */
function formatHighlightWithComments(highlight: Highlight, tagMapping: Record<string, string>): string[] {
    const lines: string[] = [];
    
    // The highlight text
    lines.push(`> **${highlight.text}**`);
    
    // Location if available
    if (highlight.headingContext) {
        lines.push(`> Location: ${highlight.headingContext.replace(/^#+\s*/, '')}`);
    }
    
    // Associated comments
    const regularComments = highlight.comments.filter(c => !c.isColorDefinition && !c.colorTag);
    const tags = formatTags(highlight, tagMapping);
    
    if (regularComments.length > 0 || tags.length > 0) {
        lines.push('');
        for (const comment of regularComments) {
            lines.push(`> _"${comment.text}"_`);
        }
        
        if (tags.length > 0) {
            lines.push(`> Tags: ${tags.join(', ')}`);
        }
    }
    
    return lines;
}

/**
 * Deduplicate highlights while preserving order
 */
function deduplicateHighlights(highlights: Highlight[]): Highlight[] {
    const seen = new Set<string>();
    return highlights.filter(h => {
        if (seen.has(h.text)) return false;
        seen.add(h.text);
        return true;
    });
}

/**
 * Format extraction result as LLM-optimized Markdown
 */
export function formatExtraction(
    highlights: Highlight[],
    comments: Comment[],
    options: FormatterOptions,
    documentTitle: string
): string {
    // Deduplicate if requested
    const processedHighlights = options.deduplicate 
        ? deduplicateHighlights(highlights) 
        : highlights;

    const lines: string[] = [];

    // Delimiter start
    lines.push(options.delimiterStart);
    lines.push('');

    // Header
    lines.push(`## Highlights (${processedHighlights.length})`);
    lines.push('');
    lines.push(`**Source**: [[${documentTitle}]]`);

    if (options.includeTimestamp) {
        lines.push(`| Extracted: ${new Date().toISOString()}`);
    }

    lines.push('');

    // Highlights section with associated comments
    lines.push('### Highlights');
    lines.push('');

    if (processedHighlights.length === 0) {
        lines.push('_No highlights found_');
    } else {
        for (const highlight of processedHighlights) {
            const formattedLines = formatHighlightWithComments(highlight, options.colorToTagMapping);
            lines.push(...formattedLines);
            lines.push('');
        }
    }

    lines.push(options.delimiterEnd);

    return lines.join('\n');
}

/**
 * Create an ExtractedSection from formatted content
 */
export function createExtractedSection(
    content: string,
    options: FormatterOptions = DEFAULT_FORMATTER_OPTIONS
): ExtractedSection {
    return {
        content,
        delimiterStart: options.delimiterStart,
        delimiterEnd: options.delimiterEnd,
        isUpdate: false
    };
}

// ExtractedSection already imported above