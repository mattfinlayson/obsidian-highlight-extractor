/**
 * Highlight Extractor Settings Tab
 */

import { App, SettingTab, Setting, ToggleComponent } from 'obsidian';
import type HighlightExtractorPlugin from './main';

export default class HighlightExtractorSettingTab extends SettingTab {
    plugin!: HighlightExtractorPlugin;

    constructor(app: App, plugin: HighlightExtractorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Highlight extractor settings' });

        new Setting(containerEl)
            .setName('Include timestamp')
            .setDesc('Include extraction timestamp in output')
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue(this.plugin.settings.includeTimestamp);
                toggle.onChange(async (value: boolean) => {
                    this.plugin.settings.includeTimestamp = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Deduplicate highlights')
            .setDesc('Remove duplicate highlights from output')
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue(this.plugin.settings.deduplicateHighlights);
                toggle.onChange(async (value: boolean) => {
                    this.plugin.settings.deduplicateHighlights = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Expand annotation selection')
            .setDesc('Expand selected text to complete word boundaries when creating highlights')
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue(this.plugin.settings.expandAnnotationSelection);
                toggle.onChange(async (value: boolean) => {
                    this.plugin.settings.expandAnnotationSelection = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Annotation colors')
            .setDesc('Comma-separated CSS color names available in the annotation popover')
            .addTextArea((textArea) => {
                textArea.setValue(this.plugin.settings.annotationColors.join(', '));
                textArea.onChange(async (value: string) => {
                    this.plugin.settings.annotationColors = value
                        .split(',')
                        .map((color) => color.trim())
                        .filter(Boolean);
                    await this.plugin.saveSettings();
                });
            });
    }
}
