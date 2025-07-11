# PRP-2025-07-11-02: Universal File Support

## Overview

This PRP implements universal file support for the Scratch Editor, allowing users to open any file type that contains readable text content. This includes configuration files, documentation files, and any text-based files regardless of their extension.

## User-Facing Description

**User Experience**: Users can open any file type that contains readable text
- Users can click on any file in the sidebar and it opens immediately
- Users can open configuration files like .gitignore, .env, .json files
- Users can open documentation files like README.md, CHANGELOG.md
- Users can open any text-based file regardless of extension
- Users get helpful error messages only for truly non-text files
- Users can edit any file that contains readable text content

## Functional Requirements

### 1. File Type Detection
- **Content-Based Detection**: Analyze file content to determine if it's text
- **Extension Support**: Support common text file extensions
- **Binary Detection**: Detect and reject binary files
- **Encoding Detection**: Handle different text encodings (UTF-8, UTF-16, etc.)

### 2. File Opening Logic
- **Single Click**: Open files with single click in sidebar
- **Tab Management**: Open files in new tabs or focus existing tabs
- **Error Handling**: Provide clear error messages for non-text files
- **Loading States**: Show loading indicators during file opening

### 3. Text Encoding Support
- **UTF-8**: Primary encoding support
- **UTF-16**: Support for UTF-16 encoded files
- **ASCII**: Support for ASCII encoded files
- **Auto-Detection**: Automatically detect file encoding
- **Fallback**: Graceful fallback for unsupported encodings

### 4. File Content Validation
- **Text Validation**: Verify file contains readable text
- **Size Limits**: Handle large files appropriately
- **Memory Management**: Efficient memory usage for large files
- **Performance**: Fast file opening without UI blocking

## Non-Functional Requirements

### Performance
- **File Open Time**: < 200ms for files < 1MB
- **Large File Handling**: Graceful handling of files > 10MB
- **Memory Usage**: < 50MB for file content in memory
- **UI Responsiveness**: No blocking during file operations

### Reliability
- **Error Recovery**: Graceful handling of corrupted files
- **Encoding Errors**: Clear error messages for encoding issues
- **File Access**: Handle permission and access errors
- **Data Integrity**: Preserve file content without corruption

### Security
- **File Validation**: Validate file paths and content
- **Permission Checks**: Respect file system permissions
- **Content Safety**: Safe handling of potentially malicious content
- **Path Sanitization**: Prevent path traversal attacks

## Technical Implementation Details

### 1. File Type Detection System

```typescript
// src/utils/fileDetection.ts
export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  isText: boolean;
  encoding: string;
  mimeType?: string;
}

export class FileTypeDetector {
  private static readonly TEXT_EXTENSIONS = [
    '.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx', '.html', '.css',
    '.scss', '.sass', '.less', '.xml', '.yaml', '.yml', '.toml', '.ini',
    '.cfg', '.conf', '.config', '.env', '.gitignore', '.dockerignore',
    '.editorconfig', '.eslintrc', '.prettierrc', '.babelrc', '.npmrc',
    '.gitattributes', '.gitmodules', '.gitconfig', '.bashrc', '.zshrc',
    '.profile', '.bash_profile', '.vimrc', '.emacs', '.tmux.conf',
    '.ssh/config', '.ssh/known_hosts', '.ssh/authorized_keys'
  ];

  private static readonly BINARY_EXTENSIONS = [
    '.exe', '.dll', '.so', '.dylib', '.bin', '.dat', '.db', '.sqlite',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg', '.pdf',
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar',
    '.tar', '.gz', '.bz2', '.7z', '.mp3', '.mp4', '.avi', '.mov'
  ];

  static async detectFileType(filePath: string): Promise<FileInfo> {
    const name = path.basename(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const stats = await fs.stat(filePath);
    
    // Check if it's a known binary extension
    if (this.BINARY_EXTENSIONS.includes(extension)) {
      return {
        path: filePath,
        name,
        extension,
        size: stats.size,
        isText: false,
        encoding: 'binary'
      };
    }

    // Check if it's a known text extension
    if (this.TEXT_EXTENSIONS.includes(extension)) {
      return {
        path: filePath,
        name,
        extension,
        size: stats.size,
        isText: true,
        encoding: 'utf-8'
      };
    }

    // For unknown extensions, analyze content
    return await this.analyzeFileContent(filePath, name, extension, stats.size);
  }

  private static async analyzeFileContent(
    filePath: string, 
    name: string, 
    extension: string, 
    size: number
  ): Promise<FileInfo> {
    try {
      // Read first 4KB to analyze content
      const buffer = await fs.readFile(filePath, { encoding: null });
      const sample = buffer.slice(0, 4096);
      
      // Check for null bytes (indicates binary)
      if (sample.includes(0)) {
        return {
          path: filePath,
          name,
          extension,
          size,
          isText: false,
          encoding: 'binary'
        };
      }

      // Try to decode as UTF-8
      try {
        const text = buffer.toString('utf-8');
        return {
          path: filePath,
          name,
          extension,
          size,
          isText: true,
          encoding: 'utf-8'
        };
      } catch {
        // Try UTF-16
        try {
          const text = buffer.toString('utf-16le');
          return {
            path: filePath,
            name,
            extension,
            size,
            isText: true,
            encoding: 'utf-16le'
          };
        } catch {
          return {
            path: filePath,
            name,
            extension,
            size,
            isText: false,
            encoding: 'unknown'
          };
        }
      }
    } catch (error) {
      throw new Error(`Failed to analyze file: ${error.message}`);
    }
  }
}
```

### 2. File Opening Service

```typescript
// src/services/fileService.ts
import { FileTypeDetector, FileInfo } from '../utils/fileDetection';
import { invoke } from '@tauri-apps/api/tauri';

export class FileService {
  static async openFile(filePath: string): Promise<{ content: string; info: FileInfo }> {
    try {
      // Detect file type
      const fileInfo = await FileTypeDetector.detectFileType(filePath);
      
      if (!fileInfo.isText) {
        throw new Error(`Cannot open binary file: ${fileInfo.name}`);
      }

      // Read file content with proper encoding
      const content = await this.readFileWithEncoding(filePath, fileInfo.encoding);
      
      return { content, info: fileInfo };
    } catch (error) {
      throw new Error(`Failed to open file: ${error.message}`);
    }
  }

  private static async readFileWithEncoding(filePath: string, encoding: string): Promise<string> {
    try {
      // Use Tauri API to read file
      const content = await invoke('read_text_file', { 
        path: filePath,
        encoding 
      });
      
      return content as string;
    } catch (error) {
      throw new Error(`Failed to read file with encoding ${encoding}: ${error.message}`);
    }
  }

  static async getFileList(folderPath: string): Promise<FileInfo[]> {
    try {
      const files = await invoke('get_file_list', { path: folderPath });
      const fileInfos: FileInfo[] = [];
      
      for (const file of files as string[]) {
        try {
          const fileInfo = await FileTypeDetector.detectFileType(file);
          fileInfos.push(fileInfo);
        } catch (error) {
          console.warn(`Failed to analyze file ${file}:`, error);
        }
      }
      
      return fileInfos;
    } catch (error) {
      throw new Error(`Failed to get file list: ${error.message}`);
    }
  }
}
```

### 3. Enhanced File Store

```typescript
// src/stores/fileStore.ts
import { create } from 'zustand';
import { FileService } from '../services/fileService';
import { FileInfo } from '../utils/fileDetection';

interface FileStore {
  // State
  files: FileInfo[];
  openedFiles: Map<string, { content: string; info: FileInfo }>;
  loadingFiles: Set<string>;
  error: string | null;
  
  // Actions
  openFile: (filePath: string) => Promise<void>;
  closeFile: (filePath: string) => void;
  refreshFiles: (folderPath: string) => Promise<void>;
  clearError: () => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  openedFiles: new Map(),
  loadingFiles: new Set(),
  error: null,

  openFile: async (filePath: string) => {
    const { openedFiles, loadingFiles } = get();
    
    // Check if file is already opened
    if (openedFiles.has(filePath)) {
      return;
    }

    // Check if file is already loading
    if (loadingFiles.has(filePath)) {
      return;
    }

    set(state => ({
      loadingFiles: new Set([...state.loadingFiles, filePath]),
      error: null
    }));

    try {
      const { content, info } = await FileService.openFile(filePath);
      
      set(state => ({
        openedFiles: new Map([...state.openedFiles, [filePath, { content, info }]]),
        loadingFiles: new Set([...state.loadingFiles].filter(f => f !== filePath))
      }));
    } catch (error) {
      set(state => ({
        error: error.message,
        loadingFiles: new Set([...state.loadingFiles].filter(f => f !== filePath))
      }));
    }
  },

  closeFile: (filePath: string) => {
    set(state => {
      const newOpenedFiles = new Map(state.openedFiles);
      newOpenedFiles.delete(filePath);
      return { openedFiles: newOpenedFiles };
    });
  },

  refreshFiles: async (folderPath: string) => {
    try {
      const files = await FileService.getFileList(folderPath);
      set({ files, error: null });
    } catch (error) {
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null })
}));
```

### 4. Enhanced Sidebar Component

```typescript
// src/components/Sidebar/FolderTree.tsx
import React from 'react';
import { useFileStore } from '../../stores/fileStore';
import { useTabStore } from '../../stores/tabStore';
import { FileInfo } from '../../utils/fileDetection';

interface FolderTreeProps {
  folderPath: string;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ folderPath }) => {
  const { files, openFile, loadingFiles, error } = useFileStore();
  const { addTab, focusTab } = useTabStore();

  const handleFileClick = async (fileInfo: FileInfo) => {
    try {
      // Open file in store
      await openFile(fileInfo.path);
      
      // Add or focus tab
      const existingTab = tabs.find(tab => tab.filePath === fileInfo.path);
      if (existingTab) {
        focusTab(existingTab.id);
      } else {
        addTab({
          id: generateId(),
          filePath: fileInfo.path,
          title: fileInfo.name,
          isPinned: false,
          isModified: false
        });
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const renderFile = (fileInfo: FileInfo) => {
    const isLoading = loadingFiles.has(fileInfo.path);
    const isText = fileInfo.isText;
    
    return (
      <div
        key={fileInfo.path}
        className={`file-item ${isLoading ? 'loading' : ''} ${!isText ? 'binary' : ''}`}
        onClick={() => isText && handleFileClick(fileInfo)}
        title={!isText ? 'Binary file - cannot open' : fileInfo.name}
      >
        <div className="file-icon">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <FileIcon extension={fileInfo.extension} isText={isText} />
          )}
        </div>
        <div className="file-name">{fileInfo.name}</div>
        {!isText && (
          <div className="file-badge">Binary</div>
        )}
      </div>
    );
  };

  return (
    <div className="folder-tree">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="file-list">
        {files.map(renderFile)}
      </div>
    </div>
  );
};
```

### 5. Error Handling Component

```typescript
// src/components/common/FileErrorDialog.tsx
import React from 'react';
import { Dialog } from './Dialog';

interface FileErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  fileName: string;
}

export const FileErrorDialog: React.FC<FileErrorDialogProps> = ({
  isOpen,
  onClose,
  error,
  fileName
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Cannot Open File">
      <div className="error-content">
        <p>
          <strong>{fileName}</strong> cannot be opened in the editor.
        </p>
        <p className="error-details">{error}</p>
        <p className="error-help">
          Only text files can be opened in the editor. Binary files, images, 
          and other non-text files are not supported.
        </p>
      </div>
      <div className="dialog-actions">
        <button onClick={onClose} className="btn btn-primary">
          OK
        </button>
      </div>
    </Dialog>
  );
};
```

## Testing Requirements

### Unit Tests
- **File Detection**: Test file type detection logic
- **Encoding Detection**: Test various text encodings
- **Error Handling**: Test error scenarios and edge cases
- **Performance**: Test large file handling

### Integration Tests
- **File Opening**: Test complete file opening workflow
- **Tab Integration**: Test file opening with tab management
- **Error Recovery**: Test error handling and recovery
- **Memory Management**: Test memory usage with large files

### E2E Tests
- **User Workflow**: Test file opening from sidebar
- **Error Scenarios**: Test binary file rejection
- **Large Files**: Test handling of large text files
- **Encoding Issues**: Test files with different encodings

### Test Coverage Targets
- **File Detection**: >90% coverage
- **File Service**: >85% coverage
- **Error Handling**: >80% coverage
- **UI Components**: >85% coverage

## Accessibility Requirements

### Keyboard Navigation
- **File Selection**: Keyboard navigation through file list
- **File Opening**: Enter key to open selected file
- **Error Dialogs**: Keyboard navigation in error dialogs

### Screen Reader Support
- **File Types**: Announce file types and accessibility
- **Loading States**: Announce loading states
- **Error Messages**: Clear error announcements

### Visual Feedback
- **File Icons**: Clear visual distinction between file types
- **Loading Indicators**: Clear loading states
- **Error States**: Clear error indicators

## Performance Considerations

### File Size Handling
- **Large Files**: Stream large files instead of loading entirely
- **Memory Management**: Efficient memory usage for multiple files
- **Caching**: Cache file content for better performance
- **Lazy Loading**: Load file content on demand

### UI Responsiveness
- **Non-Blocking**: File operations don't block UI
- **Progress Indicators**: Show progress for large files
- **Background Processing**: Process files in background
- **Cancellation**: Allow cancellation of file operations

## Potential Risks and Mitigation

### Performance Risk
- **Risk**: Large files causing memory issues
- **Mitigation**: File size limits, streaming, memory management

### Security Risk
- **Risk**: Malicious file content
- **Mitigation**: Content validation, safe file handling

### User Experience Risk
- **Risk**: Confusing error messages
- **Mitigation**: Clear error messages, helpful guidance

### Reliability Risk
- **Risk**: File corruption or access issues
- **Mitigation**: Robust error handling, graceful degradation

## Implementation Steps

### Phase 1: File Detection System
1. Implement file type detection logic
2. Add encoding detection
3. Create file validation system
4. Test with various file types

### Phase 2: File Service Implementation
1. Implement file reading service
2. Add error handling
3. Integrate with Tauri APIs
4. Test file opening workflow

### Phase 3: UI Integration
1. Update sidebar component
2. Add file icons and indicators
3. Implement error dialogs
4. Test user interactions

### Phase 4: Performance Optimization
1. Implement file streaming
2. Add memory management
3. Optimize large file handling
4. Performance testing

### Phase 5: Testing and Polish
1. Comprehensive test coverage
2. Accessibility testing
3. Performance testing
4. User experience testing

## Success Criteria

### Functional Success
- [ ] Any text file can be opened regardless of extension
- [ ] Binary files are properly rejected with clear messages
- [ ] File encoding is correctly detected and handled
- [ ] Large files are handled gracefully

### Performance Success
- [ ] File opening time < 200ms for normal files
- [ ] Memory usage stays reasonable with multiple files
- [ ] UI remains responsive during file operations
- [ ] Large files don't cause crashes

### User Experience Success
- [ ] Clear visual feedback for file types
- [ ] Helpful error messages for unsupported files
- [ ] Smooth file opening workflow
- [ ] Intuitive file browsing experience

This PRP provides a comprehensive implementation plan for universal file support, ensuring users can open any text-based file while providing clear feedback for unsupported file types. 
