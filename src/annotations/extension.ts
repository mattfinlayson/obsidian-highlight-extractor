import {
  type EditorState,
  type Extension,
  type Range,
  StateEffect,
  StateField,
  type Text,
} from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from '@codemirror/view';
import { Notice } from 'obsidian';
import { cleanupPopovers, closeAnnotationPopover, openAnnotationPopover } from './popover';
import {
  extractAnnotationColor,
  generateAnnotationId,
  MARKER_END,
  MARKER_START,
  stripAnnotationColor,
} from './utils';

const showPopoverEffect = StateEffect.define<{ from: number; to: number }>();

interface HighlightMatch {
  from: number;
  to: number;
  highlightText: string;
  comment?: string;
  hasComment: boolean;
  hasColor: boolean;
  isMultiline?: boolean;
  annotationId?: string;
}

class HighlightWidget extends WidgetType {
  private view: EditorView | null = null;
  private wrapperEl: HTMLElement | null = null;

  constructor(
    private readonly highlightText: string,
    private readonly comment: string | undefined,
    private readonly from: number,
    private readonly to: number,
    private readonly hasComment: boolean,
    private readonly hasColor: boolean,
    private readonly colorOptions: string[],
    private readonly createFileFromHighlight: (text: string) => Promise<void>,
    private readonly isMultiline = false,
    private readonly annotationId?: string,
  ) {
    super();
  }

  eq(other: HighlightWidget): boolean {
    return (
      this.highlightText === other.highlightText &&
      this.comment === other.comment &&
      this.from === other.from &&
      this.to === other.to &&
      this.hasComment === other.hasComment &&
      this.hasColor === other.hasColor
    );
  }

  toDOM(view: EditorView): HTMLElement {
    this.view = view;
    const wrapper = view.dom.ownerDocument.createElement('span');
    this.wrapperEl = wrapper;
    wrapper.className = this.hasComment
      ? 'reading-assistant-highlight has-comment'
      : 'reading-assistant-highlight';

    if (this.hasColor) {
      wrapper.classList.add('has-color');
    }

    if (this.isMultiline) {
      wrapper.classList.add('multiline');
    }

    wrapper.textContent = this.highlightText;

    if (this.comment) {
      const cleanComment = stripAnnotationColor(this.comment, this.colorOptions);
      wrapper.title = cleanComment;
      this.setHighlightColor(this.comment);
    }

    wrapper.addEventListener('click', () => {
      this.showPopover();
    });

    return wrapper;
  }

  public showPopover(): void {
    if (!this.view || !this.wrapperEl) {
      return;
    }

    openAnnotationPopover({
      mode: 'editable',
      anchorEl: this.wrapperEl,
      highlightText: this.highlightText,
      comment: this.comment,
      colorOptions: this.colorOptions,
      onRemove: () => this.handleCommentRemoval(),
      onNewNote: () => this.createFileFromHighlight(this.highlightText),
      onSave: (comment, selectedColor) => this.saveComment(comment, selectedColor),
    });
  }

  private saveComment(comment: string, selectedColor: string | null): void {
    if (comment.includes('-->')) {
      new Notice('Comment must not contain -->');
      return;
    }

    if (comment.includes('\n\n')) {
      new Notice('Comment must not contain empty lines');
      return;
    }

    if (this.view) {
      closeAnnotationPopover(this.view.dom.ownerDocument);
    }
    const color = selectedColor ? ` @${selectedColor}` : '';
    this.handleCommentUpdate(`${comment.trim()}${color}`.trim());
  }

  private handleCommentRemoval(): void {
    if (!this.view) {
      return;
    }

    if (this.isMultiline && this.annotationId) {
      const { startIdx, endIdx, removeEnd } = this.findMultilineRange();
      if (startIdx === -1 || endIdx === -1) {
        return;
      }

      const content = this.view.state.doc
        .toString()
        .substring(startIdx + `${MARKER_START}${this.annotationId}%%`.length, endIdx);
      const cleanContent = content.startsWith('\n') ? content.substring(1) : content;

      this.view.dispatch({
        changes: {
          from: startIdx,
          to: removeEnd,
          insert: cleanContent.endsWith('\n') ? cleanContent.slice(0, -1) : cleanContent,
        },
      });
      return;
    }

    this.view.dispatch({
      changes: {
        from: this.from,
        to: this.to,
        insert: this.highlightText,
      },
    });
  }

  private handleCommentUpdate(newComment: string): void {
    if (!this.view) {
      return;
    }

    if (this.isMultiline && this.annotationId) {
      const { startIdx, endIdx, removeEnd } = this.findMultilineRange();
      if (startIdx === -1 || endIdx === -1) {
        return;
      }

      const startMarker = `${MARKER_START}${this.annotationId}%%`;
      const endMarker = `${MARKER_END}${this.annotationId}%%`;
      const newText = newComment
        ? `${startMarker}\n${this.highlightText}\n${endMarker}<!--${newComment}-->`
        : `${startMarker}\n${this.highlightText}\n${endMarker}`;

      this.view.dispatch({
        changes: {
          from: startIdx,
          to: removeEnd,
          insert: newText,
        },
      });
      return;
    }

    const newText = newComment
      ? `==${this.highlightText}==<!--${newComment}-->`
      : `==${this.highlightText}==`;

    this.view.dispatch({
      changes: {
        from: this.from,
        to: this.to,
        insert: newText,
      },
    });
  }

  private findMultilineRange(): {
    startIdx: number;
    endIdx: number;
    endMarker: string;
    removeEnd: number;
  } {
    if (!this.view || !this.annotationId) {
      return { startIdx: -1, endIdx: -1, endMarker: '', removeEnd: -1 };
    }

    const startMarker = `${MARKER_START}${this.annotationId}%%`;
    const endMarker = `${MARKER_END}${this.annotationId}%%`;
    const docText = this.view.state.doc.toString();
    const startIdx = docText.indexOf(startMarker);
    const endIdx = docText.indexOf(endMarker, startIdx + startMarker.length);

    if (startIdx === -1 || endIdx === -1) {
      return { startIdx, endIdx, endMarker, removeEnd: -1 };
    }

    const afterEnd = endIdx + endMarker.length;
    const commentMatch = docText.substring(afterEnd).match(/^\s*<!--[\s\S]*?-->/);
    const removeEnd = commentMatch ? afterEnd + commentMatch[0].length : afterEnd;
    return { startIdx, endIdx, endMarker, removeEnd };
  }

  private setHighlightColor(comment: string): void {
    const matchedColor = extractAnnotationColor(comment, this.colorOptions);
    if (this.wrapperEl) {
      this.wrapperEl.style.backgroundColor = matchedColor || 'var(--text-highlight-bg)';
    }
  }
}

function findHighlightsAndComments(doc: Text, colorOptions: string[]): HighlightMatch[] {
  const matches: HighlightMatch[] = [];
  const docText = doc.toString();
  const multilineStartRegex = new RegExp(
    `${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^%]+)%%`,
    'g',
  );
  for (
    let match = multilineStartRegex.exec(docText);
    match !== null;
    match = multilineStartRegex.exec(docText)
  ) {
    const id = match[1].trim();
    const afterStart = match.index + match[0].length;
    const endMarker = `${MARKER_END}${id}%%`;
    const endIdx = docText.indexOf(endMarker, afterStart);

    if (endIdx === -1) {
      continue;
    }

    const content = docText.substring(afterStart, endIdx).replace(/^\n/, '').replace(/\n$/, '');
    const fullEnd = endIdx + endMarker.length;
    const commentMatch = docText.substring(fullEnd).match(/^\s*<!--([\s\S]*?)-->/);
    const comment = commentMatch ? commentMatch[1] : undefined;
    const matchedColor = comment ? extractAnnotationColor(comment, colorOptions) : null;
    const hasComment = comment !== undefined && stripAnnotationColor(comment, colorOptions) !== '';
    const fullMatchEnd = commentMatch ? fullEnd + commentMatch[0].length : fullEnd;

    matches.push({
      from: match.index,
      to: fullMatchEnd,
      highlightText: content,
      hasColor: matchedColor !== null,
      hasComment,
      comment,
      isMultiline: true,
      annotationId: id,
    });
  }

  const annotatedRegex = /==([^=]+)==\s*<!--([\s\S]*?)-->/gm;
  for (
    let match = annotatedRegex.exec(docText);
    match !== null;
    match = annotatedRegex.exec(docText)
  ) {
    const matchStart = match.index;
    if (matches.some((existing) => matchStart >= existing.from && matchStart < existing.to)) {
      continue;
    }

    const comment = match[2];
    matches.push({
      from: matchStart,
      to: matchStart + match[0].length,
      highlightText: match[1],
      hasColor: extractAnnotationColor(comment, colorOptions) !== null,
      hasComment: stripAnnotationColor(comment, colorOptions) !== '',
      comment,
    });
  }

  const highlightRegex = /==(?!<!--)([^=]+)==(?!<!--)/gm;
  for (
    let match = highlightRegex.exec(docText);
    match !== null;
    match = highlightRegex.exec(docText)
  ) {
    const matchStart = match.index;
    if (matches.some((existing) => matchStart >= existing.from && matchStart < existing.to)) {
      continue;
    }

    matches.push({
      from: matchStart,
      to: matchStart + match[0].length,
      highlightText: match[1],
      hasComment: false,
      hasColor: false,
    });
  }

  return matches.sort((a, b) => a.from - b.from);
}

function createHighlightDecorations(
  state: EditorState,
  colorOptions: string[],
  createFileFromHighlight: (text: string) => Promise<void>,
): DecorationSet {
  const decorations: Range<Decoration>[] = [];

  for (const match of findHighlightsAndComments(state.doc, colorOptions)) {
    decorations.push(
      Decoration.replace({
        widget: new HighlightWidget(
          match.highlightText,
          match.comment,
          match.from,
          match.to,
          match.hasComment,
          match.hasColor,
          colorOptions,
          createFileFromHighlight,
          match.isMultiline ?? false,
          match.annotationId,
        ),
      }).range(match.from, match.to),
    );
  }

  return Decoration.set(decorations, true);
}

export function highlightExtension(
  colorOptions: string[],
  createFileFromHighlight: (text: string) => Promise<void>,
): Extension {
  const highlightField = StateField.define<DecorationSet>({
    create(state) {
      return createHighlightDecorations(state, colorOptions, createFileFromHighlight);
    },
    update(decorations, transaction) {
      if (transaction.docChanged) {
        return createHighlightDecorations(transaction.state, colorOptions, createFileFromHighlight);
      }

      return decorations.map(transaction.changes);
    },
    provide: (field) => EditorView.decorations.from(field),
  });

  const highlightPlugin = ViewPlugin.fromClass(
    class {
      update(update: ViewUpdate): void {
        for (const transaction of update.transactions) {
          for (const effect of transaction.effects) {
            if (!effect.is(showPopoverEffect)) {
              continue;
            }

            const decorations = update.state.field(highlightField);
            decorations.between(effect.value.from, effect.value.to, (_from, _to, decoration) => {
              if (!(decoration.spec.widget instanceof HighlightWidget)) {
                return;
              }

              update.view.dom.ownerDocument.defaultView?.setTimeout(
                () => decoration.spec.widget.showPopover(),
                0,
              );
            });
          }
        }
      }
    },
  );

  return [highlightField, highlightPlugin];
}

export function createHighlight(editorView: unknown): boolean {
  const view = editorView as EditorView;
  const selection = view.state.selection.main;
  if (selection.empty) {
    return false;
  }

  const selectedText = view.state.doc.sliceString(selection.from, selection.to);
  const highlightText = `==${selectedText}==`;

  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: highlightText,
    },
    effects: [
      showPopoverEffect.of({
        from: selection.from,
        to: selection.from + highlightText.length,
      }),
    ],
  });

  return true;
}

export function createMultilineHighlight(editorView: unknown): boolean {
  const view = editorView as EditorView;
  const selection = view.state.selection.main;
  if (selection.empty) {
    return false;
  }

  const selectedText = view.state.doc.sliceString(selection.from, selection.to);
  const id = generateAnnotationId();
  const wrappedText = `${MARKER_START}${id}%%\n${selectedText}\n${MARKER_END}${id}%%`;

  view.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: wrappedText,
    },
    effects: [
      showPopoverEffect.of({
        from: selection.from,
        to: selection.from + wrappedText.length,
      }),
    ],
  });

  return true;
}

export { cleanupPopovers };
