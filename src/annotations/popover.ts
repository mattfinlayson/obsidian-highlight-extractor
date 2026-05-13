import { Notice, setIcon } from 'obsidian';
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
  editButton: HTMLButtonElement;
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
  const editorRegionId = 'reading-assistant-comment-popover-editor';
  const removeButton = toolbar.createEl('button', {
    cls: 'clickable-icon',
  }) as HTMLButtonElement;
  removeButton.setAttribute('type', 'button');
  removeButton.setAttribute('aria-label', 'Remove annotation');
  setIcon(removeButton, 'trash-2');
  if (options.mode === 'editable') {
    removeButton.addEventListener('click', () => {
      hideAnnotationPopover(popover);
      options.onRemove();
    });
  } else {
    removeButton.setAttribute('aria-disabled', 'true');
  }

  const editButton = toolbar.createEl('button', {
    cls: 'clickable-icon',
  }) as HTMLButtonElement;
  editButton.setAttribute('type', 'button');
  editButton.setAttribute('aria-label', 'Edit annotation comment');
  editButton.setAttribute('aria-controls', editorRegionId);
  editButton.setAttribute('aria-expanded', 'false');
  setIcon(editButton, 'pencil');

  const actions = toolbar.createDiv({ cls: 'reading-assistant-popover-actions' });
  const copyButton = actions.createEl('button', {
    cls: 'clickable-icon',
  }) as HTMLButtonElement;
  copyButton.setAttribute('type', 'button');
  copyButton.setAttribute('aria-label', 'Copy highlight');
  setIcon(copyButton, 'copy');
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
    cls: 'clickable-icon',
  }) as HTMLButtonElement;
  newFileButton.setAttribute('type', 'button');
  newFileButton.setAttribute('aria-label', 'Extract highlight to new note');
  setIcon(newFileButton, 'file-plus');
  newFileButton.disabled = !options.onNewNote;
  newFileButton.addEventListener('click', async () => {
    if (!options.onNewNote) {
      return;
    }

    hideAnnotationPopover(popover);
    await options.onNewNote();
  });

  const editorRegion = popover.createDiv({
    cls: 'reading-assistant-popover-editor',
  });
  editorRegion.id = editorRegionId;
  const textarea = editorRegion.createEl('textarea', {
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

  const colorRow = editorRegion.createDiv({ cls: 'reading-assistant-color-row' });
  addColorButton(
    colorRow,
    textarea,
    null,
    options.mode === 'editable' ? options.onSave : undefined,
  );
  for (const color of options.colorOptions) {
    addColorButton(
      colorRow,
      textarea,
      color,
      options.mode === 'editable' ? options.onSave : undefined,
    );
  }

  editButton.addEventListener('click', () => {
    const isEditing = popover.classList.toggle('is-editing');
    editButton.setAttribute('aria-expanded', String(isEditing));
    if (isEditing) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  });

  return { container: popover, textarea, editButton };
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
  refs.editButton.focus();
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
  onSave: ((comment: string, selectedColor: string | null) => void) | undefined,
): void {
  const button = parent.createEl('button', {
    cls: 'reading-assistant-color-button',
  }) as HTMLButtonElement;
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', color ? `Save with ${color}` : 'Save without color');
  button.style.backgroundColor = color || 'var(--text-highlight-bg)';
  if (onSave) {
    button.addEventListener('click', () => onSave(textarea.value, color));
  } else {
    button.setAttribute('aria-disabled', 'true');
  }
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
