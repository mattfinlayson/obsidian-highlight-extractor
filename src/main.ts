/**
 * Highlight Extractor Plugin - Main Entry Point
 */

import { Plugin, Notice, TFile } from 'obsidian';
import { extractHighlights, insertExtraction } from './HighlightExtractor';
import { DEFAULT_SETTINGS, PluginSettings } from './models/types';
import { DEFAULT_FORMATTER_OPTIONS } from './utils/formatter';

export default class HighlightExtractorPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;

  async onload() {
    console.log('Highlight Extractor: Loading plugin');
    
    // Register command
    this.addCommand({
      id: 'extract-highlights',
      name: 'Extract Highlights',
      hotkeys: [
        {
          modifiers: ['Mod', 'Alt'],
          key: 'H'
        }
      ],
      callback: async () => {
        await this.extractHighlights();
      }
    });
  }

  async onunload() {
    console.log('Highlight Extractor: Unloading plugin');
  }

  async extractHighlights() {
    // Get active file
    const file = this.app.workspace.getActiveFile();
    
    if (!file) {
      new Notice('No active document. Please open a document first.');
      return;
    }
    
    try {
      // Extract highlights
      const extraction = await extractHighlights(this.app, file, this.settings);
      
      if (!extraction) {
        new Notice('No highlights found in this document.');
        return;
      }
      
      // Insert into document
      await insertExtraction(this.app, file, extraction);
      
      new Notice(`Extracted highlights to document`);
    } catch (error) {
      console.error('Highlight Extractor Error:', error);
      new Notice('Failed to extract highlights. Check console for details.');
    }
  }
}
