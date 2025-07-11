# PRP-04: Tab Management

## Goals
- Implement tab bar: open, close, switch, reorder.
- Persist open tabs in app state.
- Add advanced tab features like drag-and-drop, tab groups, and tab previews.

## Detailed Implementation Steps

### 1. Enhanced Tab Types and Interfaces

**src/types/tabs.ts:**
```typescript
export interface Tab {
  id: string;
  title: string;
  path: string;
  isActive: boolean;
  isModified: boolean;
  isPinned: boolean;
  language: string;
  lastAccessed: number;
  preview?: string; // First few lines of content
}

export interface TabGroup {
  id: string;
  name: string;
  tabs: Tab[];
  isActive: boolean;
}

export interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  tabGroups: TabGroup[];
  activeGroupId: string | null;
  tabOrder: string[]; // Maintains tab order for reordering
}
```

### 2. Advanced Tab Store

**src/stores/tabStore.ts:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tab, TabGroup, TabState } from '../types/tabs';

interface TabStore extends TabState {
  // Actions
  addTab: (tab: Omit<Tab, 'id' | 'isActive' | 'lastAccessed'>) => void;
  closeTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  closeTabsToRight: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabAsModified: (tabId: string, isModified: boolean) => void;
  createTabGroup: (name: string) => void;
  moveTabToGroup: (tabId: string, groupId: string) => void;
  closeTabGroup: (groupId: string) => void;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      tabGroups: [],
      activeGroupId: null,
      tabOrder: [],

      addTab: (tabData) => {
        const { tabs, tabOrder } = get();
        const newTab: Tab = {
          ...tabData,
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isActive: false,
          lastAccessed: Date.now(),
        };

        const updatedTabs = [...tabs, newTab];
        const updatedOrder = [...tabOrder, newTab.id];

        set({
          tabs: updatedTabs,
          tabOrder: updatedOrder,
          activeTabId: newTab.id,
        });

        // Update active states
        set({
          tabs: updatedTabs.map(t => ({ ...t, isActive: t.id === newTab.id }))
        });
      },

      closeTab: (tabId) => {
        const { tabs, activeTabId, tabOrder } = get();
        const updatedTabs = tabs.filter(tab => tab.id !== tabId);
        const updatedOrder = tabOrder.filter(id => id !== tabId);

        let newActiveTabId = activeTabId;
        if (activeTabId === tabId) {
          const currentIndex = tabOrder.indexOf(tabId);
          const nextTab = updatedOrder[currentIndex] || updatedOrder[currentIndex - 1];
          newActiveTabId = nextTab || null;
        }

        set({
          tabs: updatedTabs.map(t => ({ ...t, isActive: t.id === newActiveTabId })),
          activeTabId: newActiveTabId,
          tabOrder: updatedOrder,
        });
      },

      closeOtherTabs: (tabId) => {
        const { tabs, tabOrder } = get();
        const updatedTabs = tabs.filter(tab => tab.id === tabId);
        const updatedOrder = [tabId];

        set({
          tabs: updatedTabs.map(t => ({ ...t, isActive: true })),
          activeTabId: tabId,
          tabOrder: updatedOrder,
        });
      },

      closeAllTabs: () => {
        set({
          tabs: [],
          activeTabId: null,
          tabOrder: [],
        });
      },

      closeTabsToRight: (tabId) => {
        const { tabs, tabOrder } = get();
        const currentIndex = tabOrder.indexOf(tabId);
        const tabsToKeep = tabOrder.slice(0, currentIndex + 1);
        const updatedTabs = tabs.filter(tab => tabsToKeep.includes(tab.id));

        set({
          tabs: updatedTabs,
          tabOrder: tabsToKeep,
        });
      },

      setActiveTab: (tabId) => {
        const { tabs } = get();
        set({
          tabs: tabs.map(tab => ({ ...tab, isActive: tab.id === tabId })),
          activeTabId: tabId,
        });
      },

      reorderTabs: (fromIndex: number, toIndex: number) => {
        const { tabOrder, tabs } = get();
        const newOrder = [...tabOrder];
        const [movedTab] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedTab);

        set({
          tabOrder: newOrder,
          tabs: tabs.sort((a, b) => {
            const aIndex = newOrder.indexOf(a.id);
            const bIndex = newOrder.indexOf(b.id);
            return aIndex - bIndex;
          }),
        });
      },

      pinTab: (tabId) => {
        const { tabs } = get();
        set({
          tabs: tabs.map(tab => 
            tab.id === tabId ? { ...tab, isPinned: true } : tab
          ),
        });
      },

      unpinTab: (tabId) => {
        const { tabs } = get();
        set({
          tabs: tabs.map(tab => 
            tab.id === tabId ? { ...tab, isPinned: false } : tab
          ),
        });
      },

      updateTabContent: (tabId, content) => {
        const { tabs } = get();
        const preview = content.split('\n').slice(0, 3).join('\n');
        
        set({
          tabs: tabs.map(tab => 
            tab.id === tabId 
              ? { ...tab, preview, lastAccessed: Date.now() }
              : tab
          ),
        });
      },

      markTabAsModified: (tabId, isModified) => {
        const { tabs } = get();
        set({
          tabs: tabs.map(tab => 
            tab.id === tabId ? { ...tab, isModified } : tab
          ),
        });
      },

      createTabGroup: (name) => {
        const { tabGroups } = get();
        const newGroup: TabGroup = {
          id: `group-${Date.now()}`,
          name,
          tabs: [],
          isActive: false,
        };

        set({
          tabGroups: [...tabGroups, newGroup],
          activeGroupId: newGroup.id,
        });
      },

      moveTabToGroup: (tabId, groupId) => {
        const { tabs, tabGroups } = get();
        const updatedGroups = tabGroups.map(group => {
          if (group.id === groupId) {
            const tab = tabs.find(t => t.id === tabId);
            return tab ? { ...group, tabs: [...group.tabs, tab] } : group;
          }
          return { ...group, tabs: group.tabs.filter(t => t.id !== tabId) };
        });

        set({ tabGroups: updatedGroups });
      },

      closeTabGroup: (groupId) => {
        const { tabGroups, tabs, activeTabId } = get();
        const group = tabGroups.find(g => g.id === groupId);
        if (!group) return;

        const tabIdsToClose = group.tabs.map(t => t.id);
        const updatedTabs = tabs.filter(tab => !tabIdsToClose.includes(tab.id));
        
        let newActiveTabId = activeTabId;
        if (tabIdsToClose.includes(activeTabId!)) {
          newActiveTabId = updatedTabs[0]?.id || null;
        }

        set({
          tabs: updatedTabs.map(t => ({ ...t, isActive: t.id === newActiveTabId })),
          activeTabId: newActiveTabId,
          tabGroups: tabGroups.filter(g => g.id !== groupId),
        });
      },
    }),
    {
      name: 'tab-storage',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        tabOrder: state.tabOrder,
      }),
    }
  )
);
```

### 3. Enhanced Tab Components

**src/components/Tabs/TabBar.tsx:**
```typescript
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
```

**src/components/Tabs/TabItem.tsx:**
```typescript
import React from 'react';
import { X, Pin, PinOff } from 'lucide-react';
import { Tab } from '../../types/tabs';
import { useTabStore } from '../../stores/tabStore';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onSelect,
  onClose,
}) => {
  const { pinTab, unpinTab } = useTabStore();
  const [showActions, setShowActions] = React.useState(false);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tab.isPinned) {
      unpinTab(tab.id);
    } else {
      pinTab(tab.id);
    }
  };

  return (
    <div
      className={`group flex items-center px-4 py-1 border-r border-gray-700 cursor-pointer min-w-0 max-w-48 ${
        isActive
          ? 'bg-vscode-bg text-white'
          : 'bg-vscode-tabs text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {tab.isPinned && (
        <Pin className="w-3 h-3 mr-1 text-blue-400" />
      )}
      
      <span className="text-sm truncate flex-1">{tab.title}</span>
      
      {tab.isModified && (
        <span className="ml-2 w-2 h-2 bg-yellow-500 rounded-full" />
      )}

      <div className={`ml-2 flex items-center space-x-1 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={handlePinToggle}
          className="p-1 hover:bg-gray-600 rounded"
          title={tab.isPinned ? 'Unpin tab' : 'Pin tab'}
        >
          {tab.isPinned ? (
            <PinOff className="w-3 h-3" />
          ) : (
            <Pin className="w-3 h-3" />
          )}
        </button>
        
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-600 rounded"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
```

### 4. Tab Context Menu

**src/components/Tabs/TabContextMenu.tsx:**
```typescript
import React from 'react';
import { useTabStore } from '../../stores/tabStore';

interface TabContextMenuProps {
  x: number;
  y: number;
  tabId: string;
  onClose: () => void;
}

export const TabContextMenu: React.FC<TabContextMenuProps> = ({
  x,
  y,
  tabId,
  onClose,
}) => {
  const { 
    closeTab, 
    closeOtherTabs, 
    closeTabsToRight, 
    pinTab, 
    unpinTab 
  } = useTabStore();

  const tab = useTabStore(state => state.tabs.find(t => t.id === tabId));
  const tabs = useTabStore(state => state.tabs);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  if (!tab) return null;

  const menuItems = [
    {
      label: 'Close',
      action: () => closeTab(tabId),
      disabled: false,
    },
    {
      label: 'Close Others',
      action: () => closeOtherTabs(tabId),
      disabled: tabs.length <= 1,
    },
    {
      label: 'Close to the Right',
      action: () => closeTabsToRight(tabId),
      disabled: tabs.findIndex(t => t.id === tabId) === tabs.length - 1,
    },
    { label: '---', action: () => {}, disabled: true },
    {
      label: tab.isPinned ? 'Unpin' : 'Pin',
      action: () => tab.isPinned ? unpinTab(tabId) : pinTab(tabId),
      disabled: false,
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="fixed z-50 bg-vscode-sidebar border border-gray-600 rounded shadow-lg py-1 min-w-48"
        style={{ left: x, top: y }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleAction(item.action)}
            disabled={item.disabled}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
              item.label === '---' ? 'border-t border-gray-600 my-1' : ''
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};
```

### 5. Tab Preview Component

**src/components/Tabs/TabPreview.tsx:**
```typescript
import React from 'react';
import { Tab } from '../../types/tabs';

interface TabPreviewProps {
  tab: Tab;
  isVisible: boolean;
}

export const TabPreview: React.FC<TabPreviewProps> = ({ tab, isVisible }) => {
  if (!isVisible || !tab.preview) return null;

  return (
    <div className="absolute top-full left-0 bg-vscode-sidebar border border-gray-600 rounded shadow-lg p-3 max-w-md z-50">
      <div className="text-xs text-gray-400 mb-2">{tab.path}</div>
      <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
        {tab.preview}
      </div>
    </div>
  );
};
```

### 6. Tab Groups Component

**src/components/Tabs/TabGroups.tsx:**
```typescript
import React from 'react';
import { useTabStore } from '../../stores/tabStore';

export const TabGroups: React.FC = () => {
  const { tabGroups, activeGroupId, setActiveGroupId } = useTabStore();

  if (tabGroups.length === 0) return null;

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-vscode-tabs border-b border-gray-700">
      {tabGroups.map(group => (
        <button
          key={group.id}
          onClick={() => setActiveGroupId(group.id)}
          className={`px-3 py-1 text-xs rounded ${
            activeGroupId === group.id
              ? 'bg-vscode-accent text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {group.name} ({group.tabs.length})
        </button>
      ))}
    </div>
  );
};
```

## Testing Steps
1. Test tab opening and closing
2. Verify tab reordering with drag-and-drop
3. Test tab pinning/unpinning
4. Verify context menu functionality
5. Test tab persistence across app restarts
6. Verify tab preview functionality
7. Test tab groups (if implemented)
8. Write unit tests for tab store
9. Test tab component accessibility
10. Test keyboard navigation in tabs
11. Test drag and drop functionality
12. Test tab state persistence

## Potential Risks & Mitigation

### 1. Memory Leaks
**Risk:** Tabs not properly cleaned up
**Mitigation:**
- Implement proper cleanup in useEffect
- Monitor memory usage
- Limit maximum number of open tabs

### 2. Performance Issues
**Risk:** Slow rendering with many tabs
**Mitigation:**
- Use React.memo for tab components
- Implement virtual scrolling for large tab lists
- Debounce tab operations

### 3. State Synchronization
**Risk:** Tab state getting out of sync
**Mitigation:**
- Use centralized state management
- Implement proper state updates
- Add state validation

### 4. Drag and Drop Issues
**Risk:** Poor drag-and-drop experience
**Mitigation:**
- Add visual feedback during drag
- Implement proper drop zones
- Handle edge cases (empty lists, etc.)

## Success Criteria
- [ ] Tabs can be opened and closed
- [ ] Tab reordering works with drag-and-drop
- [ ] Tab pinning/unpinning functions correctly
- [ ] Context menu shows appropriate options
- [ ] Tab state persists across app restarts
- [ ] Tab previews show file content
- [ ] Performance is acceptable with many tabs

## Next Steps
After completing tab management, proceed to PRP-05 for Monaco Editor integration. 
