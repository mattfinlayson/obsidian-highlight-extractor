/**
 * Highlight Extractor Settings Tab
 */

import { App, Plugin, SettingTab, Setting, ToggleComponent } from 'obsidian';
import { PluginSettings } from './models/types';

export default class HighlightExtractorSettingTab extends SettingTab {
    plugin!: Plugin;

    constructor(app: App, plugin: Plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Highlight Extractor Settings' });

        new Setting(containerEl)
            .setName('Include Timestamp')
            .setDesc('Include extraction timestamp in output')
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue((this.plugin as any).settings.includeTimestamp);
                toggle.onChange(async (value: boolean) => {
                    (this.plugin as any).settings.includeTimestamp = value;
                    await (this.plugin as any).saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Deduplicate Highlights')
            .setDesc('Remove duplicate highlights from output')
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue((this.plugin as any).settings.deduplicateHighlights);
                toggle.onChange(async (value: boolean) => {
                    (this.plugin as any).settings.deduplicateHighlights = value;
                    await (this.plugin as any).saveSettings();
                });
            });
    }
}
