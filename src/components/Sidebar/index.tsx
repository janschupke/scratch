import React from 'react';
import { FolderTree } from './FolderTree';
import { SidebarHeader } from './SidebarHeader';

interface SidebarProps {
  width: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onWidthChange: (width: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  isCollapsed,
  onToggleCollapse,
  onWidthChange,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      onWidthChange(Math.max(200, Math.min(400, newWidth)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (isCollapsed) {
    return (
      <div className="w-8 bg-vscode-sidebar border-r border-gray-700 flex flex-col">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white"
        >
          →
        </button>
      </div>
    );
  }

  return (
    <div 
      className="bg-vscode-sidebar border-r border-gray-700 flex flex-col relative"
      style={{ width: `${width}px` }}
    >
      <SidebarHeader onToggleCollapse={onToggleCollapse} />
      <div className="flex-1 overflow-hidden">
        <FolderTree />
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-vscode-accent"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}; 
