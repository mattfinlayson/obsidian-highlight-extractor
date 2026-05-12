import { clearAllAnnotationsCommand, deleteAnnotationCommand } from '../src/annotations/commands';

interface Position {
  line: number;
  ch: number;
}

class FakeEditor {
  private lines: string[];

  constructor(
    value: string,
    private cursor: Position,
  ) {
    this.lines = value.split('\n');
  }

  getValue(): string {
    return this.lines.join('\n');
  }

  setValue(value: string): void {
    this.lines = value.split('\n');
  }

  getSelection(): string {
    return '';
  }

  blur(): void {}

  getCursor(): Position {
    return this.cursor;
  }

  getLine(line: number): string {
    return this.lines[line] ?? '';
  }

  lineCount(): number {
    return this.lines.length;
  }

  getRange(from: Position, to: Position): string {
    if (from.line === to.line) {
      return this.lines[from.line].substring(from.ch, to.ch);
    }

    const selected = [this.lines[from.line].substring(from.ch)];
    for (let line = from.line + 1; line < to.line; line++) {
      selected.push(this.lines[line]);
    }
    selected.push(this.lines[to.line].substring(0, to.ch));
    return selected.join('\n');
  }

  replaceRange(text: string, from: Position, to: Position): void {
    const before = this.lines[from.line].substring(0, from.ch);
    const after = this.lines[to.line].substring(to.ch);
    const replacement = `${before}${text}${after}`.split('\n');
    this.lines.splice(from.line, to.line - from.line + 1, ...replacement);
  }
}

describe('annotation commands', () => {
  it('does not delete the previous multiline annotation when the cursor is outside it', () => {
    const content = [
      '%%highlight-start:abc%%',
      'Selected text',
      '%%highlight-end:abc%% <!--note-->',
      '',
      'Cursor is here',
    ].join('\n');
    const editor = new FakeEditor(content, { line: 4, ch: 3 });

    const result = deleteAnnotationCommand(editor as never);

    expect(result).toBe(false);
    expect(editor.getValue()).toBe(content);
  });

  it('deletes a multiline annotation at the cursor while preserving selected text', () => {
    const content = [
      'Intro',
      '%%highlight-start:abc%%',
      'Selected text',
      '%%highlight-end:abc%% <!--note-->',
      'Outro',
    ].join('\n');
    const editor = new FakeEditor(content, { line: 2, ch: 4 });

    const result = deleteAnnotationCommand(editor as never);

    expect(result).toBe(true);
    expect(editor.getValue()).toBe(['Intro', 'Selected text', '', 'Outro'].join('\n'));
  });

  it('deletes a single-line annotation with whitespace before its comment', () => {
    const editor = new FakeEditor('A ==highlight== <!--note--> B', { line: 0, ch: 6 });

    const result = deleteAnnotationCommand(editor as never);

    expect(result).toBe(true);
    expect(editor.getValue()).toBe('A highlight B');
  });

  it('clears annotations without removing non-annotation content', () => {
    const editor = new FakeEditor(
      [
        'Before ==one== <!--comment-->',
        '%%highlight-start:abc%%',
        'Two',
        '%%highlight-end:abc%% <!--comment-->',
        'After',
      ].join('\n'),
      { line: 0, ch: 0 },
    );

    const result = clearAllAnnotationsCommand(editor as never);

    expect(result).toBe(true);
    expect(editor.getValue()).toBe(['Before one', 'Two', 'After'].join('\n'));
  });
});
