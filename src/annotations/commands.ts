import { type Editor, Notice } from 'obsidian';
import { createHighlight, createMultilineHighlight } from './extension';
import { escapeRegExp, MARKER_END, MARKER_START } from './utils';

interface EditorPosition {
  line: number;
  ch: number;
}

interface AnnotationEditor extends Editor {
  blur(): void;
  cm: unknown;
  getCursor(position?: 'from' | 'to'): EditorPosition;
  getLine(line: number): string;
  getRange(from: EditorPosition, to: EditorPosition): string;
  lineCount(): number;
  replaceRange(text: string, from: EditorPosition, to: EditorPosition): void;
  setSelection(from: EditorPosition, to: EditorPosition): void;
  setValue(value: string): void;
}

export function createHighlightCommand(editor: Editor, expandSelection = true): boolean {
  const annotationEditor = editor as AnnotationEditor;
  let selectedText = annotationEditor.getSelection();

  if (!selectedText) {
    new Notice('No text selected');
    return false;
  }

  if (expandSelection) {
    selectedText = expandSelectionBoundary(annotationEditor);
  }

  annotationEditor.blur();
  annotationEditor.cm;

  const sameLine =
    annotationEditor.getCursor('from').line === annotationEditor.getCursor('to').line;

  if (sameLine) {
    return createHighlight(annotationEditor.cm);
  }

  return createMultilineHighlight(annotationEditor.cm);
}

export function deleteAnnotationCommand(editor: Editor): boolean {
  const annotationEditor = editor as AnnotationEditor;
  const cursor = annotationEditor.getCursor();

  let startLine = cursor.line;
  let startId: string | null = null;
  let startCh: number | null = null;

  while (startLine >= 0) {
    const lineText = annotationEditor.getLine(startLine);
    const idx = lineText.indexOf(MARKER_START);

    if (idx !== -1) {
      const afterStart = lineText.substring(idx + MARKER_START.length);
      const idMatch = afterStart.match(/^([^%]+)%%/);
      if (idMatch) {
        startId = idMatch[1].trim();
        startCh = idx;
        break;
      }
    }

    startLine--;
  }

  if (startId === null || startCh === null) {
    return deleteSingleLineHighlightAtCursor(annotationEditor);
  }

  const endMarker = `${MARKER_END}${startId}%%`;
  let endLine = startLine;
  let endCh: number | null = null;
  let endMarkerCh: number | null = null;

  while (endLine < annotationEditor.lineCount()) {
    const lineText = annotationEditor.getLine(endLine);
    const searchFrom = endLine === startLine ? startCh : 0;
    const endIdx = lineText.indexOf(endMarker, searchFrom);
    if (endIdx !== -1) {
      endMarkerCh = endIdx;
      endCh = endIdx + endMarker.length;
      break;
    }
    endLine++;
  }

  if (endCh === null || endMarkerCh === null) {
    new Notice('Incomplete annotation: end marker missing');
    return false;
  }

  const contentStartCh = startCh + `${MARKER_START}${startId}%%`.length;
  const content = annotationEditor.getRange(
    { line: startLine, ch: contentStartCh },
    { line: endLine, ch: endMarkerCh },
  );
  const cleanContent = content.startsWith('\n') ? content.substring(1) : content;

  const endLineText = annotationEditor.getLine(endLine);
  const commentMatch = endLineText.substring(endCh).match(/^<!--[\s\S]*?-->/);
  const deleteEndCh = commentMatch ? endCh + commentMatch[0].length : endCh;

  annotationEditor.replaceRange(
    cleanContent,
    { line: startLine, ch: startCh },
    { line: endLine, ch: deleteEndCh },
  );

  new Notice('Annotation removed');
  return true;
}

export function clearAllAnnotationsCommand(editor: Editor): boolean {
  const annotationEditor = editor as AnnotationEditor;
  let cleaned = annotationEditor.getValue();

  cleaned = cleaned.replace(/(%%highlight-end:[^%]+%%)<!--[\s\S]*?-->/g, '$1');
  cleaned = cleaned.replace(new RegExp(`${escapeRegExp(MARKER_START)}([^%]+)%%\\n?`, 'g'), '');
  cleaned = cleaned.replace(new RegExp(`\\n?${escapeRegExp(MARKER_END)}([^%]+)%%`, 'g'), '');
  cleaned = cleaned.replace(/==([\s\S]*?)==<!--[\s\S]*?-->/g, '$1');
  cleaned = cleaned.replace(/==([\s\S]*?)==/g, '$1');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  annotationEditor.setValue(cleaned);
  new Notice('All annotations cleared');
  return true;
}

function deleteSingleLineHighlightAtCursor(editor: AnnotationEditor): boolean {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const beforeCursor = line.substring(0, cursor.ch);
  const afterCursor = line.substring(cursor.ch);
  const startIdx = beforeCursor.lastIndexOf('==');

  if (startIdx === -1) {
    new Notice('No annotation found at cursor');
    return false;
  }

  const endSearchIndex = afterCursor.indexOf('==');
  if (endSearchIndex === -1) {
    new Notice('No annotation found at cursor');
    return false;
  }

  const to = cursor.ch + endSearchIndex + 2;
  const highlighted = line.substring(startIdx + 2, to - 2);
  const commentMatch = line.substring(to).match(/^<!--[\s\S]*?-->/);
  const finalTo = commentMatch ? to + commentMatch[0].length : to;

  editor.replaceRange(
    highlighted,
    { line: cursor.line, ch: startIdx },
    { line: cursor.line, ch: finalTo },
  );

  new Notice('Annotation removed');
  return true;
}

function expandSelectionBoundary(editor: AnnotationEditor): string {
  const from = editor.getCursor('from');
  const to = editor.getCursor('to');
  const lineFrom = editor.getLine(from.line);
  const lineTo = editor.getLine(to.line);
  let start = from.ch;
  let end = to.ch;

  while (
    start > 0 &&
    /\w/.test(lineFrom[start - 1]) &&
    lineFrom.substring(start - 2, start) !== '=='
  ) {
    start--;
  }

  while (end < lineTo.length && /\w/.test(lineTo[end]) && lineTo.substring(end, end + 2) !== '==') {
    end++;
  }

  while (start < lineFrom.length && /\s/.test(lineFrom[start])) {
    start++;
  }

  while (end > 0 && /\s/.test(lineTo[end - 1])) {
    end--;
  }

  editor.setSelection({ line: from.line, ch: start }, { line: to.line, ch: end });
  return editor.getSelection();
}
