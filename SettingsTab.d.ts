/**
 * Highlight Extractor Settings Tab
 */
import { App, Plugin, SettingTab } from 'obsidian';
export default class HighlightExtractorSettingTab extends SettingTab {
    plugin: Plugin;
    constructor(app: App, plugin: Plugin);
    display(): void;
}
