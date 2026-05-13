/**
 * Minimal type definitions for Obsidian API
 * These provide TypeScript type checking without requiring the actual Obsidian API package
 */

declare module 'obsidian' {
  export class Plugin {
    app: App;
    manifest: PluginManifest;

    addCommand(command: Command): Command;
    addSettingTab(tab: SettingTab): void;
    addRibbon(icon: string, title: string, callback: () => void): void;
    addRibbonIcon(icon: string, title: string, callback: () => void): HTMLElement;
    addStatusBarItem(): HTMLElement;
    registerDomEvent<K extends keyof DocumentEventMap>(
      el: Document,
      type: K,
      callback: (event: DocumentEventMap[K]) => void,
    ): void;
    registerDomEvent<K extends keyof HTMLElementEventMap>(
      el: HTMLElement,
      type: K,
      callback: (event: HTMLElementEventMap[K]) => void,
    ): void;
    registerEditorExtension(extension: unknown): void;
    registerMarkdownPostProcessor(processor: MarkdownPostProcessor): void;

    loadData(): Promise<any>;
    saveData(data: any): Promise<void>;

    onload(): void | Promise<void>;
    onunload(): void | Promise<void>;
  }

  export interface Command {
    id: string;
    name: string;
    callback?: () => void | Promise<void>;
    editorCallback?: (editor: Editor) => undefined | boolean | Promise<undefined | boolean>;
    hotkeys?: KeyboardShortcut[];
    checkCallback?: (checking: boolean) => boolean | undefined;
  }

  export interface KeyboardShortcut {
    modifiers: string[];
    key: string;
  }

  export class Notice {
    static messages: string[];
    constructor(message: string, duration?: number);
  }

  export function setIcon(parent: HTMLElement, iconId: string): void;

  export interface App {
    vault: Vault;
    workspace: Workspace;
  }

  export interface Vault {
    read(file: TFile): Promise<string>;
    modify(file: TFile, data: string): Promise<void>;
    process(file: TFile, callback: (data: string) => string | Promise<string>): Promise<void>;
    create(path: string, data: string): Promise<TFile>;
  }

  export interface Workspace {
    containerEl: HTMLElement;
    getActiveFile(): TFile | null;
    openLinkText(linktext: string, sourcePath: string): Promise<void>;
    activeEditor: {
      editor?: Editor;
    } | null;
    activeLeaf: WorkspaceLeaf;
  }

  export interface WorkspaceLeaf {
    view: View;
  }

  export interface View {
    editor: Editor;
  }

  export interface Editor {
    getValue(): string;
    getSelection(): string;
    blur(): void;
  }

  export interface TFile {
    basename: string;
    path: string;
  }

  export interface PluginManifest {
    id: string;
    name: string;
    version: string;
  }

  export class SettingTab {
    containerEl: HTMLElement;
    constructor(app: App, plugin: Plugin);
    display(): void;
  }

  export class Setting {
    constructor(containerEl: HTMLElement);
    setName(name: string): this;
    setDesc(desc: string): this;
    addToggle(callback: (component: ToggleComponent) => void): this;
    addText(callback: (component: TextComponent) => void): this;
    addTextArea(callback: (component: TextAreaComponent) => void): this;
  }

  export class ToggleComponent {
    setValue(value: boolean): void;
    onChange(callback: (value: boolean) => void): void;
  }

  export class TextComponent {
    setValue(value: string): void;
    onChange(callback: (value: string) => void): void;
  }

  export class TextAreaComponent {
    setValue(value: string): void;
    onChange(callback: (value: string) => void): void;
  }

  export type MarkdownPostProcessor = (
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
  ) => void | Promise<void>;

  export interface MarkdownPostProcessorContext {
    getSectionInfo(element: HTMLElement): { text: string } | null;
    addChild(child: MarkdownRenderChild): void;
  }

  export class MarkdownRenderChild {
    containerEl: HTMLElement;
    constructor(containerEl: HTMLElement);
    onload(): void;
    onunload(): void;
    registerDomEvent<K extends keyof HTMLElementEventMap>(
      el: HTMLElement,
      type: K,
      callback: (event: HTMLElementEventMap[K]) => void,
    ): void;
  }
}

interface DomCreateOptions {
  text?: string;
  cls?: string;
}

interface HTMLElement {
  addClass(className: string): void;
  createDiv(options?: DomCreateOptions): HTMLElement;
  createEl(tag: string, options?: DomCreateOptions): HTMLElement;
  createSpan(options?: DomCreateOptions): HTMLElement;
  empty(): void;
  findAll(selector: string): HTMLElement[];
  removeClass(className: string): void;
  setText(text: string): void;
}
