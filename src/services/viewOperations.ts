import { useAppStore } from '../stores/appStore';
import { useEditorStore } from '../stores/editorStore';

export class ViewOperations {
  static toggleSidebar(): void {
    const { isSidebarCollapsed, updateWindowState } = useAppStore.getState();
    updateWindowState({ isSidebarCollapsed: !isSidebarCollapsed });
  }

  static toggleStatusBar(): void {
    // TODO: Implement status bar toggle when status bar is implemented
    console.log('Toggle status bar action triggered');
  }

  static zoomIn(): void {
    const { preferences, updatePreferences } = useAppStore.getState();
    const currentFontSize = preferences.editor.fontSize;
    const newFontSize = Math.min(currentFontSize + 1, 24); // Max font size of 24
    
    updatePreferences({
      editor: { ...preferences.editor, fontSize: newFontSize }
    });
    
    // Update editor instance if available
    const { editorInstance, updateSettings } = useEditorStore.getState();
    if (editorInstance) {
      updateSettings({ fontSize: newFontSize });
    }
  }

  static zoomOut(): void {
    const { preferences, updatePreferences } = useAppStore.getState();
    const currentFontSize = preferences.editor.fontSize;
    const newFontSize = Math.max(currentFontSize - 1, 8); // Min font size of 8
    
    updatePreferences({
      editor: { ...preferences.editor, fontSize: newFontSize }
    });
    
    // Update editor instance if available
    const { editorInstance, updateSettings } = useEditorStore.getState();
    if (editorInstance) {
      updateSettings({ fontSize: newFontSize });
    }
  }

  static resetZoom(): void {
    const { preferences, updatePreferences } = useAppStore.getState();
    const defaultFontSize = 14;
    
    updatePreferences({
      editor: { ...preferences.editor, fontSize: defaultFontSize }
    });
    
    // Update editor instance if available
    const { editorInstance, updateSettings } = useEditorStore.getState();
    if (editorInstance) {
      updateSettings({ fontSize: defaultFontSize });
    }
  }

  static toggleWordWrap(): void {
    const { settings, updateSettings } = useEditorStore.getState();
    const newWordWrap = settings.wordWrap === 'on' ? 'off' : 'on';
    
    updateSettings({ wordWrap: newWordWrap });
  }

  static toggleMinimap(): void {
    const { settings, updateSettings } = useEditorStore.getState();
    const newMinimap = { enabled: !settings.minimap.enabled };
    
    updateSettings({ minimap: newMinimap });
  }

  static toggleLineNumbers(): void {
    const { settings, updateSettings } = useEditorStore.getState();
    const newLineNumbers = settings.lineNumbers === 'on' ? 'off' : 'on';
    
    updateSettings({ lineNumbers: newLineNumbers });
  }

  static getCurrentZoomLevel(): number {
    const { preferences } = useAppStore.getState();
    return preferences.editor.fontSize;
  }

  static isSidebarVisible(): boolean {
    const { isSidebarCollapsed } = useAppStore.getState();
    return !isSidebarCollapsed;
  }

  static isStatusBarVisible(): boolean {
    // TODO: Implement when status bar is implemented
    return true;
  }
} 
