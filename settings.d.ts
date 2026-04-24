/**
 * Highlight Extractor Plugin - Settings
 */
import { Plugin, SettingTab } from 'obsidian';
/**
 * Create the settings tab
 */
export declare function createSettingsTab(plugin: Plugin): SettingTab;
export declare class SettingTab {
    private plugin;
    private containerEl;
    constructor(app: any, plugin: Plugin);
}
export { DEFAULT_SETTINGS } from './models/types';
