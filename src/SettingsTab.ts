/**
 * Reading Assistant settings tab
 */

import { type App, Setting, SettingTab, type ToggleComponent } from 'obsidian';
import type ReadingAssistantPlugin from './main';

export default class HighlightExtractorSettingTab extends SettingTab {
  plugin!: ReadingAssistantPlugin;

  constructor(app: App, plugin: ReadingAssistantPlugin) {
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
          const colors = value
            .split(',')
            .map((color) => color.trim())
            .filter(Boolean);
          this.plugin.settings.annotationColors.splice(
            0,
            this.plugin.settings.annotationColors.length,
            ...colors,
          );
          await this.plugin.saveSettings();
        });
      });
  }
}
