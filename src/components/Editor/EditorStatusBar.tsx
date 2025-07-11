import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useTabStore } from '../../stores/tabStore';
import { useStatusBarStore, StatusItem } from '../../stores/statusBarStore';
import { ViewOperations } from '../../services/viewOperations';
import { cn } from '../../utils/cn';

interface EditorStatusBarProps {
  language: string;
  isModified: boolean;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  language,
  isModified,
}) => {
  const { editorInstance, settings } = useEditorStore();
  const { activeTabId, tabs } = useTabStore();
  const statusBarStore = useStatusBarStore();
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  // Update file info when active tab changes
  useEffect(() => {
    if (activeTab && activeTab.content !== undefined) {
      statusBarStore.getFileInfo(activeTab.path, activeTab.content).then(fileInfo => {
        statusBarStore.updateFileInfo({
          ...fileInfo,
          isModified: activeTab.isModified || false,
          isReadOnly: false // TODO: Implement read-only detection
        });
      });
    }
  }, [activeTab, statusBarStore]);

  // Update editor state when editor instance changes
  useEffect(() => {
    if (!editorInstance) return;

    const updateEditorState = () => {
      const position = editorInstance.getPosition();
      const selection = editorInstance.getSelection();
      const model = editorInstance.getModel();
      
      if (position && model) {
        const editorState = {
          cursorPosition: {
            line: position.lineNumber,
            column: position.column,
          },
          selection: selection ? {
            start: {
              line: selection.getStartPosition().lineNumber,
              column: selection.getStartPosition().column,
            },
            end: {
              line: selection.getEndPosition().lineNumber,
              column: selection.getEndPosition().column,
            }
          } : null,
          zoomLevel: ViewOperations.getCurrentZoomLevel() / 14, // Normalize to 0-1 range
          indentation: `${settings.tabSize} spaces`,
          language: language
        };

        statusBarStore.updateEditorState(editorState);
      }
    };

    const updatePosition = () => {
      updateEditorState();
    };

    const updateSelection = () => {
      updateEditorState();
    };

    editorInstance.onDidChangeCursorPosition(updatePosition);
    editorInstance.onDidChangeCursorSelection(updateSelection);
    updateEditorState();

    return () => {
      // Cleanup will be handled by Monaco Editor
    };
  }, [editorInstance, language, settings.tabSize, statusBarStore]);

  const handleItemClick = (item: StatusItem) => {
    if (item.clickable) {
      // Focus the editor when clicking on status items
      editorInstance?.focus();
    }
  };

  const handleItemContextMenu = (_item: StatusItem, event: React.MouseEvent) => {
    event.preventDefault();
    // TODO: Implement context menu for status items
  };

  const handleKeyDown = (event: React.KeyboardEvent, item: StatusItem) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleItemClick(item);
        break;
      case 'ArrowRight':
        event.preventDefault();
        // Navigate to next item
        break;
      case 'ArrowLeft':
        event.preventDefault();
        // Navigate to previous item
        break;
    }
  };

  const renderStatusItem = (item: StatusItem) => (
    <div
      key={item.id}
      className={cn(
        'flex items-center space-x-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 transition-colors',
        item.clickable && 'cursor-pointer hover:bg-gray-700',
        focusedItem === item.id && 'bg-gray-700 text-gray-200',
        item.className
      )}
      onClick={() => handleItemClick(item)}
      onContextMenu={(e) => handleItemContextMenu(item, e)}
      onKeyDown={(e) => handleKeyDown(e, item)}
      onFocus={() => setFocusedItem(item.id)}
      onBlur={() => setFocusedItem(null)}
      tabIndex={item.clickable ? 0 : -1}
      role={item.clickable ? 'button' : 'status'}
      aria-label={item.tooltip || `${item.label}: ${item.value}`}
      title={item.tooltip}
    >
      {item.icon && <span className="status-icon">{item.icon}</span>}
      <span className="status-label font-medium">{item.label}:</span>
      <span className="status-value">{item.value}</span>
    </div>
  );

  if (!statusBarStore.state.isVisible) {
    return null;
  }

  return (
    <div 
      className="h-6 bg-vscode-sidebar border-t border-gray-700 flex items-center justify-between px-3 text-xs"
      role="status" 
      aria-live="polite"
    >
      <div className="flex items-center space-x-1">
        {statusBarStore.state.items.map(renderStatusItem)}
      </div>
      
      <div className="flex items-center space-x-1">
        {statusBarStore.state.customItems.map(renderStatusItem)}
        
        {/* Modified indicator */}
        {isModified && (
          <div className="flex items-center space-x-1 px-2 py-1">
            <span className="text-yellow-400">●</span>
            <span className="text-gray-400">Modified</span>
          </div>
        )}
        
                 {/* File path display */}
         {activeTab && (
           <div className="flex items-center space-x-1 px-2 py-1 max-w-64">
             <span className="text-gray-400 truncate" title={activeTab.path}>
               {activeTab.path.split('/').slice(-2).join('/')}
             </span>
           </div>
         )}
      </div>
    </div>
  );
}; 
