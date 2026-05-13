import { type MarkdownPostProcessorContext } from 'obsidian';
interface ReadModeAnnotationActions {
    onNewNote?: (text: string) => Promise<void>;
}
export declare function annotationPostprocessor(colorOptions: string[], actions: ReadModeAnnotationActions, element: HTMLElement, { getSectionInfo, addChild }: MarkdownPostProcessorContext): void;
export {};
