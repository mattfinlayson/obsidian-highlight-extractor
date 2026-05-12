import { type MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
import { extractAnnotationColor, MARKER_END, MARKER_START, stripAnnotationColor } from './utils';

interface HighlightMatch {
  highlightText: string;
  comment: string;
}

class MarginComment extends MarkdownRenderChild {
  private noteEl: HTMLElement;

  constructor(
    containerEl: HTMLElement,
    private readonly comment: string,
    private readonly mark: HTMLElement,
    private readonly position: 'left' | 'right',
    private readonly color: string | null,
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
  }

  onunload(): void {
    this.noteEl.remove();
  }
}

export function annotationPostprocessor(
  colorOptions: string[],
  element: HTMLElement,
  { getSectionInfo, addChild }: MarkdownPostProcessorContext,
): void {
  const marks = element.findAll('mark');
  if (!marks.length) {
    return;
  }

  const section = getSectionInfo(element);
  if (!section) {
    return;
  }

  const matches = findAnnotatedHighlights(section.text);
  let counter = 0;

  for (const mark of marks) {
    mark.addClass('reading-assistant-highlight');
    const matchIndex = matches.findIndex((match) => match.highlightText === mark.innerText);
    if (matchIndex === -1) {
      continue;
    }

    const match = matches.splice(matchIndex, 1)[0];
    const color = extractAnnotationColor(match.comment, colorOptions);
    const cleanComment = stripAnnotationColor(match.comment, colorOptions);

    if (color) {
      mark.style.backgroundColor = color;
    }

    if (!cleanComment) {
      continue;
    }

    mark.addClass('has-comment');
    mark.setAttribute('title', cleanComment);
    element.addClass('reading-assistant-section');
    addChild(new MarginComment(element, cleanComment, mark, counter % 2 ? 'left' : 'right', color));
    counter++;
  }
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
    });
  }

  const annotatedRegex = /==([^=]+)==<!--([\s\S]*?)-->/g;
  for (
    let match = annotatedRegex.exec(content);
    match !== null;
    match = annotatedRegex.exec(content)
  ) {
    matches.push({
      highlightText: match[1],
      comment: match[2],
    });
  }

  return matches;
}
