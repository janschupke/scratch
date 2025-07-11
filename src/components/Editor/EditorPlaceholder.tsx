import React from 'react';
import { useFileStore } from '../../stores/fileStore';

export const EditorPlaceholder: React.FC = () => {
  const { openFolder } = useFileStore();

  return (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-lg font-medium mb-2">No file selected</p>
        <p className="text-sm mb-4">Open a file to start editing</p>
        <button
          onClick={openFolder}
          className="flex items-center space-x-2 px-4 py-2 bg-vscode-accent text-white rounded hover:bg-blue-600 mx-auto"
        >
          <span>📁</span>
          <span>Open Folder</span>
        </button>
      </div>
    </div>
  );
}; 
