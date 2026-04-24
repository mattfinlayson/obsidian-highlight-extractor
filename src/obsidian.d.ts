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
    
    loadData(): Promise<any>;
    saveData(data: any): Promise<void>;
    
    onload(): void | Promise<void>;
    onunload(): void | Promise<void>;
  }
  
  export interface Command {
    id: string;
    name: string;
    callback?: () => void | Promise<void>;
    hotkeys?: KeyboardShortcut[];
    checkCallback?: (checking: boolean) => boolean | void;
  }
  
  export interface KeyboardShortcut {
    modifiers: string[];
    key: string;
  }
  
  export class Notice {
    constructor(message: string, duration?: number);
  }
  
  export interface App {
    vault: Vault;
    workspace: Workspace;
  }
  
  export interface Vault {
    read(file: TFile): Promise<string>;
    modify(file: TFile, data: string): Promise<void>;
    process(file: TFile, callback: (data: string) => string | Promise<string>): Promise<void>;
  }
  
  export interface Workspace {
    getActiveFile(): TFile | null;
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
  }
  
  export class ToggleComponent {
    setValue(value: boolean): void;
    onChange(callback: (value: boolean) => void): void;
  }
  
  export class TextComponent {
    setValue(value: string): void;
    onChange(callback: (value: string) => void): void;
  }
  
  export interface HTMLElement {
    empty(): void;
    createEl(tag: string, options?: any): HTMLElement;
  }
}
