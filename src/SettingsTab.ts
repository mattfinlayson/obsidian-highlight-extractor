/**
 * Highlight Extractor Settings Tab
 */

import { App, Plugin, SettingTab, Setting } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from './models/types';

export default class HighlightExtractorSettingTab extends SettingTab {
  constructor(app: App, plugin: Plugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Highlight Extractor Settings' });

    new Setting(containerEl)
      .setName('Include Timestamp')
      .setDesc('Include extraction timestamp in output')
      .addToggle(toggle => toggle
        .setValue(DEFAULT_SETTINGS.includeTimestamp)
        .onChange(async (value) => {
          (this.plugin as any).settings.includeTimestamp = value;
          await (this.plugin as any).saveSettings();
        }));

    new Setting(containerEl)
      .setName('Deduplicate Highlights')
      .setDesc('Remove duplicate highlights from output')
      .addToggle(toggle => toggle
        .setValue(DEFAULT_SETTINGS.deduplicateHighlights)
        .onChange(async (value) => {
          (this.plugin as any).settings.deduplicateHighlights = value;
          await (this.plugin as any).saveSettings();
        }));
  }
}
