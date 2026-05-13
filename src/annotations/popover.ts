import { Notice } from 'obsidian';
import { extractAnnotationColor, stripAnnotationColor } from './utils';

const popovers = new Set<HTMLElement>();

interface AnnotationPopoverBaseOptions {
  anchorEl: HTMLElement;
  highlightText: string;
  comment?: string;
  colorOptions: string[];
  onCopy?: () => void | Promise<void>;
  onNewNote?: () => void | Promise<void>;
}

export interface EditableAnnotationPopoverOptions extends AnnotationPopoverBaseOptions {
  mode: 'editable';
  onRemove: () => void;
  onSave: (comment: string, selectedColor: string | null) => void;
}

export interface ReadonlyAnnotationPopoverOptions extends AnnotationPopoverBaseOptions {
  mode: 'readonly';
}

export type AnnotationPopoverOptions =
  | EditableAnnotationPopoverOptions
  | ReadonlyAnnotationPopoverOptions;

export interface AnnotationPopoverRefs {
  container: HTMLElement;
  textarea: HTMLTextAreaElement;
}

export function renderAnnotationPopover(options: AnnotationPopoverOptions): AnnotationPopoverRefs {
  const doc = options.anchorEl.ownerDocument;
  const popover = getAnnotationPopover(doc);
  popover.empty();

  const initialColor = options.comment
    ? extractAnnotationColor(options.comment, options.colorOptions)
    : null;
  const initialComment = options.comment
    ? stripAnnotationColor(options.comment, options.colorOptions)
    : '';

  const toolbar = popover.createDiv({ cls: 'reading-assistant-popover-toolbar' });
  if (options.mode === 'editable') {
    const removeButton = toolbar.createEl('button', {
      text: 'Remove',
      cls: 'clickable-icon',
    }) as HTMLButtonElement;
    removeButton.setAttribute('type', 'button');
    removeButton.setAttribute('aria-label', 'Remove annotation');
    removeButton.addEventListener('click', () => {
      hideAnnotationPopover(popover);
      options.onRemove();
    });
  } else {
    toolbar.createSpan({
      text: 'Comment',
      cls: 'reading-assistant-popover-label',
    });
  }

  const actions = toolbar.createDiv({ cls: 'reading-assistant-popover-actions' });
  const copyButton = actions.createEl('button', {
    text: 'Copy',
    cls: 'clickable-icon',
  }) as HTMLButtonElement;
  copyButton.setAttribute('type', 'button');
  copyButton.setAttribute('aria-label', 'Copy highlight');
  copyButton.addEventListener('click', async () => {
    hideAnnotationPopover(popover);

    if (options.onCopy) {
      await options.onCopy();
      return;
    }

    await doc.defaultView?.navigator.clipboard.writeText(options.highlightText);
    new Notice('Copied to clipboard');
  });

  const newFileButton = actions.createEl('button', {
    text: 'New note',
    cls: 'clickable-icon',
  }) as HTMLButtonElement;
  newFileButton.setAttribute('type', 'button');
  newFileButton.setAttribute('aria-label', 'Extract highlight to new note');
  newFileButton.disabled = !options.onNewNote;
  newFileButton.addEventListener('click', async () => {
    if (!options.onNewNote) {
      return;
    }

    hideAnnotationPopover(popover);
    await options.onNewNote();
  });

  const textarea = popover.createEl('textarea', {
    cls: 'reading-assistant-popover-comment',
    text: initialComment,
  }) as HTMLTextAreaElement;
  textarea.rows = 5;
  textarea.placeholder = 'Add a comment';
  textarea.readOnly = options.mode === 'readonly';
  textarea.addEventListener('keydown', (event) => {
    if (options.mode !== 'editable' || event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    options.onSave(textarea.value, initialColor);
  });

  if (options.mode === 'editable') {
    const colorRow = popover.createDiv({ cls: 'reading-assistant-color-row' });
    addColorButton(colorRow, textarea, null, options.onSave);
    for (const color of options.colorOptions) {
      addColorButton(colorRow, textarea, color, options.onSave);
    }
  }

  return { container: popover, textarea };
}

export function openAnnotationPopover(options: AnnotationPopoverOptions): AnnotationPopoverRefs {
  const refs = renderAnnotationPopover(options);
  refs.container.style.visibility = 'hidden';
  try {
    showAnnotationPopover(refs.container);
    positionAnnotationPopover(refs.container, options.anchorEl);
  } finally {
    refs.container.style.visibility = '';
  }
  refs.textarea.focus();
  refs.textarea.setSelectionRange(refs.textarea.value.length, refs.textarea.value.length);
  return refs;
}

function getAnnotationPopover(doc: Document): HTMLElement {
  const existing = doc.getElementById('reading-assistant-comment-popover');
  if (existing) {
    return existing;
  }

  const popover = doc.body.createDiv();
  popover.id = 'reading-assistant-comment-popover';
  popover.setAttribute('popover', 'auto');
  popover.hidden = true;
  popovers.add(popover);
  return popover;
}

export function cleanupPopovers(): void {
  for (const popover of popovers) {
    popover.remove();
  }

  popovers.clear();
}

export function closeAnnotationPopover(doc: Document): void {
  const popover = doc.getElementById('reading-assistant-comment-popover');
  if (popover) {
    hideAnnotationPopover(popover);
  }
}

function showAnnotationPopover(element: HTMLElement): void {
  element.hidden = false;

  const isPopoverOpen = isNativePopoverOpen(element);
  if (!isPopoverOpen && typeof element.showPopover === 'function') {
    element.showPopover();
  }
}

function hideAnnotationPopover(element: HTMLElement): void {
  if (typeof element.hidePopover === 'function') {
    element.hidePopover();
  }

  element.hidden = true;
}

function isNativePopoverOpen(element: HTMLElement): boolean {
  if (typeof element.matches !== 'function') {
    return false;
  }

  try {
    return element.matches(':popover-open');
  } catch {
    return false;
  }
}

function addColorButton(
  parent: HTMLElement,
  textarea: HTMLTextAreaElement,
  color: string | null,
  onSave: (comment: string, selectedColor: string | null) => void,
): void {
  const button = parent.createEl('button', {
    cls: 'reading-assistant-color-button',
  }) as HTMLButtonElement;
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', color ? `Save with ${color}` : 'Save without color');
  button.style.backgroundColor = color || 'var(--text-highlight-bg)';
  button.addEventListener('click', () => onSave(textarea.value, color));
}

function positionAnnotationPopover(popover: HTMLElement, anchorEl: HTMLElement): void {
  const win = anchorEl.ownerDocument.defaultView;
  if (!win) {
    return;
  }

  const rect = anchorEl.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const centerOffset = (rect.width - popoverRect.width) / 2;
  popover.style.top = `${rect.bottom + win.scrollY + 10}px`;
  popover.style.left = `${rect.left + win.scrollX + centerOffset}px`;

  if (rect.left + popoverRect.width > win.innerWidth) {
    popover.style.left = `${win.innerWidth - popoverRect.width - 8}px`;
  }
}
