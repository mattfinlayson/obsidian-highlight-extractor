/**
 * Highlight Extractor Plugin - Main Entry Point
 */

import { Plugin, Notice, TFile } from 'obsidian';
import { extractHighlights, insertExtraction } from './HighlightExtractor';
import { PluginSettings, DEFAULT_SETTINGS } from './models/types';
import HighlightExtractorSettingTab from './SettingsTab';

export default class HighlightExtractorPlugin extends Plugin {
    settings: PluginSettings = DEFAULT_SETTINGS;
    settingsTab!: HighlightExtractorSettingTab;

    async onload() {
        console.log('Highlight Extractor: Loading plugin');
        
        // Load settings
        await this.loadSettings();
        
        // Register command
        this.addCommand({
            id: 'extract-highlights',
            name: 'Extract Highlights',
            hotkeys: [
                {
                    modifiers: ['Mod', 'Alt'],
                    key: 'E'
                }
            ],
            callback: async () => {
                await this.extractHighlights();
            }
        });
        
        // Add settings tab
        this.settingsTab = new HighlightExtractorSettingTab(this.app, this);
        this.addSettingTab(this.settingsTab);
    }

    async onunload() {
        console.log('Highlight Extractor: Unloading plugin');
    }

    async loadSettings() {
        try {
            const data = await this.loadData();
            if (data) {
                this.settings = { ...DEFAULT_SETTINGS, ...data };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        try {
            await this.saveData(this.settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    async extractHighlights() {
        const file = this.app.workspace.getActiveFile();
        
        if (!file) {
            new Notice('No active document. Please open a document first.');
            return;
        }
        
        try {
            const extraction = await extractHighlights(this.app, file, this.settings);
            
            if (!extraction) {
                new Notice('No highlights found in this document.');
                return;
            }
            
            await insertExtraction(this.app, file, extraction);
            
            new Notice(`Extracted highlights to document`);
        } catch (error) {
            console.error('Highlight Extractor Error:', error);
            new Notice('Failed to extract highlights. Check console for details.');
        }
    }
}
