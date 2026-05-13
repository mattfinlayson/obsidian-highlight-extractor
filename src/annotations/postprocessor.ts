import { type MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
import { closeAnnotationPopover, openAnnotationPopover } from './popover';
import { extractAnnotationColor, MARKER_END, MARKER_START, stripAnnotationColor } from './utils';

interface HighlightMatch {
  highlightText: string;
  comment: string;
  isMultiline: boolean;
}

interface ReadModeAnnotationActions {
  onNewNote?: (text: string) => Promise<void>;
}

class MarginComment extends MarkdownRenderChild {
  private noteEl: HTMLElement;
  private openedPopover = false;

  constructor(
    containerEl: HTMLElement,
    private readonly comment: string,
    private readonly mark: HTMLElement,
    private readonly position: 'left' | 'right',
    private readonly color: string | null,
    private readonly openPopover?: () => void,
  ) {
    super(containerEl);
    this.noteEl = containerEl.createDiv({ cls: 'reading-assistant-margin-comment' });
  }

  onload(): void {
    this.noteEl.setText(
      this.comment.length > 200 ? `${this.comment.substring(0, 200)}...` : this.comment,
    );
    this.noteEl.addClass(this.position === 'left' ? 'is-left' : 'is-right');

    if (this.color) {
      this.noteEl.style.setProperty('--reading-assistant-comment-color', this.color);
    }

    this.registerDomEvent(this.mark, 'mouseenter', () => {
      this.mark.addClass('hover');
      this.noteEl.addClass('hover');
    });
    this.registerDomEvent(this.mark, 'mouseleave', () => {
      this.mark.removeClass('hover');
      this.noteEl.removeClass('hover');
    });
    this.registerDomEvent(this.noteEl, 'mouseenter', () => this.mark.addClass('hover'));
    this.registerDomEvent(this.noteEl, 'mouseleave', () => this.mark.removeClass('hover'));

    if (this.openPopover) {
      this.registerDomEvent(this.mark, 'click', (event) => {
        event.preventDefault();
        this.openedPopover = true;
        this.openPopover?.();
      });
      this.registerDomEvent(this.mark, 'keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }

        event.preventDefault();
        this.openedPopover = true;
        this.openPopover?.();
      });
      this.mark.setAttribute('role', 'button');
      this.mark.setAttribute('tabindex', '0');
      this.mark.setAttribute('aria-label', 'Open annotation comment');
    }
  }

  onunload(): void {
    if (this.openedPopover) {
      closeAnnotationPopover(this.mark.ownerDocument);
    }

    this.noteEl.remove();
  }
}

export function annotationPostprocessor(
  colorOptions: string[],
  actions: ReadModeAnnotationActions,
  element: HTMLElement,
  { getSectionInfo, addChild }: MarkdownPostProcessorContext,
): void {
  const section = getSectionInfo(element);
  if (!section) {
    return;
  }

  const matches = findAnnotatedHighlights(section.text);
  if (!matches.length) {
    return;
  }

  const marks = element.findAll('mark');
  for (const match of matches.filter((match) => match.isMultiline)) {
    if (!marks.some((mark) => getElementText(mark) === match.highlightText)) {
      const mark = wrapFirstTextOccurrence(element, match.highlightText);
      if (mark) {
        marks.push(mark);
      }
    }
  }

  if (!marks.length) {
    return;
  }

  let counter = 0;

  for (const mark of marks) {
    mark.addClass('reading-assistant-highlight');
    const matchIndex = matches.findIndex((match) => match.highlightText === getElementText(mark));
    if (matchIndex === -1) {
      continue;
    }

    const match = matches.splice(matchIndex, 1)[0];
    const color = extractAnnotationColor(match.comment, colorOptions);
    const cleanComment = stripAnnotationColor(match.comment, colorOptions);

    if (match.isMultiline) {
      mark.addClass('multiline');
    }

    if (color) {
      mark.style.backgroundColor = color;
    }

    if (!cleanComment) {
      continue;
    }

    mark.addClass('has-comment');
    mark.setAttribute('title', cleanComment);
    element.addClass('reading-assistant-section');
    addChild(
      new MarginComment(
        element,
        cleanComment,
        mark,
        counter % 2 ? 'left' : 'right',
        color,
        match.isMultiline
          ? () => {
              openAnnotationPopover({
                mode: 'readonly',
                anchorEl: mark,
                highlightText: match.highlightText,
                comment: match.comment,
                colorOptions,
                onNewNote: actions.onNewNote
                  ? () => actions.onNewNote?.(match.highlightText)
                  : undefined,
              });
            }
          : undefined,
      ),
    );
    counter++;
  }
}

function getElementText(element: HTMLElement): string {
  return element.innerText ?? element.textContent ?? '';
}

function findAnnotatedHighlights(content: string): HighlightMatch[] {
  const matches: HighlightMatch[] = [];
  const multilineStartRegex = new RegExp(
    `${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^%]+)%%`,
    'g',
  );
  for (
    let match = multilineStartRegex.exec(content);
    match !== null;
    match = multilineStartRegex.exec(content)
  ) {
    const id = match[1].trim();
    const afterStart = match.index + match[0].length;
    const endMarker = `${MARKER_END}${id}%%`;
    const endIdx = content.indexOf(endMarker, afterStart);

    if (endIdx === -1) {
      continue;
    }

    const afterEnd = endIdx + endMarker.length;
    const commentMatch = content.substring(afterEnd).match(/^<!--([\s\S]*?)-->/);

    matches.push({
      highlightText: content.substring(afterStart, endIdx).replace(/^\n/, '').replace(/\n$/, ''),
      comment: commentMatch ? commentMatch[1] : '',
      isMultiline: true,
    });
  }

  const annotatedRegex = /==([^=]+)==\s*<!--([\s\S]*?)-->/g;
  for (
    let match = annotatedRegex.exec(content);
    match !== null;
    match = annotatedRegex.exec(content)
  ) {
    matches.push({
      highlightText: match[1],
      comment: match[2],
      isMultiline: false,
    });
  }

  return matches;
}

function wrapFirstTextOccurrence(root: HTMLElement, text: string): HTMLElement | null {
  const doc = root.ownerDocument;
  const showText = doc.defaultView?.NodeFilter.SHOW_TEXT ?? 4;
  const walker = doc.createTreeWalker(root, showText);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const textNode = node as Text;
    const index = textNode.data.indexOf(text);
    if (index === -1) {
      continue;
    }

    const range = doc.createRange();
    range.setStart(textNode, index);
    range.setEnd(textNode, index + text.length);

    const mark = doc.createElement('mark');
    mark.addClass('reading-assistant-highlight');
    range.surroundContents(mark);
    return mark;
  }

  return null;
}
