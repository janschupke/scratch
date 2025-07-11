import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen bg-vscode-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-vscode-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-vscode-text text-lg">Loading...</p>
      </div>
    </div>
  );
}; 
