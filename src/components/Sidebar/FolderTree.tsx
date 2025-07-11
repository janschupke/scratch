import React from 'react';
import { FileNode } from '../../types';
import { useFileStore } from '../../stores/fileStore';
import { FileSystemManager } from '../../utils/fileSystem';
import { FileTypeDetector } from '../../utils/fileDetection';

interface FolderTreeProps {
  nodes?: FileNode[];
  level?: number;
}

interface FileNodeProps {
  node: FileNode;
  onToggle: (node: FileNode) => Promise<void>;
  onOpenFile: (path: string) => Promise<void>;
}

const FileNodeComponent: React.FC<FileNodeProps> = ({ node, onToggle, onOpenFile }) => {
  const [fileInfo, setFileInfo] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (node.type === 'file') {
      let isMounted = true;
      FileTypeDetector.detectFileType(node.path)
        .then(info => {
          if (isMounted) {
            setFileInfo(info);
          }
        })
        .catch(() => {
          if (isMounted) {
            setFileInfo(null);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [node.path, node.type]);

  const handleClick = async () => {
    if (node.type === 'file') {
      if (fileInfo && fileInfo.isText) {
        await onOpenFile(node.path);
      }
    } else {
      setIsLoading(true);
      try {
        await onToggle(node);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isFile = node.type === 'file';

  return (
    <div className="flex items-center px-2 py-1 cursor-pointer group hover:bg-vscode-accent/10">
      {isLoading && (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
      )}
      {isFile ? (
        <>
          <span
            className={`flex-1 truncate ${fileInfo && !fileInfo.isText ? 'text-gray-400' : ''}`}
            title={fileInfo && !fileInfo.isText ? 'Binary file - cannot open' : node.name}
            onClick={handleClick}
          >
            {node.name}
          </span>
          {fileInfo && !fileInfo.isText && (
            <span className="ml-2 px-2 py-0.5 bg-gray-500 text-white text-xs rounded">Binary</span>
          )}
        </>
      ) : (
        <span className="flex-1 truncate" onClick={handleClick}>{node.name}</span>
      )}
    </div>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = () => {
  const { fileTree, openFile, error, isLoading } = useFileStore();
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  const toggleNode = async (node: FileNode) => {
    if (node.type !== 'folder') {
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
          newExpanded.add(node.id);
          setExpandedNodes(newExpanded);
        } catch (error) {
          console.error('Error loading folder contents:', error);
        }
      } else {
        newExpanded.add(node.id);
        setExpandedNodes(newExpanded);
      }
    }
  };

  const renderNode = (node: FileNode) => {
    return (
      <FileNodeComponent
        key={node.id}
        node={node}
        onToggle={toggleNode}
        onOpenFile={openFile}
      />
    );
  };

  const renderNodeWithChildren = (node: FileNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const isFolder = node.type === 'folder';

    return (
      <div key={node.id}>
        {renderNode(node)}
        {isFolder && isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map(child => renderNodeWithChildren(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="folder-tree">
      {error && <div className="text-red-600 p-2">{error}</div>}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600">Loading folder...</span>
        </div>
      )}
      {fileTree.map(renderNodeWithChildren)}
    </div>
  );
}; 
