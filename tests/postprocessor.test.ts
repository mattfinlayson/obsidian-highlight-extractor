/**
 * @jest-environment jsdom
 */

import type { MarkdownRenderChild } from 'obsidian';
import { annotationPostprocessor } from '../src/annotations/postprocessor';
import { installObsidianDomHelpers } from './dom-helpers';

describe('annotation postprocessor', () => {
  beforeEach(() => {
    installObsidianDomHelpers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  it('opens a shared read-only popover for multiline reading-mode highlights', async () => {
    const element = document.body.createDiv();
    element.addClass('markdown-reading-view');
    element.textContent = 'Before Important passage after';
    const children: MarkdownRenderChild[] = [];
    const onNewNote = jest.fn().mockResolvedValue(undefined);

    annotationPostprocessor(['pink'], { onNewNote }, element, {
      getSectionInfo: () => ({
        text: '%%highlight-start:abc%%\nImportant passage\n%%highlight-end:abc%%<!--Note @pink-->',
      }),
      addChild: (child) => {
        children.push(child);
        child.onload();
      },
    });

    const mark = element.querySelector('mark') as HTMLElement;
    expect(mark).not.toBeNull();
    expect(mark.textContent).toBe('Important passage');
    expect(mark.classList.contains('reading-assistant-highlight')).toBe(true);
    expect(mark.classList.contains('multiline')).toBe(true);
    expect(mark.classList.contains('has-comment')).toBe(true);
    expect(mark.getAttribute('role')).toBe('button');
    expect(mark.getAttribute('tabindex')).toBe('0');
    expect(mark.getAttribute('aria-label')).toBe('Open annotation comment');

    mark.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const popover = document.getElementById('reading-assistant-comment-popover') as HTMLElement;
    expect(popover).not.toBeNull();
    expect(popover.querySelector('.reading-assistant-popover-label')?.textContent).toBe('Comment');
    expect(popover.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('Note');
    expect(popover.querySelector<HTMLTextAreaElement>('textarea')?.readOnly).toBe(true);

    popover.querySelector<HTMLButtonElement>('[aria-label="Copy highlight"]')?.click();
    await Promise.resolve();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Important passage');

    popover
      .querySelector<HTMLButtonElement>('[aria-label="Extract highlight to new note"]')
      ?.click();
    await Promise.resolve();
    expect(onNewNote).toHaveBeenCalledWith('Important passage');

    const hidePopover = jest.fn();
    popover.hidePopover = hidePopover;
    children[0].onunload();
    expect(popover.hidden).toBe(true);
    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it('does not add a child when multiline text is absent from rendered DOM', () => {
    const element = document.body.createDiv();
    element.textContent = 'Different rendered text';
    const children: MarkdownRenderChild[] = [];

    annotationPostprocessor(['pink'], {}, element, {
      getSectionInfo: () => ({
        text: '%%highlight-start:abc%%\nMissing passage\n%%highlight-end:abc%%<!--Note @pink-->',
      }),
      addChild: (child) => {
        children.push(child);
      },
    });

    expect(element.querySelector('mark')).toBeNull();
    expect(children).toHaveLength(0);
  });
});
