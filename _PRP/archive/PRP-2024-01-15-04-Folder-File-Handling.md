# PRP-03: Folder & File Handling

## Goals
- Use Tauri APIs to open folder picker.
- Read/display folder structure in sidebar.
- Open files in tabs.

## Detailed Implementation Steps

### 1. Tauri API Setup

**Best Practices:**
- Use Tauri's built-in dialog and fs APIs
- Implement proper error handling
- Cache file tree data for performance
- Use async/await for file operations

**Required Tauri Permissions (tauri.conf.json):**
```json
{
  "tauri": {
    "allowlist": {
      "dialog": {
        "all": true
      },
      "fs": {
        "all": true,
        "scope": ["**"]
      },
      "path": {
        "all": true
      }
    }
  }
}
```

### 2. File System Utilities

**src/utils/fileSystem.ts:**
```typescript
import { open } from '@tauri-apps/api/dialog';
import { readDir, readTextFile } from '@tauri-apps/api/fs';
import { basename, dirname, extname } from '@tauri-apps/api/path';
import { FileNode } from '../types';

export class FileSystemManager {
  private static instance: FileSystemManager;
  private fileCache = new Map<string, FileNode>();

  static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager();
    }
    return FileSystemManager.instance;
  }

  async selectFolder(): Promise<string | null> {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Folder to Open'
      });

      if (selected && !Array.isArray(selected)) {
        return selected;
      }
      return null;
    } catch (error) {
      console.error('Error selecting folder:', error);
      return null;
    }
  }

  async readDirectory(path: string): Promise<FileNode[]> {
    try {
      const entries = await readDir(path, { recursive: false });
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        if (entry.children) {
          // Directory
          nodes.push({
            id: entry.path,
            name: await basename(entry.path),
            path: entry.path,
            type: 'folder',
            children: [],
            isOpen: false
          });
        } else {
          // File
          nodes.push({
            id: entry.path,
            name: await basename(entry.path),
            path: entry.path,
            type: 'file'
          });
        }
      }

      // Sort: folders first, then files alphabetically
      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      return await readTextFile(path);
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${path}`);
    }
  }

  getFileExtension(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    return ext;
  }

  getLanguageFromExtension(extension: string): string {
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'fish': 'shell',
      'ps1': 'powershell',
      'bat': 'batch',
      'cmd': 'batch'
    };

    return languageMap[extension] || 'plaintext';
  }

  // Note: This language mapping should be consolidated with the one in editorConfig.ts
  // to avoid duplication. Consider creating a shared language detection utility.

  isTextFile(extension: string): boolean {
    const textExtensions = [
      'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'json',
      'xml', 'yaml', 'yml', 'toml', 'ini', 'sh', 'bash', 'zsh', 'fish',
      'ps1', 'bat', 'cmd', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go',
      'rs', 'sql', 'vue', 'svelte', 'astro', 'jsx', 'tsx'
    ];
    return textExtensions.includes(extension);
  }
}
```

### 3. State Management for File System

**src/stores/fileStore.ts:**
```typescript
import { create } from 'zustand';
import { FileSystemManager } from '../utils/fileSystem';
import { FileNode, Tab } from '../types';

interface FileStore {
  currentFolder: string | null;
  fileTree: FileNode[];
  openTabs: Tab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  openFolder: () => Promise<void>;
  loadFileTree: (path: string) => Promise<void>;
  openFile: (path: string) => Promise<void>;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  clearError: () => void;
}

export const useFileStore = create<FileStore>((set, get) => {
  const fileSystem = FileSystemManager.getInstance();

  return {
    currentFolder: null,
    fileTree: [],
    openTabs: [],
    activeTabId: null,
    isLoading: false,
    error: null,

    openFolder: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const folderPath = await fileSystem.selectFolder();
        if (folderPath) {
          set({ currentFolder: folderPath });
          await get().loadFileTree(folderPath);
        }
      } catch (error) {
        set({ error: `Failed to open folder: ${error}` });
      } finally {
        set({ isLoading: false });
      }
    },

    loadFileTree: async (path: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const nodes = await fileSystem.readDirectory(path);
        set({ fileTree: nodes });
      } catch (error) {
        set({ error: `Failed to load file tree: ${error}` });
      } finally {
        set({ isLoading: false });
      }
    },

    openFile: async (path: string) => {
      const { openTabs } = get();
      
      // Check if file is already open
      const existingTab = openTabs.find(tab => tab.path === path);
      if (existingTab) {
        get().setActiveTab(existingTab.id);
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const extension = fileSystem.getFileExtension(path);
        const language = fileSystem.getLanguageFromExtension(extension);
        
        // Only open text files
        if (!fileSystem.isTextFile(extension)) {
          set({ error: 'Only text files can be opened in the editor' });
          return;
        }

        const content = await fileSystem.readFile(path);
        const fileName = path.split('/').pop() || 'Untitled';
        
        const newTab: Tab = {
          id: `tab-${Date.now()}`,
          title: fileName,
          path,
          isActive: true,
          isModified: false
        };

        const updatedTabs = [...openTabs, newTab];
        set({ 
          openTabs: updatedTabs,
          activeTabId: newTab.id,
          isLoading: false 
        });
      } catch (error) {
        set({ error: `Failed to open file: ${error}` });
      } finally {
        set({ isLoading: false });
      }
    },

    closeTab: (tabId: string) => {
      const { openTabs, activeTabId } = get();
      const updatedTabs = openTabs.filter(tab => tab.id !== tabId);
      
      let newActiveTabId = activeTabId;
      if (activeTabId === tabId) {
        newActiveTabId = updatedTabs.length > 0 ? updatedTabs[0].id : null;
      }

      set({ 
        openTabs: updatedTabs,
        activeTabId: newActiveTabId
      });
    },

    setActiveTab: (tabId: string) => {
      set({ activeTabId: tabId });
    },

    clearError: () => {
      set({ error: null });
    }
  };
});
```

### 4. Enhanced Sidebar Component

**src/components/Sidebar/FolderTree.tsx:**
```typescript
import React from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { FileNode } from '../../types';
import { useFileStore } from '../../stores/fileStore';
import { FileSystemManager } from '../../utils/fileSystem';

interface FolderTreeProps {
  nodes?: FileNode[];
  level?: number;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ 
  nodes, 
  level = 0 
}) => {
  const { fileTree, openFile, loadFileTree } = useFileStore();
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());
  const [loadingNodes, setLoadingNodes] = React.useState<Set<string>>(new Set());

  const displayNodes = nodes || fileTree;

  const toggleNode = async (node: FileNode) => {
    if (node.type !== 'folder') {
      // Open file
      await openFile(node.path);
      return;
    }

    const isExpanded = expandedNodes.has(node.id);
    const newExpanded = new Set(expandedNodes);

    if (isExpanded) {
      newExpanded.delete(node.id);
      setExpandedNodes(newExpanded);
    } else {
      // Load children if not already loaded
      if (!node.children || node.children.length === 0) {
        setLoadingNodes(prev => new Set(prev).add(node.id));
        try {
          const fileSystem = FileSystemManager.getInstance();
          const children = await fileSystem.readDirectory(node.path);
          node.children = children;
        } catch (error) {
          console.error('Error loading folder contents:', error);
        } finally {
          setLoadingNodes(prev => {
            const newSet = new Set(prev);
            newSet.delete(node.id);
            return newSet;
          });
        }
      }
      newExpanded.add(node.id);
      setExpandedNodes(newExpanded);
    }
  };

  const renderNode = (node: FileNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const isLoading = loadingNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer ${
            level > 0 ? 'ml-4' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => toggleNode(node)}
        >
          {hasChildren && (
            <div className="p-1">
              {isLoading ? (
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </div>
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
      {displayNodes.map(renderNode)}
    </div>
  );
};
```

### 5. Enhanced Sidebar Header

**src/components/Sidebar/SidebarHeader.tsx:**
```typescript
import React from 'react';
import { FolderOpen, X } from 'lucide-react';
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
        <FolderOpen className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">EXPLORER</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleOpenFolder}
          disabled={isLoading}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50"
          title="Open Folder"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
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
```

### 6. Error Handling Component

**src/components/ErrorBoundary.tsx:**
```typescript
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} />;
      }

      return (
        <div className="p-4 bg-red-900 text-red-100">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-sm">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7. Updated App.tsx

**src/App.tsx:**
```typescript
import React from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useFileStore } from './stores/fileStore';

function App() {
  const { 
    openTabs, 
    activeTabId, 
    setActiveTab, 
    closeTab,
    error,
    clearError
  } = useFileStore();

  const handleTabReorder = (fromIndex: number, toIndex: number) => {
    // Implementation for tab reordering
    // This will be implemented in the next PRP
  };

  return (
    <ErrorBoundary>
      <Layout
        sidebarWidth={250}
        isSidebarCollapsed={false}
        tabs={openTabs}
        activeTabId={activeTabId}
        onSidebarToggle={() => {}} // Will be implemented
        onSidebarResize={() => {}} // Will be implemented
        onTabSelect={setActiveTab}
        onTabClose={closeTab}
        onTabReorder={handleTabReorder}
      />
      
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="ml-4 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;
```

## Testing Steps
1. Test folder selection dialog
2. Verify file tree loads correctly
3. Test opening text files in tabs
4. Verify non-text files show error
5. Test folder expansion/collapse
6. Verify error handling works
7. Test performance with large folders
8. Write unit tests for FileSystemManager
9. Test component integration with stores
10. Test accessibility of file tree
11. Test keyboard navigation in file tree
12. Test error boundary scenarios

## Potential Risks & Mitigation

### 1. File System Permissions
**Risk:** Tauri may not have permission to access certain directories
**Mitigation:**
- Implement proper error handling
- Show user-friendly error messages
- Request permissions explicitly if needed

### 2. Large File Trees
**Risk:** Performance issues with large directories
**Mitigation:**
- Implement lazy loading for folders
- Use virtual scrolling for large lists
- Cache file tree data

### 3. File Encoding Issues
**Risk:** Files with different encodings may not display correctly
**Mitigation:**
- Detect file encoding
- Handle binary files gracefully
- Show encoding information to user

### 4. Memory Usage
**Risk:** Loading many large files into memory
**Mitigation:**
- Implement file content caching
- Load file content on demand
- Implement file size limits

### 5. Security Concerns
**Risk:** Accessing sensitive system files
**Mitigation:**
- Implement file type restrictions
- Add file size limits
- Warn users about system files

## Success Criteria
- [ ] Folder picker dialog opens correctly
- [ ] File tree displays in sidebar
- [ ] Files can be opened in tabs
- [ ] Non-text files show appropriate error
- [ ] Folder expansion/collapse works
- [ ] Error handling displays user-friendly messages
- [ ] Performance is acceptable with large folders

## Next Steps
After completing folder and file handling, proceed to PRP-04 for enhanced tab management implementation. 
