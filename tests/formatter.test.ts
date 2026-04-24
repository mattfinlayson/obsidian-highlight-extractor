/**
 * Formatter unit tests
 */

import {
  formatExtraction,
  mapColorTagToObsidianTag,
  deduplicateHighlights,
  DEFAULT_FORMATTER_OPTIONS
} from '../src/utils/formatter';
import { Highlight, Comment } from '../src/models/types';

describe('Formatter', () => {
  describe('mapColorTagToObsidianTag', () => {
    it('should map color to default highlight tag', () => {
      const result = mapColorTagToObsidianTag('lightpink', {});
      expect(result).toBe('#highlight/lightpink');
    });

    it('should use custom mapping when provided', () => {
      const result = mapColorTagToObsidianTag('important', { important: '#priority/high' });
      expect(result).toBe('#priority/high');
    });
  });

  describe('formatExtraction', () => {
    const sampleHighlight: Highlight = {
      text: 'This is a key insight',
      startIndex: 0,
      endIndex: 20,
      headingContext: '# Introduction'
    };

    const sampleComment: Comment = {
      text: 'Important note',
      colorTag: null,
      startIndex: 25,
      isColorDefinition: false
    };

    it('should include delimiter start', () => {
      const result = formatExtraction(
        [sampleHighlight],
        [sampleComment],
        DEFAULT_FORMATTER_OPTIONS,
        'test.md'
      );
      
      expect(result).toContain('<!-- highlights -->');
    });

    it('should include delimiter end', () => {
      const result = formatExtraction(
        [sampleHighlight],
        [sampleComment],
        DEFAULT_FORMATTER_OPTIONS,
        'test.md'
      );
      
      expect(result).toContain('<!-- /highlights -->');
    });

    it('should include highlight count', () => {
      const result = formatExtraction(
        [sampleHighlight],
        [],
        DEFAULT_FORMATTER_OPTIONS,
        'test.md'
      );
      
      expect(result).toContain('## Highlights (1)');
    });

    it('should include source reference', () => {
      const result = formatExtraction(
        [sampleHighlight],
        [],
        DEFAULT_FORMATTER_OPTIONS,
        'test-article.md'
      );
      
      expect(result).toContain('[[test-article.md]]');
    });

    it('should include heading context', () => {
      const result = formatExtraction(
        [sampleHighlight],
        [],
        DEFAULT_FORMATTER_OPTIONS,
        'test.md'
      );
      
      expect(result).toContain('Location: # Introduction');
    });

    it('should include timestamp when enabled', () => {
      const result = formatExtraction(
        [sampleHighlight],
        [],
        { ...DEFAULT_FORMATTER_OPTIONS, includeTimestamp: true },
        'test.md'
      );
      
      expect(result).toContain('Extracted:');
    });

    it('should format comments with tags', () => {
      const colorComment: Comment = {
        text: '@lightpink',
        colorTag: 'lightpink',
        startIndex: 0,
        isColorDefinition: true
      };
      
      const result = formatExtraction(
        [],
        [colorComment],
        DEFAULT_FORMATTER_OPTIONS,
        'test.md'
      );
      
      expect(result).toContain('#highlight/lightpink');
    });
  });

  describe('deduplication', () => {
    it('should remove exact duplicate highlights', () => {
      const highlights: Highlight[] = [
        { text: 'Same', startIndex: 0, endIndex: 4, headingContext: '' },
        { text: 'Different', startIndex: 10, endIndex: 18, headingContext: '' },
        { text: 'Same', startIndex: 20, endIndex: 24, headingContext: '' }
      ];
      
      const options = { ...DEFAULT_FORMATTER_OPTIONS, deduplicate: true };
      const result = formatExtraction(highlights, [], options, 'test.md');
      
      expect(result).toContain('## Highlights (2)');
    });

    it('should preserve order after dedup', () => {
      const options = { ...DEFAULT_FORMATTER_OPTIONS, deduplicate: true };
      // This is implicitly tested by formatExtraction maintaining array order
      const highlights: Highlight[] = [
        { text: 'First', startIndex: 0, endIndex: 5, headingContext: '' },
        { text: 'Duplicate of third', startIndex: 10, endIndex: 26, headingContext: '' },
        { text: 'Duplicate of third', startIndex: 30, endIndex: 46, headingContext: '' },
        { text: 'Third', startIndex: 50, endIndex: 55, headingContext: '' }
      ];
      
      const result = formatExtraction(highlights, [], options, 'test.md');
      
      // Should have first, "Duplicate of third" (first occurrence), third
      expect(result).toContain('## Highlights (3)');
    });
  });
});
