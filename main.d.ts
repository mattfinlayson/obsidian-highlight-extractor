/**
 * Reading Assistant plugin - main entry point
 */
import { Plugin } from 'obsidian';
import { type PluginSettings } from './models/types';
import HighlightExtractorSettingTab from './SettingsTab';
export default class ReadingAssistantPlugin extends Plugin {
    settings: PluginSettings;
    settingsTab: HighlightExtractorSettingTab;
    isHighlightingModeOn: boolean;
    statusBarItemEl: HTMLElement | null;
    onload(): Promise<void>;
    onunload(): Promise<void>;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    toggleHighlightingMode(): void;
    addStatusBarModeIndicator(): void;
    registerHighlightModeEvents(): void;
    lockEditorInHighlightingMode(event: MouseEvent | TouchEvent): void;
    highlightSelectionFromEvent(event: MouseEvent | TouchEvent): void;
    createFileFromHighlight(text: string): Promise<void>;
    extractHighlights(): Promise<void>;
}
