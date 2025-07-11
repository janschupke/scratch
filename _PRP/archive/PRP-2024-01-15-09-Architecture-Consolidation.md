# PRP-08: Architecture Consolidation

## Goals
- Consolidate and refactor the codebase after initial implementation
- Resolve architectural inconsistencies and conflicts
- Optimize state management and performance
- Establish clear patterns and utilities
- Ensure maintainability and scalability

## Detailed Implementation Steps

### 1. State Management Architecture Consolidation

**Problem Analysis:**
- Multiple stores (fileStore, tabStore, appStore) with overlapping responsibilities
- Inconsistent state patterns across components
- Potential conflicts between different store implementations

**Solution: Unified State Architecture**

**src/stores/index.ts:**
```typescript
// Centralized store exports
export { useAppStore } from './appStore';
export { useFileStore } from './fileStore';
export { useTabStore } from './tabStore';
export { useEditorStore } from './editorStore';
export { usePreferencesStore } from './preferencesStore';

// Store coordination utilities
export { useStoreCoordination } from './coordination';
```

**src/stores/coordination.ts:**
```typescript
import { useAppStore } from './appStore';
import { useFileStore } from './fileStore';
import { useTabStore } from './tabStore';
import { useEditorStore } from './editorStore';

// Centralized store coordination to prevent conflicts
export function useStoreCoordination() {
  const appStore = useAppStore();
  const fileStore = useFileStore();
  const tabStore = useTabStore();
  const editorStore = useEditorStore();

  // Coordinate file opening between stores
  const openFile = async (path: string) => {
    try {
      // Update file store
      await fileStore.openFile(path);
      
      // Update tab store
      const fileInfo = await fileStore.getFileInfo(path);
      tabStore.addTab({
        title: fileInfo.name,
        path: fileInfo.path,
        language: fileInfo.language,
        isModified: false,
        isPinned: false,
        lastAccessed: Date.now(),
      });

      // Update app store
      appStore.addRecentFile(path);
      
      return true;
    } catch (error) {
      console.error('Failed to open file:', error);
      return false;
    }
  };

  // Coordinate file saving
  const saveFile = async (tabId: string) => {
    const tab = tabStore.getTab(tabId);
    if (!tab) return false;

    try {
      const content = editorStore.getContent(tabId);
      await fileStore.saveFile(tab.path, content);
      tabStore.markTabAsModified(tabId, false);
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  };

  // Coordinate tab closing
  const closeTab = (tabId: string) => {
    const tab = tabStore.getTab(tabId);
    if (!tab) return;

    // Check if file is modified
    if (tab.isModified) {
      // Prompt user for save (implement confirmation dialog)
      const shouldSave = confirm('Save changes before closing?');
      if (shouldSave) {
        saveFile(tabId);
      }
    }

    tabStore.closeTab(tabId);
    editorStore.removeEditor(tabId);
  };

  return {
    openFile,
    saveFile,
    closeTab,
  };
}
```

### 2. Language Detection Utility Consolidation

**Problem Analysis:**
- Language mapping duplicated in FileSystemManager and editorConfig
- Inconsistent language detection logic
- No centralized language utilities

**Solution: Unified Language Detection**

**src/utils/languageDetection.ts:**
```typescript
export interface LanguageInfo {
  language: string;
  mimeType?: string;
  extensions: string[];
  isTextFile: boolean;
}

export class LanguageDetector {
  private static instance: LanguageDetector;
  private languageMap: Map<string, LanguageInfo> = new Map();

  private constructor() {
    this.initializeLanguageMap();
  }

  static getInstance(): LanguageDetector {
    if (!LanguageDetector.instance) {
      LanguageDetector.instance = new LanguageDetector();
    }
    return LanguageDetector.instance;
  }

  private initializeLanguageMap() {
    const languages: LanguageInfo[] = [
      {
        language: 'javascript',
        mimeType: 'application/javascript',
        extensions: ['js', 'jsx', 'mjs'],
        isTextFile: true,
      },
      {
        language: 'typescript',
        mimeType: 'application/typescript',
        extensions: ['ts', 'tsx'],
        isTextFile: true,
      },
      {
        language: 'html',
        mimeType: 'text/html',
        extensions: ['html', 'htm', 'xhtml'],
        isTextFile: true,
      },
      {
        language: 'css',
        mimeType: 'text/css',
        extensions: ['css'],
        isTextFile: true,
      },
      {
        language: 'scss',
        mimeType: 'text/x-scss',
        extensions: ['scss', 'sass'],
        isTextFile: true,
      },
      {
        language: 'json',
        mimeType: 'application/json',
        extensions: ['json'],
        isTextFile: true,
      },
      {
        language: 'markdown',
        mimeType: 'text/markdown',
        extensions: ['md', 'markdown'],
        isTextFile: true,
      },
      {
        language: 'python',
        mimeType: 'text/x-python',
        extensions: ['py', 'pyw', 'pyi'],
        isTextFile: true,
      },
      {
        language: 'java',
        mimeType: 'text/x-java-source',
        extensions: ['java'],
        isTextFile: true,
      },
      {
        language: 'cpp',
        mimeType: 'text/x-c++src',
        extensions: ['cpp', 'cc', 'cxx', 'c++'],
        isTextFile: true,
      },
      {
        language: 'c',
        mimeType: 'text/x-csrc',
        extensions: ['c', 'h'],
        isTextFile: true,
      },
      {
        language: 'php',
        mimeType: 'application/x-httpd-php',
        extensions: ['php', 'phtml'],
        isTextFile: true,
      },
      {
        language: 'ruby',
        mimeType: 'text/x-ruby',
        extensions: ['rb', 'erb'],
        isTextFile: true,
      },
      {
        language: 'go',
        mimeType: 'text/x-go',
        extensions: ['go'],
        isTextFile: true,
      },
      {
        language: 'rust',
        mimeType: 'text/x-rust',
        extensions: ['rs'],
        isTextFile: true,
      },
      {
        language: 'sql',
        mimeType: 'text/x-sql',
        extensions: ['sql'],
        isTextFile: true,
      },
      {
        language: 'xml',
        mimeType: 'application/xml',
        extensions: ['xml', 'xsd', 'xsl'],
        isTextFile: true,
      },
      {
        language: 'yaml',
        mimeType: 'text/yaml',
        extensions: ['yaml', 'yml'],
        isTextFile: true,
      },
      {
        language: 'toml',
        mimeType: 'text/x-toml',
        extensions: ['toml'],
        isTextFile: true,
      },
      {
        language: 'ini',
        mimeType: 'text/plain',
        extensions: ['ini', 'cfg', 'conf'],
        isTextFile: true,
      },
      {
        language: 'shell',
        mimeType: 'text/x-sh',
        extensions: ['sh', 'bash', 'zsh', 'fish'],
        isTextFile: true,
      },
      {
        language: 'powershell',
        mimeType: 'text/x-powershell',
        extensions: ['ps1', 'psm1'],
        isTextFile: true,
      },
      {
        language: 'batch',
        mimeType: 'text/x-batch',
        extensions: ['bat', 'cmd'],
        isTextFile: true,
      },
      {
        language: 'vue',
        mimeType: 'text/x-vue',
        extensions: ['vue'],
        isTextFile: true,
      },
      {
        language: 'svelte',
        mimeType: 'text/x-svelte',
        extensions: ['svelte'],
        isTextFile: true,
      },
      {
        language: 'astro',
        mimeType: 'text/x-astro',
        extensions: ['astro'],
        isTextFile: true,
      },
      {
        language: 'plaintext',
        mimeType: 'text/plain',
        extensions: ['txt', 'log'],
        isTextFile: true,
      },
    ];

    // Build extension map
    languages.forEach(lang => {
      lang.extensions.forEach(ext => {
        this.languageMap.set(ext.toLowerCase(), lang);
      });
    });
  }

  detectLanguage(filePath: string): LanguageInfo {
    const extension = this.getFileExtension(filePath);
    const languageInfo = this.languageMap.get(extension);
    
    return languageInfo || {
      language: 'plaintext',
      mimeType: 'text/plain',
      extensions: [],
      isTextFile: this.isTextFile(extension),
    };
  }

  getLanguage(filePath: string): string {
    return this.detectLanguage(filePath).language;
  }

  isTextFile(filePath: string): boolean {
    const extension = this.getFileExtension(filePath);
    const languageInfo = this.languageMap.get(extension);
    return languageInfo?.isTextFile ?? false;
  }

  private getFileExtension(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() || '';
  }

  getSupportedLanguages(): string[] {
    const languages = new Set<string>();
    this.languageMap.forEach(lang => {
      languages.add(lang.language);
    });
    return Array.from(languages);
  }
}

// Export singleton instance
export const languageDetector = LanguageDetector.getInstance();
```

### 3. Component Architecture Refactoring

**Problem Analysis:**
- Components may have inconsistent prop interfaces
- Potential performance issues with re-renders
- Missing error boundaries and loading states

**Solution: Enhanced Component Architecture**

**src/components/common/ErrorBoundary.tsx:**
```typescript
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
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
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="p-4 bg-red-900 text-red-100 rounded">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-sm mb-4">{this.state.error?.message}</p>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**src/components/common/LoadingSpinner.tsx:**
```typescript
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} border-2 border-vscode-accent border-t-transparent rounded-full animate-spin mb-2`} />
      <p className="text-vscode-text text-sm">{message}</p>
    </div>
  );
};
```

**src/components/common/ConfirmDialog.tsx:**
```typescript
import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'info' | 'warning' | 'error';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info',
}) => {
  if (!isOpen) return null;

  const typeClasses = {
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-vscode-sidebar border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full ${typeClasses[type]} mr-3`} />
          <h3 className="text-lg font-medium text-vscode-text">{title}</h3>
        </div>
        
        <p className="text-vscode-text mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-vscode-text hover:bg-gray-700 rounded"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded ${typeClasses[type]} hover:opacity-90`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 4. Performance Optimization

**Problem Analysis:**
- Potential memory leaks with file watchers
- Large file tree rendering performance
- Editor memory usage with multiple files

**Solution: Performance Optimizations**

**src/hooks/useFileWatcher.ts:**
```typescript
import { useEffect, useRef } from 'react';
import { useFileStore } from '../stores/fileStore';

export function useFileWatcher(folderPath: string) {
  const { refreshFileTree } = useFileStore();
  const watcherRef = useRef<any>(null);

  useEffect(() => {
    if (!folderPath) return;

    // Set up file system watcher
    const setupWatcher = async () => {
      try {
        // This would use Tauri's file system watching capabilities
        // Implementation depends on Tauri's file watching API
        console.log('Setting up file watcher for:', folderPath);
        
        // Cleanup function
        return () => {
          if (watcherRef.current) {
            // Clean up watcher
            console.log('Cleaning up file watcher');
          }
        };
      } catch (error) {
        console.error('Failed to setup file watcher:', error);
      }
    };

    const cleanup = setupWatcher();
    return cleanup;
  }, [folderPath, refreshFileTree]);

  return null;
}
```

**src/components/Sidebar/VirtualizedFolderTree.tsx:**
```typescript
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { FileNode } from '../../types';
import { FolderTreeItem } from './FolderTreeItem';

interface VirtualizedFolderTreeProps {
  nodes: FileNode[];
  height: number;
  itemHeight: number;
}

export const VirtualizedFolderTree: React.FC<VirtualizedFolderTreeProps> = ({
  nodes,
  height,
  itemHeight,
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <FolderTreeItem node={nodes[index]} />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={nodes.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 5. Code Quality and Testing

**Problem Analysis:**
- Missing unit tests
- No code quality tools
- Inconsistent code patterns

**Solution: Quality Assurance Setup**

**src/utils/testUtils.ts:**
```typescript
import { render } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
export function renderWithProviders(ui: ReactElement, options = {}) {
  // Add any providers needed for testing
  return render(ui, options);
}

// Mock stores for testing
export const mockFileStore = {
  currentFolder: '/test/path',
  fileTree: [],
  openTabs: [],
  activeTabId: null,
  isLoading: false,
  error: null,
  openFolder: jest.fn(),
  loadFileTree: jest.fn(),
  openFile: jest.fn(),
  closeTab: jest.fn(),
  setActiveTab: jest.fn(),
};

export const mockTabStore = {
  tabs: [],
  activeTabId: null,
  tabGroups: [],
  activeGroupId: null,
  tabOrder: [],
  addTab: jest.fn(),
  closeTab: jest.fn(),
  setActiveTab: jest.fn(),
  reorderTabs: jest.fn(),
};
```

**jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 6. Documentation and Developer Experience

**Problem Analysis:**
- Missing API documentation
- No development guidelines
- Inconsistent code comments

**Solution: Documentation and DX Improvements**

**src/docs/ARCHITECTURE.md:**
```markdown
# Scratch Editor Architecture

## Overview
Scratch is a desktop text editor built with React, TypeScript, and Tauri.

## Architecture Layers

### 1. Presentation Layer (Components)
- **Location**: `src/components/`
- **Responsibility**: UI rendering and user interactions
- **Pattern**: Functional components with hooks

### 2. State Management Layer (Stores)
- **Location**: `src/stores/`
- **Responsibility**: Application state and business logic
- **Pattern**: Zustand stores with persistence

### 3. Service Layer (Utilities)
- **Location**: `src/utils/`
- **Responsibility**: File system operations, language detection
- **Pattern**: Singleton classes and utility functions

### 4. Native Integration Layer (Tauri)
- **Location**: `src-tauri/`
- **Responsibility**: Desktop integration and file system access
- **Pattern**: Rust backend with Tauri APIs

## State Management Strategy

### Store Responsibilities
- **AppStore**: Global app state, preferences, window state
- **FileStore**: File system operations, current folder, file tree
- **TabStore**: Tab management, tab groups, tab persistence
- **EditorStore**: Editor instances, content, editor settings

### Store Coordination
- Use `useStoreCoordination()` hook for cross-store operations
- Avoid direct store-to-store dependencies
- Implement proper error handling and rollback mechanisms

## Performance Considerations

### File System
- Implement virtual scrolling for large file trees
- Use file watchers sparingly and clean up properly
- Cache file content for frequently accessed files

### Editor
- Lazy load Monaco Editor instances
- Implement proper cleanup for editor resources
- Use debouncing for auto-save operations

### Memory Management
- Dispose of file watchers on component unmount
- Clear editor instances when tabs are closed
- Implement proper cleanup in useEffect hooks
```

**src/docs/DEVELOPMENT.md:**
```markdown
# Development Guidelines

## Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use proper TypeScript interfaces for all props
- Implement proper error boundaries

## State Management
- Use Zustand for state management
- Keep stores focused and single-purpose
- Use the coordination layer for cross-store operations
- Implement proper persistence strategies

## Performance
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Debounce frequent operations
- Monitor memory usage

## Testing
- Write unit tests for utilities and hooks
- Use integration tests for store interactions
- Mock external dependencies
- Maintain good test coverage

## Error Handling
- Use error boundaries for component errors
- Implement proper error states in components
- Log errors appropriately
- Provide user-friendly error messages
```

## Testing Steps
1. Verify all stores work together without conflicts
2. Test language detection with various file types
3. Verify error boundaries catch and handle errors properly
4. Test performance with large file trees
5. Verify memory usage doesn't leak
6. Run all tests and check coverage
7. Test the complete user workflow

## Potential Risks & Mitigation

### 1. Store Conflicts
**Risk**: Multiple stores updating the same state
**Mitigation**: Use coordination layer and clear responsibilities

### 2. Memory Leaks
**Risk**: File watchers and editor instances not cleaned up
**Mitigation**: Implement proper cleanup in useEffect hooks

### 3. Performance Degradation
**Risk**: Large file trees causing slow rendering
**Mitigation**: Implement virtual scrolling and lazy loading

### 4. Type Inconsistencies
**Risk**: TypeScript errors from refactoring
**Mitigation**: Use strict TypeScript and comprehensive testing

## Success Criteria
- [ ] All stores work together without conflicts
- [ ] Language detection works consistently
- [ ] Performance is acceptable with large files
- [ ] Memory usage is stable
- [ ] All tests pass with good coverage
- [ ] Error handling works properly
- [ ] Documentation is complete and accurate

## Next Steps
After completing architecture consolidation, the codebase will be well-structured, performant, and maintainable. Consider additional features like:
- Plugin system architecture
- Extension marketplace
- Advanced search and replace
- Git integration
- Terminal integration 
