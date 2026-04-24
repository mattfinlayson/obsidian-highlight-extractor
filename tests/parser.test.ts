/**
 * Parser unit tests
 */

import {
  parseHighlights,
  parseComments,
  parseDocument,
  findHeadingContext,
  extractColorTag
} from '../src/utils/parser';

describe('Parser', () => {
  describe('parseHighlights', () => {
    it('should extract single highlight', () => {
      const content = 'This is ==important text== in a document.';
      const highlights = parseHighlights(content);
      
      expect(highlights).toHaveLength(1);
      expect(highlights[0].text).toBe('important text');
    });

    it('should extract multiple highlights', () => {
      const content = 'First ==highlight== and second ==highlight two==.';
      const highlights = parseHighlights(content);
      
      expect(highlights).toHaveLength(2);
      expect(highlights[0].text).toBe('highlight');
      expect(highlights[1].text).toBe('highlight two');
    });

    it('should extract multiline highlights', () => {
      const content = '==This is a multiline\nhighlight section==';
      const highlights = parseHighlights(content);
      
      expect(highlights).toHaveLength(1);
      expect(highlights[0].text).toBe('This is a multiline\nhighlight section');
    });

    it('should skip empty highlights', () => {
      const content = '==empty== and ==not empty==';
      const highlights = parseHighlights(content);
      
      expect(highlights).toHaveLength(1);
      expect(highlights[0].text).toBe('not empty');
    });

    it('should handle no highlights', () => {
      const content = 'No highlights in this text.';
      const highlights = parseHighlights(content);
      
      expect(highlights).toHaveLength(0);
    });

    it('should preserve document positions', () => {
      const content = 'Before ==highlight== after';
      const highlights = parseHighlights(content);
      
      expect(highlights[0].startIndex).toBe(7);
      expect(highlights[0].endIndex).toBe(18);
    });
  });

  describe('parseComments', () => {
    it('should extract single comment', () => {
      const content = 'Text before <!-- This is a comment --> text after.';
      const comments = parseComments(content);
      
      expect(comments).toHaveLength(1);
      expect(comments[0].text).toBe('This is a comment');
    });

    it('should extract multiple comments', () => {
      const content = '<!-- First --> text <!-- Second -->';
      const comments = parseComments(content);
      
      expect(comments).toHaveLength(2);
      expect(comments[0].text).toBe('First');
      expect(comments[1].text).toBe('Second');
    });

    it('should extract color tag comments', () => {
      const content = '<!-- @lightpink -->';
      const comments = parseComments(content);
      
      expect(comments).toHaveLength(1);
      expect(comments[0].text).toBe('@lightpink');
      expect(comments[0].colorTag).toBe('lightpink');
      expect(comments[0].isColorDefinition).toBe(true);
    });

    it('should handle comments with text and color tag', () => {
      const content = '<!-- Note about this @highlight -->';
      const comments = parseComments(content);
      
      expect(comments).toHaveLength(1);
      expect(comments[0].colorTag).toBeNull();
      expect(comments[0].isColorDefinition).toBe(false);
    });

    it('should extract multiline comments', () => {
      const content = '<!-- Multi\nline\ncomment -->';
      const comments = parseComments(content);
      
      expect(comments).toHaveLength(1);
      expect(comments[0].text).toBe('Multi\nline\ncomment');
    });
  });

  describe('findHeadingContext', () => {
    it('should find heading above position', () => {
      const content = '# Title\n\n==highlight==';
      const context = findHeadingContext(content, 20);
      
      expect(context).toBe('# Title');
    });

    it('should find nearest heading', () => {
      const content = '# First\n\nSome text\n\n## Second\n\n==highlight==';
      const context = findHeadingContext(content, 40);
      
      expect(context).toBe('## Second');
    });

    it('should return empty string when no heading', () => {
      const content = 'No heading ==here==';
      const context = findHeadingContext(content, 15);
      
      expect(context).toBe('');
    });
  });

  describe('parseDocument', () => {
    it('should parse both highlights and comments', () => {
      const content = '# Test\n\n==highlight== text <!-- comment -->';
      const result = parseDocument(content);
      
      expect(result.highlights).toHaveLength(1);
      expect(result.comments).toHaveLength(1);
    });

    it('should fill heading context for each highlight', () => {
      const content = '# Section\n\n==text==';
      const result = parseDocument(content);
      
      expect(result.highlights[0].headingContext).toBe('# Section');
    });
  });

  describe('extractColorTag', () => {
    it('should extract color name from comment', () => {
      const result = extractColorTag('<!-- @lightpink -->');
      expect(result).toBe('lightpink');
    });

    it('should return null for non-color comments', () => {
      const result = extractColorTag('<!-- Just a note -->');
      expect(result).toBeNull();
    });

    it('should handle color tag without spaces', () => {
      const result = extractColorTag('<!--@blue-->');
      expect(result).toBe('blue');
    });
  });
});
