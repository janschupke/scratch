import React from 'react';
import { TabBar } from './TabBar';

export const Tabs: React.FC = () => {
  return (
    <div className="h-8 bg-vscode-tabs border-b border-gray-700 flex items-center">
      <TabBar />
    </div>
  );
}; 
