/**
 * @jest-environment jsdom
 */

import { Notice } from 'obsidian';
import {
  cleanupPopovers,
  closeAnnotationPopover,
  openAnnotationPopover,
} from '../src/annotations/popover';
import { installObsidianDomHelpers } from './dom-helpers';

describe('annotation popover', () => {
  beforeEach(() => {
    installObsidianDomHelpers();
    Notice.messages = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    cleanupPopovers();
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  it('saves editable comments with enter and color buttons', () => {
    const anchor = document.body.createDiv();
    const onSave = jest.fn();
    const onRemove = jest.fn();

    const { container, editButton, textarea } = openAnnotationPopover({
      mode: 'editable',
      anchorEl: anchor,
      highlightText: 'Important text',
      comment: 'Original @pink',
      colorOptions: ['pink', 'green'],
      onRemove,
      onSave,
    });

    expect(container.querySelector('.reading-assistant-popover-label')).toBeNull();
    expect(container.classList.contains('is-editing')).toBe(false);
    expect(editButton.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('[data-icon="trash-2"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="pencil"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="copy"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="file-plus"]')).not.toBeNull();
    expect(textarea.value).toBe('Original');
    expect(textarea.readOnly).toBe(false);

    editButton.click();
    expect(container.classList.contains('is-editing')).toBe(true);
    expect(editButton.getAttribute('aria-expanded')).toBe('true');

    textarea.value = 'Updated';
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onSave).toHaveBeenCalledWith('Updated', 'pink');

    const colorButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.reading-assistant-color-button'),
    );
    colorButtons[2].click();
    expect(onSave).toHaveBeenLastCalledWith('Updated', 'green');

    container.querySelector<HTMLButtonElement>('[aria-label="Remove annotation"]')?.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('renders read-only comments with the same controls as editable popovers', async () => {
    const anchor = document.body.createDiv();
    const onNewNote = jest.fn().mockResolvedValue(undefined);

    const { container, editButton, textarea } = openAnnotationPopover({
      mode: 'readonly',
      anchorEl: anchor,
      highlightText: 'Readonly text',
      comment: 'Readonly comment @pink',
      colorOptions: ['pink'],
      onNewNote,
    });

    expect(container.classList.contains('is-editing')).toBe(false);
    expect(editButton.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('[data-icon="trash-2"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="pencil"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="copy"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="file-plus"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Remove annotation"]')).not.toBeNull();
    expect(
      container.querySelector('[aria-label="Remove annotation"]')?.getAttribute('aria-disabled'),
    ).toBe('true');
    expect(container.querySelector('.reading-assistant-color-row')).not.toBeNull();
    expect(textarea.value).toBe('Readonly comment');
    expect(textarea.readOnly).toBe(true);

    editButton.click();
    expect(container.classList.contains('is-editing')).toBe(true);
    expect(editButton.getAttribute('aria-expanded')).toBe('true');

    textarea.value = 'Changed';
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onNewNote).not.toHaveBeenCalled();

    const colorButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.reading-assistant-color-button'),
    );
    expect(colorButtons).toHaveLength(2);
    expect(colorButtons[0].getAttribute('aria-disabled')).toBe('true');
    colorButtons[1].click();
    expect(onNewNote).not.toHaveBeenCalled();

    container.querySelector<HTMLButtonElement>('[aria-label="Copy highlight"]')?.click();
    await Promise.resolve();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Readonly text');
    expect(Notice.messages).toContain('Copied to clipboard');

    container
      .querySelector<HTMLButtonElement>('[aria-label="Extract highlight to new note"]')
      ?.click();
    await Promise.resolve();
    expect(onNewNote).toHaveBeenCalledTimes(1);
  });

  it('does not call native showPopover again when already open', () => {
    const anchor = document.body.createDiv();
    const showPopover = jest.fn();

    openAnnotationPopover({
      mode: 'readonly',
      anchorEl: anchor,
      highlightText: 'First',
      colorOptions: [],
    });

    const popover = document.getElementById('reading-assistant-comment-popover') as HTMLElement;
    popover.showPopover = showPopover;
    jest.spyOn(popover, 'matches').mockImplementation((selector) => selector === ':popover-open');

    openAnnotationPopover({
      mode: 'readonly',
      anchorEl: anchor,
      highlightText: 'Second',
      colorOptions: [],
    });

    expect(showPopover).not.toHaveBeenCalled();
    expect(popover.style.visibility).toBe('');
  });

  it('closes and removes shared popovers', () => {
    const anchor = document.body.createDiv();

    openAnnotationPopover({
      mode: 'readonly',
      anchorEl: anchor,
      highlightText: 'Text',
      colorOptions: [],
    });

    const popover = document.getElementById('reading-assistant-comment-popover') as HTMLElement;
    const hidePopover = jest.fn();
    popover.hidePopover = hidePopover;

    closeAnnotationPopover(document);
    expect(popover.hidden).toBe(true);
    expect(hidePopover).toHaveBeenCalledTimes(1);

    cleanupPopovers();
    expect(document.getElementById('reading-assistant-comment-popover')).toBeNull();
  });
});
