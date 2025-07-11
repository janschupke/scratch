import React from 'react';
import { FileNode } from '../../types';
import { useFileStore } from '../../stores/fileStore';
import { FileSystemManager } from '../../utils/fileSystem';
import { FileTypeDetector } from '../../utils/fileDetection';

interface FolderTreeProps {
  nodes?: FileNode[];
  level?: number;
}

export const FolderTree: React.FC<FolderTreeProps> = () => {
  const { fileTree, openFile, error } = useFileStore();
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

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
        try {
          const fileSystem = FileSystemManager.getInstance();
          const children = await fileSystem.readDirectory(node.path);
          node.children = children;
        } catch (error) {
          console.error('Error loading folder contents:', error);
        }
      }
      newExpanded.add(node.id);
      setExpandedNodes(newExpanded);
    }
  };

  const renderNode = (node: FileNode) => {
    const isFile = node.type === 'file';
    const [fileInfo, setFileInfo] = React.useState<any>(null);
    React.useEffect(() => {
      if (isFile) {
        FileTypeDetector.detectFileType(node.path).then(setFileInfo).catch(() => setFileInfo(null));
      }
    }, [node.path]);
    return (
      <div key={node.id} className="flex items-center px-2 py-1 cursor-pointer group hover:bg-vscode-accent/10">
        {isFile ? (
          <>
            <span
              className={`flex-1 truncate ${fileInfo && !fileInfo.isText ? 'text-gray-400' : ''}`}
              title={fileInfo && !fileInfo.isText ? 'Binary file - cannot open' : node.name}
              onClick={() => fileInfo && fileInfo.isText && openFile(node.path)}
            >
              {node.name}
            </span>
            {fileInfo && !fileInfo.isText && (
              <span className="ml-2 px-2 py-0.5 bg-gray-500 text-white text-xs rounded">Binary</span>
            )}
          </>
        ) : (
          <span className="flex-1 truncate" onClick={() => toggleNode(node)}>{node.name}</span>
        )}
      </div>
    );
  };

  return (
    <div className="folder-tree">
      {error && <div className="text-red-600 p-2">{error}</div>}
      {fileTree.map(renderNode)}
    </div>
  );
}; 
