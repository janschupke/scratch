import React from 'react';
import Editor from '@monaco-editor/react';
import { useTabStore } from '../../stores/tabStore';
import { useEditorStore } from '../../stores/editorStore';
import { detectLanguage, EDITOR_OPTIONS, getEditorTheme } from '../../utils/editorConfig';
import { EditorPlaceholder } from './EditorPlaceholder';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';

interface MonacoEditorProps {
  isActive: boolean;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ isActive }) => {
  const { activeTabId, tabs, updateTabContent, markTabAsModified } = useTabStore();
  const { 
    setEditorInstance, 
    saveFile, 
    formatDocument,
    toggleWordWrap,
    toggleMinimap,
    toggleLineNumbers,
    settings 
  } = useEditorStore();

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const language = activeTab ? detectLanguage(activeTab.path) : 'plaintext';

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditorInstance(editor);
    
    // Configure editor settings
    editor.updateOptions(settings);
    
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
          beforeMount={handleEditorWillUnmount}
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
