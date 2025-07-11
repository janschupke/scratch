import React from 'react';
import { TabItem } from './TabItem';
import { TabContextMenu } from './TabContextMenu';
import { useTabStore } from '../../stores/tabStore';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, reorderTabs } = useTabStore();
  const [draggedTab, setDraggedTab] = React.useState<number | null>(null);
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTab(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedTab !== null && draggedTab !== dropIndex) {
      reorderTabs(draggedTab, dropIndex);
    }
    setDraggedTab(null);
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Sort tabs by order
  const sortedTabs = tabs.sort((a, b) => {
    const aIndex = tabs.findIndex(t => t.id === a.id);
    const bIndex = tabs.findIndex(t => t.id === b.id);
    return aIndex - bIndex;
  });

  return (
    <div className="relative">
      <div className="flex items-center h-full overflow-x-auto bg-vscode-tabs border-b border-gray-700">
        {sortedTabs.map((tab, index) => (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            className="flex-shrink-0"
          >
            <TabItem
              tab={tab}
              isActive={tab.id === activeTabId}
              onSelect={() => setActiveTab(tab.id)}
              onClose={() => closeTab(tab.id)}
            />
          </div>
        ))}
      </div>

      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tabId={contextMenu.tabId}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}; 
