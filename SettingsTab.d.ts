/**
 * Reading Assistant settings tab
 */
import { type App, SettingTab } from 'obsidian';
import type ReadingAssistantPlugin from './main';
export default class HighlightExtractorSettingTab extends SettingTab {
    plugin: ReadingAssistantPlugin;
    constructor(app: App, plugin: ReadingAssistantPlugin);
    display(): void;
}
