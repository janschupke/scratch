import React, { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { Tabs } from '../Tabs';
import { MonacoEditor } from '../Editor';
import { EditorStatusBar } from '../Editor/EditorStatusBar';
import { FindReplace } from '../Editor/FindReplace';
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
  const { activeTabId, tabs } = useTabStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const [isFindReplaceVisible, setIsFindReplaceVisible] = useState(false);

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
        
        <FindReplace
          isVisible={isFindReplaceVisible}
          onClose={() => setIsFindReplaceVisible(false)}
        />
        
        {activeTabId && (
          <EditorStatusBar
            language={activeTab?.language || 'plaintext'}
            filePath={activeTab?.path || ''}
            isModified={activeTab?.isModified || false}
          />
        )}
      </div>
    </div>
  );
}; 
