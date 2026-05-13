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
export type AnnotationPopoverOptions = EditableAnnotationPopoverOptions | ReadonlyAnnotationPopoverOptions;
export interface AnnotationPopoverRefs {
    container: HTMLElement;
    textarea: HTMLTextAreaElement;
}
export declare function renderAnnotationPopover(options: AnnotationPopoverOptions): AnnotationPopoverRefs;
export declare function openAnnotationPopover(options: AnnotationPopoverOptions): AnnotationPopoverRefs;
export declare function cleanupPopovers(): void;
export declare function closeAnnotationPopover(doc: Document): void;
export {};
