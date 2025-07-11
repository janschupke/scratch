import React from 'react';
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
  const { fileTree, openFile } = useFileStore();
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
                <span className="text-gray-400">▼</span>
              ) : (
                <span className="text-gray-400">▶</span>
              )}
            </div>
          )}
          {!hasChildren && <div className="w-5" />}
          
          {node.type === 'folder' ? (
            <span className="text-blue-400 mr-2">📁</span>
          ) : (
            <span className="text-gray-400 mr-2">📄</span>
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
