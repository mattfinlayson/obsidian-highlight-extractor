/**
 * Highlight Extractor Plugin - Settings
 */

import { Plugin, SettingTab, Setting, TextComponent } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from './models/types';

/**
 * Create the settings tab
 */
export function createSettingsTab(plugin: Plugin): SettingTab {
  return new SettingTab(plugin.app, plugin);
}

export class SettingTab {
  private containerEl: HTMLElement;

  constructor(app: any, private plugin: Plugin) {
    this.containerEl = this.plugin.addSettingTab(new SettingTab(app, plugin)).containerEl;
  }
}

// Re-export DEFAULT_SETTINGS for external use
export { DEFAULT_SETTINGS } from './models/types';
