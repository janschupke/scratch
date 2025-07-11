# PRP-05: Editor Integration

## Goals
- Integrate Monaco Editor.
- Enable syntax highlighting/indentation.
- Detect file type for syntax mode.

## Detailed Implementation Steps

### 1. Monaco Editor Setup

**Best Practices:**
- Use Monaco Editor for VS Code-like experience
- Implement proper language detection
- Configure editor themes and settings
- Handle large files efficiently
- Implement auto-save functionality

**Install Dependencies:**
```bash
npm install @monaco-editor/react
npm install monaco-editor
```

### 2. Editor Configuration

**src/utils/editorConfig.ts:**
```typescript
import { editor } from 'monaco-editor';

export const EDITOR_THEME = 'vs-dark';

export const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  theme: EDITOR_THEME,
  fontSize: 14,
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  lineNumbers: 'on',
  minimap: {
    enabled: true,
    side: 'right',
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on',
  folding: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'always',
  renderWhitespace: 'selection',
  renderControlCharacters: false,
  renderLineHighlight: 'all',
  selectOnLineNumbers: true,
  roundedSelection: false,
  readOnly: false,
  cursorStyle: 'line',
  automaticLayout: true,
  scrollbar: {
    vertical: 'visible',
    horizontal: 'visible',
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
  suggest: {
    showKeywords: true,
    showSnippets: true,
    showClasses: true,
    showFunctions: true,
    showVariables: true,
    showModules: true,
    showProperties: true,
    showEvents: true,
    showOperators: true,
    showUnits: true,
    showValues: true,
    showConstants: true,
    showEnums: true,
    showEnumMembers: true,
    showColors: true,
    showFiles: true,
    showReferences: true,
    showFolders: true,
    showTypeParameters: true,
    showWords: true,
  },
  quickSuggestions: {
    other: true,
    comments: true,
    strings: true,
  },
  parameterHints: {
    enabled: true,
  },
  hover: {
    enabled: true,
  },
  contextmenu: true,
  mouseWheelZoom: true,
  bracketPairColorization: {
    enabled: true,
  },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
};

export const LANGUAGE_MAP: Record<string, string> = {
  'javascript': 'javascript',
  'js': 'javascript',
  'jsx': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'html': 'html',
  'htm': 'html',
  'css': 'css',
  'scss': 'scss',
  'sass': 'scss',
  'less': 'less',
  'json': 'json',
  'markdown': 'markdown',
  'md': 'markdown',
  'python': 'python',
  'py': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'c++': 'cpp',
  'php': 'php',
  'ruby': 'ruby',
  'rb': 'ruby',
  'go': 'go',
  'rust': 'rust',
  'rs': 'rust',
  'sql': 'sql',
  'xml': 'xml',
  'yaml': 'yaml',
  'yml': 'yaml',
  'toml': 'toml',
  'ini': 'ini',
  'shell': 'shell',
  'bash': 'shell',
  'sh': 'shell',
  'zsh': 'shell',
  'fish': 'shell',
  'powershell': 'powershell',
  'ps1': 'powershell',
  'batch': 'batch',
  'bat': 'batch',
  'cmd': 'batch',
  'vue': 'vue',
  'svelte': 'svelte',
  'astro': 'astro',
  'jsx': 'javascript',
  'tsx': 'typescript',
  'txt': 'plaintext',
  'plaintext': 'plaintext',
};

export function detectLanguage(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  return LANGUAGE_MAP[extension] || 'plaintext';
}

export function getEditorTheme(): string {
  return EDITOR_THEME;
}
```

### 3. Enhanced Editor Component

**src/components/Editor/index.tsx:**
```typescript
import React from 'react';
import Editor from '@monaco-editor/react';
import { useTabStore } from '../../stores/tabStore';
import { useEditorStore } from '../../stores/editorStore';
import { detectLanguage, EDITOR_OPTIONS } from '../../utils/editorConfig';
import { EditorPlaceholder } from './EditorPlaceholder';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';

interface MonacoEditorProps {
  isActive: boolean;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ isActive }) => {
  const { activeTabId, tabs, updateTabContent, markTabAsModified } = useTabStore();
  const { 
    editorInstance, 
    setEditorInstance, 
    saveFile, 
    formatDocument,
    toggleWordWrap,
    toggleMinimap,
    toggleLineNumbers,
    editorSettings 
  } = useEditorStore();

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const language = activeTab ? detectLanguage(activeTab.path) : 'plaintext';

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditorInstance(editor);
    
    // Configure editor settings
    editor.updateOptions(editorSettings);
    
    // Set up auto-save
    editor.onDidChangeModelContent(() => {
      if (activeTab) {
        markTabAsModified(activeTab.id, true);
      }
    });

    // Set up keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile();
    });

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      formatDocument();
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      updateTabContent(activeTab.id, value);
    }
  };

  const handleEditorWillUnmount = () => {
    setEditorInstance(null);
  };

  if (!isActive || !activeTab) {
    return <EditorPlaceholder />;
  }

  return (
    <div className="flex-1 flex flex-col bg-vscode-bg">
      <EditorToolbar 
        onSave={saveFile}
        onFormat={formatDocument}
        onToggleWordWrap={toggleWordWrap}
        onToggleMinimap={toggleMinimap}
        onToggleLineNumbers={toggleLineNumbers}
      />
      
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage={language}
          value={activeTab.content || ''}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          onBeforeUnmount={handleEditorWillUnmount}
          options={EDITOR_OPTIONS}
          theme={getEditorTheme()}
        />
      </div>
      
      <EditorStatusBar 
        language={language}
        filePath={activeTab.path}
        isModified={activeTab.isModified}
      />
    </div>
  );
};
```

### 4. Editor Store

**src/stores/editorStore.ts:**
```typescript
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
```

### 5. Editor Toolbar

**src/components/Editor/EditorToolbar.tsx:**
```typescript
import React from 'react';
import { 
  Save, 
  RotateCcw, 
  WrapText, 
  Eye, 
  Hash,
  Settings
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

interface EditorToolbarProps {
  onSave: () => void;
  onFormat: () => void;
  onToggleWordWrap: () => void;
  onToggleMinimap: () => void;
  onToggleLineNumbers: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onSave,
  onFormat,
  onToggleWordWrap,
  onToggleMinimap,
  onToggleLineNumbers,
}) => {
  const { settings, isLoading } = useEditorStore();

  return (
    <div className="h-8 bg-vscode-tabs border-b border-gray-700 flex items-center justify-between px-3">
      <div className="flex items-center space-x-2">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50"
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>
        
        <button
          onClick={onFormat}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          title="Format Document (Shift+Alt+F)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={onToggleWordWrap}
          className={`p-1 rounded text-gray-400 hover:text-white ${
            settings.wordWrap === 'on' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          title="Toggle Word Wrap"
        >
          <WrapText className="w-4 h-4" />
        </button>
        
        <button
          onClick={onToggleMinimap}
          className={`p-1 rounded text-gray-400 hover:text-white ${
            settings.minimap.enabled ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          title="Toggle Minimap"
        >
          <Eye className="w-4 h-4" />
        </button>
        
        <button
          onClick={onToggleLineNumbers}
          className={`p-1 rounded text-gray-400 hover:text-white ${
            settings.lineNumbers === 'on' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          title="Toggle Line Numbers"
        >
          <Hash className="w-4 h-4" />
        </button>
        
        <button
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          title="Editor Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

### 6. Editor Status Bar

**src/components/Editor/EditorStatusBar.tsx:**
```typescript
import React from 'react';
import { useEditorStore } from '../../stores/editorStore';

interface EditorStatusBarProps {
  language: string;
  filePath: string;
  isModified: boolean;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  language,
  filePath,
  isModified,
}) => {
  const { editorInstance, settings } = useEditorStore();
  const [cursorPosition, setCursorPosition] = React.useState({ line: 1, column: 1 });

  React.useEffect(() => {
    if (!editorInstance) return;

    const updatePosition = () => {
      const position = editorInstance.getPosition();
      if (position) {
        setCursorPosition({
          line: position.lineNumber,
          column: position.column,
        });
      }
    };

    editorInstance.onDidChangeCursorPosition(updatePosition);
    updatePosition();

    return () => {
      editorInstance.dispose();
    };
  }, [editorInstance]);

  return (
    <div className="h-6 bg-vscode-sidebar border-t border-gray-700 flex items-center justify-between px-3 text-xs text-gray-400">
      <div className="flex items-center space-x-4">
        <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        <span>Spaces: {settings.tabSize}</span>
        <span>Encoding: UTF-8</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className={isModified ? 'text-yellow-400' : ''}>
          {isModified ? '●' : ''}
        </span>
        <span className="uppercase">{language}</span>
        <span className="truncate max-w-64">{filePath}</span>
      </div>
    </div>
  );
};
```

### 7. Enhanced Editor Placeholder

**src/components/Editor/EditorPlaceholder.tsx:**
```typescript
import React from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';

export const EditorPlaceholder: React.FC = () => {
  const { openFolder } = useFileStore();

  return (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <FileText className="w-16 h-16 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">No file selected</p>
        <p className="text-sm mb-4">Open a file to start editing</p>
        <button
          onClick={openFolder}
          className="flex items-center space-x-2 px-4 py-2 bg-vscode-accent text-white rounded hover:bg-blue-600 mx-auto"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Open Folder</span>
        </button>
      </div>
    </div>
  );
};
```

## Testing Steps
1. Test Monaco Editor loads correctly
2. Verify syntax highlighting works for different languages
3. Test auto-save functionality
4. Verify keyboard shortcuts work
5. Test toolbar buttons functionality
6. Verify status bar displays correct information
7. Test editor settings persistence
8. Write unit tests for editor store
9. Test editor component accessibility
10. Test keyboard shortcuts
11. Test editor performance with large files
12. Test editor error handling

## Potential Risks & Mitigation

### 1. Large File Performance
**Risk:** Slow performance with large files
**Mitigation:**
- Implement file size limits
- Use virtual scrolling for large files
- Show loading indicators

### 2. Memory Usage
**Risk:** High memory usage with many open editors
**Mitigation:**
- Implement editor disposal
- Limit number of open editors
- Monitor memory usage

### 3. Language Detection
**Risk:** Incorrect language detection
**Mitigation:**
- Improve language mapping
- Allow manual language selection
- Handle edge cases

### 4. Auto-save Issues
**Risk:** Data loss or conflicts
**Mitigation:**
- Implement proper error handling
- Show save status indicators
- Add manual save option

## Success Criteria
- [ ] Monaco Editor loads and displays content
- [ ] Syntax highlighting works for supported languages
- [ ] Auto-save functionality works correctly
- [ ] Keyboard shortcuts function properly
- [ ] Toolbar buttons work as expected
- [ ] Status bar shows correct information
- [ ] Editor settings persist across sessions

## Next Steps
After completing editor integration, proceed to PRP-06 for state persistence implementation. 
