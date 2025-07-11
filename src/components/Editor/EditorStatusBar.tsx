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
      // Cleanup will be handled by Monaco Editor
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
