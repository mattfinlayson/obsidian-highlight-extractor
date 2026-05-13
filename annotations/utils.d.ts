export declare const MARKER_START = "%%highlight-start:";
export declare const MARKER_END = "%%highlight-end:";
export declare const LINE_MARKER_PREFIX = "%ra-highlight-";
export declare const LINE_MARKER_SUFFIX = "%";
export declare const LINE_MARKER_REGEX: RegExp;
export declare function generateAnnotationId(): string;
export declare function extractAnnotationColor(comment: string, colorOptions: string[]): string | null;
export declare function stripAnnotationColor(comment: string, colorOptions: string[]): string;
export declare function escapeRegExp(value: string): string;
