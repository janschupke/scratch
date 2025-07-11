# PRP-02: UI Skeleton

## Goals
- Implement main layout: sidebar, tab bar, editor area.
- Add dark theme styling.
- Create reusable component structure.

## Detailed Implementation Steps

### 1. Component Structure Design

**Best Practices:**
- Use functional components with TypeScript
- Implement proper prop interfaces
- Use composition over inheritance
- Keep components focused and single-purpose

**Project Structure:**
```
src/
├── components/
│   ├── Sidebar/
│   │   ├── index.tsx
│   │   ├── FolderTree.tsx
│   │   └── SidebarHeader.tsx
│   ├── Tabs/
│   │   ├── index.tsx
│   │   ├── TabItem.tsx
│   │   └── TabBar.tsx
│   ├── Editor/
│   │   ├── index.tsx
│   │   └── EditorPlaceholder.tsx
│   └── Layout/
│       ├── index.tsx
│       └── ResizableLayout.tsx
├── types/
│   └── index.ts
└── utils/
    └── constants.ts
```

### 2. Type Definitions

**src/types/index.ts:**
```typescript
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
}

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

export interface EditorState {
  content: string;
  language: string;
  isDirty: boolean;
}

export interface AppState {
  currentFolder: string | null;
  openTabs: Tab[];
  activeTabId: string | null;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
}
```

### 3. Sidebar Component

**src/components/Sidebar/index.tsx:**
```typescript
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
      className="bg-vscode-sidebar border-r border-gray-700 flex flex-col"
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
```

**src/components/Sidebar/SidebarHeader.tsx:**
```typescript
import React from 'react';
import { FolderOpen, X } from 'lucide-react';

interface SidebarHeaderProps {
  onToggleCollapse: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onToggleCollapse }) => {
  return (
    <div className="h-10 bg-vscode-tabs border-b border-gray-700 flex items-center justify-between px-3">
      <div className="flex items-center space-x-2">
        <FolderOpen className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">EXPLORER</span>
      </div>
      <button
        onClick={onToggleCollapse}
        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
```

**src/components/Sidebar/FolderTree.tsx:**
```typescript
import React from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { FileNode } from '../../types';

interface FolderTreeProps {
  nodes?: FileNode[];
  level?: number;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ 
  nodes = [], 
  level = 0 
}) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: FileNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer ${
            level > 0 ? 'ml-4' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 hover:bg-gray-600 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          {node.type === 'folder' ? (
            <Folder className="w-4 h-4 text-blue-400 mr-2" />
          ) : (
            <File className="w-4 h-4 text-gray-400 mr-2" />
          )}
          
          <span className="text-sm text-gray-300 truncate">{node.name}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <FolderTree nodes={node.children} level={level + 1} />
        )}
      </div>
    );
  };

  return (
    <div className="py-2">
      {nodes.map(renderNode)}
    </div>
  );
};
```

### 4. Tabs Component

**src/components/Tabs/index.tsx:**
```typescript
import React from 'react';
import { TabBar } from './TabBar';
import { Tab } from '../../types';

interface TabsProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder: (fromIndex: number, toIndex: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabReorder,
}) => {
  return (
    <div className="h-8 bg-vscode-tabs border-b border-gray-700 flex items-center">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
        onTabReorder={onTabReorder}
      />
    </div>
  );
};
```

**src/components/Tabs/TabBar.tsx:**
```typescript
import React from 'react';
import { TabItem } from './TabItem';
import { Tab } from '../../types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder: (fromIndex: number, toIndex: number) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabReorder,
}) => {
  const [draggedTab, setDraggedTab] = React.useState<number | null>(null);

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
      onTabReorder(draggedTab, dropIndex);
    }
    setDraggedTab(null);
  };

  return (
    <div className="flex items-center h-full overflow-x-auto">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className="flex-shrink-0"
        >
          <TabItem
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => onTabSelect(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        </div>
      ))}
    </div>
  );
};
```

**src/components/Tabs/TabItem.tsx:**
```typescript
import React from 'react';
import { X } from 'lucide-react';
import { Tab } from '../../types';

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
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={`flex items-center px-4 py-1 border-r border-gray-700 cursor-pointer min-w-0 ${
        isActive
          ? 'bg-vscode-bg text-white'
          : 'bg-vscode-tabs text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
      onClick={onSelect}
    >
      <span className="text-sm truncate max-w-32">{tab.title}</span>
      {tab.isModified && (
        <span className="ml-2 w-2 h-2 bg-yellow-500 rounded-full" />
      )}
      <button
        onClick={handleClose}
        className="ml-2 p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
```

### 5. Editor Component

**src/components/Editor/index.tsx:**
```typescript
import React from 'react';
import { EditorPlaceholder } from './EditorPlaceholder';

interface EditorProps {
  content?: string;
  language?: string;
  isActive: boolean;
}

export const Editor: React.FC<EditorProps> = ({
  content = '',
  language = 'plaintext',
  isActive,
}) => {
  if (!isActive) {
    return <EditorPlaceholder />;
  }

  return (
    <div className="flex-1 bg-vscode-bg p-4">
      <EditorPlaceholder />
    </div>
  );
};
```

**src/components/Editor/EditorPlaceholder.tsx:**
```typescript
import React from 'react';
import { FileText } from 'lucide-react';

export const EditorPlaceholder: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <FileText className="w-16 h-16 mx-auto mb-4" />
        <p className="text-lg font-medium">No file selected</p>
        <p className="text-sm">Open a file to start editing</p>
      </div>
    </div>
  );
};
```

### 6. Main Layout Component

**src/components/Layout/index.tsx:**
```typescript
import React from 'react';
import { Sidebar } from '../Sidebar';
import { Tabs } from '../Tabs';
import { Editor } from '../Editor';
import { Tab } from '../../types';

interface LayoutProps {
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  tabs: Tab[];
  activeTabId: string | null;
  onSidebarToggle: () => void;
  onSidebarResize: (width: number) => void;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder: (fromIndex: number, toIndex: number) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  sidebarWidth,
  isSidebarCollapsed,
  tabs,
  activeTabId,
  onSidebarToggle,
  onSidebarResize,
  onTabSelect,
  onTabClose,
  onTabReorder,
}) => {
  return (
    <div className="h-screen bg-vscode-bg text-vscode-text flex">
      <Sidebar
        width={sidebarWidth}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onSidebarToggle}
        onWidthChange={onSidebarResize}
      />
      
      <div className="flex-1 flex flex-col">
        <Tabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={onTabSelect}
          onTabClose={onTabClose}
          onTabReorder={onTabReorder}
        />
        
        <Editor
          isActive={activeTabId !== null}
        />
      </div>
    </div>
  );
};
```

### 7. Updated App.tsx

**src/App.tsx:**
```typescript
import React from 'react';
import { Layout } from './components/Layout';
import { Tab } from './types';

function App() {
  const [sidebarWidth, setSidebarWidth] = React.useState(250);
  const [isSidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [tabs, setTabs] = React.useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);

  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[0].id : null);
    }
  };

  const handleTabReorder = (fromIndex: number, toIndex: number) => {
    const newTabs = [...tabs];
    const [movedTab] = newTabs.splice(fromIndex, 1);
    newTabs.splice(toIndex, 0, movedTab);
    setTabs(newTabs);
  };

  return (
    <Layout
      sidebarWidth={sidebarWidth}
      isSidebarCollapsed={isSidebarCollapsed}
      tabs={tabs}
      activeTabId={activeTabId}
      onSidebarToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      onSidebarResize={setSidebarWidth}
      onTabSelect={handleTabSelect}
      onTabClose={handleTabClose}
      onTabReorder={handleTabReorder}
    />
  );
}

export default App;
```

## Testing Steps
1. Verify sidebar renders with proper styling
2. Test sidebar collapse/expand functionality
3. Verify tab bar renders correctly
4. Test tab selection and close functionality
5. Verify editor placeholder displays
6. Test responsive layout behavior
7. Write unit tests for all components
8. Test component accessibility features
9. Verify keyboard navigation works
10. Test component integration scenarios

## Potential Risks & Mitigation

### 1. Performance Issues
**Risk:** Slow rendering with many files/tabs
**Mitigation:**
- Use React.memo for components
- Implement virtual scrolling for large file trees
- Debounce resize events

### 2. Memory Leaks
**Risk:** Event listeners not cleaned up
**Mitigation:**
- Use useEffect cleanup functions
- Remove event listeners on component unmount

### 3. Accessibility Issues
**Risk:** Poor keyboard navigation
**Mitigation:**
- Add proper ARIA labels
- Implement keyboard shortcuts
- Ensure focus management

### 4. TypeScript Errors
**Risk:** Type mismatches between components
**Mitigation:**
- Define strict interfaces
- Use proper generic types
- Enable strict TypeScript mode

## Success Criteria
- [ ] Sidebar renders with VS Code-like styling
- [ ] Sidebar can be collapsed/expanded
- [ ] Sidebar width can be resized
- [ ] Tab bar displays correctly
- [ ] Tabs can be selected and closed
- [ ] Editor placeholder shows when no file is open
- [ ] Layout is responsive and properly structured
- [ ] Dark theme is consistently applied
- [ ] All components have unit tests with >80% coverage
- [ ] Components meet accessibility standards
- [ ] Keyboard navigation works properly

## Next Steps
After completing the UI skeleton, proceed to PRP-03 for folder and file handling implementation. 
