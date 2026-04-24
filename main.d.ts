/**
 * Highlight Extractor Plugin - Main Entry Point
 */
import { Plugin } from 'obsidian';
import { PluginSettings } from './models/types';
import HighlightExtractorSettingTab from './SettingsTab';
export default class HighlightExtractorPlugin extends Plugin {
    settings: PluginSettings;
    settingsTab: HighlightExtractorSettingTab;
    onload(): Promise<void>;
    onunload(): Promise<void>;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    extractHighlights(): Promise<void>;
}
