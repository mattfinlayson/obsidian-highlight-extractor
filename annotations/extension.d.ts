import { Extension } from '@codemirror/state';
export declare function highlightExtension(colorOptions: string[], createFileFromHighlight: (text: string) => Promise<void>): Extension;
export declare function createHighlight(editorView: unknown): boolean;
export declare function createMultilineHighlight(editorView: unknown): boolean;
