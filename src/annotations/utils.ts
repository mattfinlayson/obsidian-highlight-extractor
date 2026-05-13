export const MARKER_START = '%%highlight-start:';
export const MARKER_END = '%%highlight-end:';
export const LINE_MARKER_PREFIX = '%ra-highlight-';
export const LINE_MARKER_SUFFIX = '%';
export const LINE_MARKER_REGEX = /%ra-highlight-([a-zA-Z0-9_-]+)%/;

export function generateAnnotationId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function extractAnnotationColor(comment: string, colorOptions: string[]): string | null {
  const colorName = comment.match(/@(\w+)/)?.[1];
  if (!colorName) {
    return null;
  }

  return colorOptions.includes(colorName) ? colorName : null;
}

export function stripAnnotationColor(comment: string, colorOptions: string[]): string {
  const color = extractAnnotationColor(comment, colorOptions);
  if (!color) {
    return comment.trim();
  }

  return comment.replace(new RegExp(`\\s*@${color}\\b`), '').trim();
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
