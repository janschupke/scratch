import React from 'react';
import { useFileStore } from '../../stores/fileStore';

interface SidebarHeaderProps {
  onToggleCollapse: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onToggleCollapse }) => {
  const { openFolder, currentFolder, isLoading } = useFileStore();

  const handleOpenFolder = async () => {
    await openFolder();
  };

  const folderName = currentFolder ? currentFolder.split('/').pop() || 'Unknown' : 'No folder';

  return (
    <div className="h-10 bg-vscode-tabs border-b border-gray-700 flex items-center justify-between px-3">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 text-gray-400">📁</div>
        <span className="text-sm font-medium text-gray-300">EXPLORER</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleOpenFolder}
          disabled={isLoading}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50"
          title="Open Folder"
        >
          📁
        </button>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {currentFolder && (
        <div className="absolute top-full left-0 right-0 bg-vscode-sidebar border-b border-gray-700 px-3 py-1">
          <span className="text-xs text-gray-500 truncate">{folderName}</span>
        </div>
      )}
    </div>
  );
}; 
