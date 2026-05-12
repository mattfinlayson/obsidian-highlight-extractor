/**
 * Highlight Extractor Settings Tab
 */
import { App, SettingTab } from 'obsidian';
import type HighlightExtractorPlugin from './main';
export default class HighlightExtractorSettingTab extends SettingTab {
    plugin: HighlightExtractorPlugin;
    constructor(app: App, plugin: HighlightExtractorPlugin);
    display(): void;
}
