import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useTabStore } from '../../stores/tabStore';

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
  const { activeTabId, tabs } = useTabStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const [cursorPosition, setCursorPosition] = React.useState({ line: 1, column: 1 });
  const [selection, setSelection] = React.useState<{ start: number; end: number } | null>(null);

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

    const updateSelection = () => {
      const selection = editorInstance.getSelection();
      if (selection) {
        const start = editorInstance.getModel()?.getOffsetAt(selection.getStartPosition()) || 0;
        const end = editorInstance.getModel()?.getOffsetAt(selection.getEndPosition()) || 0;
        setSelection({ start, end });
      }
    };

    editorInstance.onDidChangeCursorPosition(updatePosition);
    editorInstance.onDidChangeCursorSelection(updateSelection);
    updatePosition();
    updateSelection();

    return () => {
      // Cleanup will be handled by Monaco Editor
    };
  }, [editorInstance]);

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileName = (path: string): string => {
    return path.split('/').pop() || 'Untitled';
  };

  const getFileDirectory = (path: string): string => {
    const parts = path.split('/');
    return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
  };

  const fileSize = activeTab?.content ? new Blob([activeTab.content]).size : 0;
  const hasSelection = selection && selection.start !== selection.end;
  const selectionLength = hasSelection ? selection.end - selection.start : 0;

  return (
    <div className="h-6 bg-vscode-sidebar border-t border-gray-700 flex items-center justify-between px-3 text-xs text-gray-400">
      <div className="flex items-center space-x-4">
        <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        {hasSelection && (
          <span>({selectionLength} chars)</span>
        )}
        <span>Spaces: {settings.tabSize}</span>
        <span>Encoding: UTF-8</span>
        {fileSize > 0 && (
          <span>{formatFileSize(fileSize)}</span>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <span className={isModified ? 'text-yellow-400' : ''}>
          {isModified ? '●' : ''}
        </span>
        <span className="uppercase">{language}</span>
        <span className="truncate max-w-64" title={filePath}>
          {getFileDirectory(filePath) && (
            <span className="text-gray-500">{getFileDirectory(filePath)}/</span>
          )}
          {getFileName(filePath)}
        </span>
      </div>
    </div>
  );
}; 
