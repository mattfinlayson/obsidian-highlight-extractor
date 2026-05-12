/**
 * Reading Assistant plugin - main entry point
 */

import { Notice, Plugin } from 'obsidian';
import { extractHighlights, insertExtraction } from './HighlightExtractor';
import { PluginSettings, DEFAULT_SETTINGS } from './models/types';
import HighlightExtractorSettingTab from './SettingsTab';
import {
    clearAllAnnotationsCommand,
    createHighlightCommand,
    deleteAnnotationCommand
} from './annotations/commands';
import { highlightExtension } from './annotations/extension';
import { annotationPostprocessor } from './annotations/postprocessor';

export default class ReadingAssistantPlugin extends Plugin {
    settings: PluginSettings = DEFAULT_SETTINGS;
    settingsTab!: HighlightExtractorSettingTab;
    isHighlightingModeOn = false;
    statusBarItemEl: HTMLElement | null = null;

    async onload() {
        // Load settings
        await this.loadSettings();

        this.addRibbonIcon(
            'highlighter',
            'Toggle highlight mode',
            () => this.toggleHighlightingMode()
        );
        this.addStatusBarModeIndicator();

        this.registerEditorExtension([
            highlightExtension(this.settings.annotationColors, async (text) => {
                await this.createFileFromHighlight(text);
            })
        ]);

        this.addCommand({
            id: 'create-highlight',
            name: 'Highlight selection',
            editorCallback: (editor) =>
                createHighlightCommand(editor, this.settings.expandAnnotationSelection)
        });

        this.addCommand({
            id: 'delete-annotation',
            name: 'Delete annotation at cursor',
            editorCallback: (editor) => deleteAnnotationCommand(editor)
        });

        this.addCommand({
            id: 'clear-all-annotations',
            name: 'Clear all annotations',
            editorCallback: (editor) => clearAllAnnotationsCommand(editor)
        });

        this.addCommand({
            id: 'toggle-highlighting-mode',
            name: 'Toggle highlight mode',
            callback: () => this.toggleHighlightingMode()
        });

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

        this.registerHighlightModeEvents();
        this.registerMarkdownPostProcessor((element, context) =>
            annotationPostprocessor(this.settings.annotationColors, element, context)
        );

        // Add settings tab
        this.settingsTab = new HighlightExtractorSettingTab(this.app, this);
        this.addSettingTab(this.settingsTab);
    }

    async onunload() {}

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

    toggleHighlightingMode() {
        this.isHighlightingModeOn = !this.isHighlightingModeOn;
        this.statusBarItemEl?.setText(
            `Highlighting mode: ${this.isHighlightingModeOn ? 'on' : 'off'}`
        );
        new Notice(
            `Highlighting mode ${this.isHighlightingModeOn ? 'enabled' : 'disabled'}`
        );
    }

    addStatusBarModeIndicator() {
        this.statusBarItemEl = this.addStatusBarItem();
        this.statusBarItemEl.setText('Highlighting mode: off');
        this.statusBarItemEl.addEventListener('click', () => this.toggleHighlightingMode());
    }

    registerHighlightModeEvents() {
        const doc = this.app.workspace.containerEl.ownerDocument;

        this.registerDomEvent(doc, 'mousedown', (event: MouseEvent) =>
            this.lockEditorInHighlightingMode(event)
        );
        this.registerDomEvent(doc, 'touchstart', (event: TouchEvent) =>
            this.lockEditorInHighlightingMode(event)
        );
        this.registerDomEvent(doc, 'mouseup', (event: MouseEvent) =>
            this.highlightSelectionFromEvent(event)
        );
        this.registerDomEvent(doc, 'touchend', (event: TouchEvent) =>
            this.highlightSelectionFromEvent(event)
        );
    }

    lockEditorInHighlightingMode(event: MouseEvent | TouchEvent) {
        if (!this.isHighlightingModeOn || !(event.target instanceof HTMLElement)) {
            return;
        }

        if (
            event.target.closest('.is-live-preview') &&
            !event.target.closest('#reading-assistant-comment-popover')
        ) {
            event.preventDefault();
            this.app.workspace.activeEditor?.editor?.blur();
        }
    }

    highlightSelectionFromEvent(event: MouseEvent | TouchEvent) {
        const editor = this.app.workspace.activeEditor?.editor;
        const selection = editor?.getSelection();

        if (!editor || !selection) {
            return;
        }

        const usesModifier = event instanceof MouseEvent && (event.metaKey || event.altKey || event.ctrlKey);
        if (!usesModifier && !this.isHighlightingModeOn) {
            return;
        }

        if (event.target instanceof HTMLElement && !event.target.closest('.is-live-preview')) {
            return;
        }

        const expandSelection = this.settings.expandAnnotationSelection &&
            !(event instanceof MouseEvent && event.altKey);
        createHighlightCommand(editor, expandSelection);
    }

    async createFileFromHighlight(text: string) {
        const activeFile = this.app.workspace.getActiveFile();
        const safeName = text
            .replace(/[\\/:*?"<>|#^[\]]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 80) || 'Highlight';
        const path = `${safeName}.md`;
        const source = activeFile ? `[[${activeFile.basename}]]\n\n` : '';
        const content = `${source}> ${text}\n\n${text}`;
        const newFile = await this.app.vault.create(path, content);
        await this.app.workspace.openLinkText('', newFile.path);
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
            console.error('Reading Assistant error:', error);
            new Notice('Failed to extract highlights. Check console for details.');
        }
    }
}
