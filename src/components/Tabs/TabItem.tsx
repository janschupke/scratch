import React from 'react';
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
        <span className="mr-1 text-blue-400">📌</span>
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
          {tab.isPinned ? '📌' : '📍'}
        </button>
        
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-600 rounded"
        >
          ✕
        </button>
      </div>
    </div>
  );
}; 
