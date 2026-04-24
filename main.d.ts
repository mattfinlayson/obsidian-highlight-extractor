/**
 * Highlight Extractor Plugin - Main Entry Point
 */
import { Plugin } from 'obsidian';
import { PluginSettings } from './models/types';
export default class HighlightExtractorPlugin extends Plugin {
    settings: PluginSettings;
    onload(): Promise<void>;
    onunload(): Promise<void>;
    extractHighlights(): Promise<void>;
}
