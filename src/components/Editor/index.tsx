import React, { useEffect, useRef } from 'react';
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
  const { activeTabId, tabs, updateTabContent, updateEditorState } = useTabStore();
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

  const editorRef = useRef<any>(null);

  // Restore editor state on mount
  useEffect(() => {
    if (editorRef.current && activeTab?.editorState) {
      const { cursorPosition, scrollPosition, viewState } = activeTab.editorState;
      if (cursorPosition) {
        editorRef.current.setPosition({
          lineNumber: cursorPosition.line,
          column: cursorPosition.column,
        });
      }
      if (scrollPosition) {
        editorRef.current.setScrollPosition({
          scrollTop: scrollPosition.top,
          scrollLeft: scrollPosition.left,
        });
      }
      if (viewState) {
        try {
          editorRef.current.restoreViewState(JSON.parse(viewState));
        } catch {}
      }
    }
  }, [activeTabId]);

  // Save editor state on change/unmount
  const saveEditorState = () => {
    if (editorRef.current && activeTab) {
      const position = editorRef.current.getPosition();
      const scrollPosition = editorRef.current.getScrollPosition();
      const selections = editorRef.current.getSelections?.() || [];
      const viewState = editorRef.current.saveViewState?.();
      updateEditorState(activeTab.id, {
        filePath: activeTab.path,
        cursorPosition: position
          ? { line: position.lineNumber, column: position.column }
          : undefined,
        scrollPosition: scrollPosition
          ? { top: scrollPosition.scrollTop, left: scrollPosition.scrollLeft }
          : undefined,
        selections: selections.map((sel: any) => ({ start: sel.startColumn, end: sel.endColumn })),
        viewState: viewState ? JSON.stringify(viewState) : undefined,
      });
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setEditorInstance(editor);
    
    // Configure editor settings
    editor.updateOptions(settings);
    
    // Set up auto-save
    editor.onDidChangeCursorPosition(saveEditorState);
    editor.onDidScrollChange(saveEditorState);
    editor.onDidChangeModelContent(saveEditorState);

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
    saveEditorState();
    setEditorInstance(null);
    editorRef.current = null;
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
