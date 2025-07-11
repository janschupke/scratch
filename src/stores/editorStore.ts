import { create } from 'zustand';
import { editor } from 'monaco-editor';
import { writeTextFile } from '@tauri-apps/api/fs';
import { useTabStore } from './tabStore';

interface EditorSettings {
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  minimap: { enabled: boolean };
  lineNumbers: 'on' | 'off' | 'relative';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
}

interface EditorStore {
  editorInstance: editor.IStandaloneCodeEditor | null;
  settings: EditorSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  setEditorInstance: (editor: editor.IStandaloneCodeEditor | null) => void;
  saveFile: () => Promise<void>;
  formatDocument: () => void;
  toggleWordWrap: () => void;
  toggleMinimap: () => void;
  toggleLineNumbers: () => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  setError: (error: string | null) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  editorInstance: null,
  settings: {
    wordWrap: 'on',
    minimap: { enabled: true },
    lineNumbers: 'on',
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    tabSize: 2,
    insertSpaces: true,
  },
  isLoading: false,
  error: null,

  setEditorInstance: (editor) => {
    set({ editorInstance: editor });
  },

  saveFile: async () => {
    const { editorInstance } = get();
    const { activeTabId, tabs, markTabAsModified } = useTabStore.getState();
    
    if (!editorInstance || !activeTabId) return;

    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab) return;

    set({ isLoading: true, error: null });

    try {
      const content = editorInstance.getValue();
      await writeTextFile(activeTab.path, content);
      markTabAsModified(activeTabId, false);
    } catch (error) {
      set({ error: `Failed to save file: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  formatDocument: () => {
    const { editorInstance } = get();
    if (!editorInstance) return;

    editorInstance.getAction('editor.action.formatDocument')?.run();
  },

  toggleWordWrap: () => {
    const { settings, editorInstance } = get();
    const newWordWrap = settings.wordWrap === 'on' ? 'off' : 'on';
    
    set({
      settings: { ...settings, wordWrap: newWordWrap }
    });

    if (editorInstance) {
      editorInstance.updateOptions({ wordWrap: newWordWrap });
    }
  },

  toggleMinimap: () => {
    const { settings, editorInstance } = get();
    const newMinimap = { enabled: !settings.minimap.enabled };
    
    set({
      settings: { ...settings, minimap: newMinimap }
    });

    if (editorInstance) {
      editorInstance.updateOptions({ minimap: newMinimap });
    }
  },

  toggleLineNumbers: () => {
    const { settings, editorInstance } = get();
    const newLineNumbers = settings.lineNumbers === 'on' ? 'off' : 'on';
    
    set({
      settings: { ...settings, lineNumbers: newLineNumbers }
    });

    if (editorInstance) {
      editorInstance.updateOptions({ lineNumbers: newLineNumbers });
    }
  },

  updateSettings: (newSettings) => {
    const { settings, editorInstance } = get();
    const updatedSettings = { ...settings, ...newSettings };
    
    set({ settings: updatedSettings });

    if (editorInstance) {
      editorInstance.updateOptions(updatedSettings);
    }
  },

  setError: (error) => {
    set({ error });
  },
})); 
