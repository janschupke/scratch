import React from 'react';
import { Sidebar } from '../Sidebar';
import { Tabs } from '../Tabs';
import { MonacoEditor } from '../Editor';
import { useTabStore } from '../../stores/tabStore';

interface LayoutProps {
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  onSidebarResize: (width: number) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  sidebarWidth,
  isSidebarCollapsed,
  onSidebarToggle,
  onSidebarResize,
}) => {
  const { activeTabId } = useTabStore();

  return (
    <div className="h-screen bg-vscode-bg text-vscode-text flex">
      <Sidebar
        width={sidebarWidth}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onSidebarToggle}
        onWidthChange={onSidebarResize}
      />
      
      <div className="flex-1 flex flex-col">
        <Tabs />
        
        <MonacoEditor
          isActive={activeTabId !== null}
        />
      </div>
    </div>
  );
}; 
