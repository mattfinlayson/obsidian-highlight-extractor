import { type Extension } from '@codemirror/state';
import { cleanupPopovers } from './popover';
export declare function highlightExtension(colorOptions: string[], createFileFromHighlight: (text: string) => Promise<void>): Extension;
export declare function createHighlight(editorView: unknown): boolean;
export declare function createMultilineHighlight(editorView: unknown): boolean;
export { cleanupPopovers };
