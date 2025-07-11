import React from 'react';
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
          💾
        </button>
        
        <button
          onClick={onFormat}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          title="Format Document (Shift+Alt+F)"
        >
          🔄
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
          📝
        </button>
        
        <button
          onClick={onToggleMinimap}
          className={`p-1 rounded text-gray-400 hover:text-white ${
            settings.minimap.enabled ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          title="Toggle Minimap"
        >
          👁️
        </button>
        
        <button
          onClick={onToggleLineNumbers}
          className={`p-1 rounded text-gray-400 hover:text-white ${
            settings.lineNumbers === 'on' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          title="Toggle Line Numbers"
        >
          #
        </button>
        
        <button
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          title="Editor Settings"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}; 
