import { create } from 'zustand';
import { statusInformationService } from '../services/statusInformation';

export interface StatusItem {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  tooltip?: string;
  clickable?: boolean;
  className?: string;
}

export interface FileInfo {
  path: string;
  name: string;
  type: string;
  encoding: string;
  size: number;
  lineCount: number;
  isModified: boolean;
  isReadOnly: boolean;
}

export interface EditorState {
  cursorPosition: { line: number; column: number };
  selection: { start: Position; end: Position } | null;
  zoomLevel: number;
  indentation: string;
  language: string;
}

export interface Position {
  line: number;
  column: number;
}

export interface StatusBarState {
  isVisible: boolean;
  items: StatusItem[];
  fileInfo: FileInfo | null;
  editorState: EditorState | null;
  customItems: StatusItem[];
}

export interface StatusBarStore {
  state: StatusBarState;
  
  setVisibility(visible: boolean): void;
  updateFileInfo(fileInfo: FileInfo): void;
  updateEditorState(editorState: EditorState): void;
  addCustomItem(item: StatusItem): void;
  removeCustomItem(id: string): void;
  clearCustomItems(): void;
  updateStatusItems(): void;
  getFileInfo(filePath: string, content: string): Promise<FileInfo>;
}

export const useStatusBarStore = create<StatusBarStore>((set, get) => ({
  state: {
    isVisible: true,
    items: [],
    fileInfo: null,
    editorState: null,
    customItems: []
  },

  setVisibility: (visible: boolean) => {
    set((state) => ({
      state: { ...state.state, isVisible: visible }
    }));
  },

  updateFileInfo: (fileInfo: FileInfo) => {
    set((state) => ({
      state: { ...state.state, fileInfo }
    }));
    get().updateStatusItems();
  },

  updateEditorState: (editorState: EditorState) => {
    set((state) => ({
      state: { ...state.state, editorState }
    }));
    get().updateStatusItems();
  },

  addCustomItem: (item: StatusItem) => {
    set((state) => ({
      state: {
        ...state.state,
        customItems: [...state.state.customItems, item]
      }
    }));
  },

  removeCustomItem: (id: string) => {
    set((state) => ({
      state: {
        ...state.state,
        customItems: state.state.customItems.filter(item => item.id !== id)
      }
    }));
  },

  clearCustomItems: () => {
    set((state) => ({
      state: { ...state.state, customItems: [] }
    }));
  },

  updateStatusItems: () => {
    const { state } = get();
    const items: StatusItem[] = [];

    // File type and language
    if (state.fileInfo) {
      items.push({
        id: 'file-type',
        label: 'Type',
        value: state.fileInfo.type,
        tooltip: `File type: ${state.fileInfo.type}`,
        clickable: true
      });

      items.push({
        id: 'language',
        label: 'Language',
        value: state.fileInfo.type,
        tooltip: `Language: ${state.fileInfo.type}`,
        clickable: true
      });
    }

    // Line count
    if (state.fileInfo) {
      items.push({
        id: 'line-count',
        label: 'Lines',
        value: state.fileInfo.lineCount.toString(),
        tooltip: `Total lines: ${state.fileInfo.lineCount}`,
        clickable: true
      });
    }

    // Cursor position
    if (state.editorState) {
      items.push({
        id: 'cursor-position',
        label: 'Ln',
        value: `${state.editorState.cursorPosition.line}, Col ${state.editorState.cursorPosition.column}`,
        tooltip: `Line ${state.editorState.cursorPosition.line}, Column ${state.editorState.cursorPosition.column}`,
        clickable: true
      });
    }

    // Selection info
    if (state.editorState?.selection) {
      const selection = state.editorState.selection;
      const startLine = selection.start.line;
      const endLine = selection.end.line;
      const startCol = selection.start.column;
      const endCol = selection.end.column;
      
      if (startLine !== endLine || startCol !== endCol) {
        const lines = endLine - startLine + 1;
        const chars = Math.abs(endCol - startCol);
        items.push({
          id: 'selection',
          label: 'Selection',
          value: `${lines} lines, ${chars} chars`,
          tooltip: `Selected: ${lines} lines, ${chars} characters`,
          clickable: true
        });
      }
    }

    // Encoding
    if (state.fileInfo) {
      items.push({
        id: 'encoding',
        label: 'Encoding',
        value: state.fileInfo.encoding,
        tooltip: `File encoding: ${state.fileInfo.encoding}`,
        clickable: true
      });
    }

    // File size
    if (state.fileInfo) {
      items.push({
        id: 'file-size',
        label: 'Size',
        value: statusInformationService.formatFileSize(state.fileInfo.size),
        tooltip: `File size: ${statusInformationService.formatFileSize(state.fileInfo.size)}`,
        clickable: true
      });
    }

    // Indentation
    if (state.editorState) {
      items.push({
        id: 'indentation',
        label: 'Indent',
        value: state.editorState.indentation,
        tooltip: `Indentation: ${state.editorState.indentation}`,
        clickable: true
      });
    }

    // Zoom level
    if (state.editorState) {
      items.push({
        id: 'zoom',
        label: 'Zoom',
        value: `${Math.round(state.editorState.zoomLevel * 100)}%`,
        tooltip: `Zoom level: ${Math.round(state.editorState.zoomLevel * 100)}%`,
        clickable: true
      });
    }

    set((state) => ({
      state: { ...state.state, items }
    }));
  },

  getFileInfo: async (filePath: string, content: string): Promise<FileInfo> => {
    const info = await statusInformationService.getFileInfo(filePath, content);
    
    return {
      path: filePath,
      name: filePath.split('/').pop() || 'Untitled',
      type: info.fileType,
      encoding: info.encoding,
      size: new Blob([content]).size,
      lineCount: info.lineCount,
      isModified: false, // This will be updated by the calling component
      isReadOnly: false // This will be updated by the calling component
    };
  }
})); 
