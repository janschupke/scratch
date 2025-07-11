import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../stores/editorStore';

interface FindReplaceProps {
  isVisible: boolean;
  onClose: () => void;
}

export const FindReplace: React.FC<FindReplaceProps> = ({
  isVisible,
  onClose,
}) => {
  const { editorInstance } = useEditorStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

  useEffect(() => {
    if (searchTerm && editorInstance) {
      findMatches();
    } else {
      clearSearch();
    }
  }, [searchTerm, isCaseSensitive, isRegex, isWholeWord, editorInstance]);

  const findMatches = () => {
    if (!editorInstance || !searchTerm) return;

    const findOptions = {
      caseSensitive: isCaseSensitive,
      wholeWord: isWholeWord,
      useRegularExpressions: isRegex,
    };

    const matches = editorInstance.getModel()?.findMatches(
      searchTerm,
      false, // searchOnlyEditableRange
      findOptions.useRegularExpressions, // isRegex
      findOptions.caseSensitive, // matchCase
      null, // wordSeparators
      false // captureMatches
    ) || [];

    setMatchCount(matches.length);
    setCurrentMatch(matches.length > 0 ? 1 : 0);

    // Highlight matches
    if (matches.length > 0) {
      editorInstance.deltaDecorations([], matches.map(match => ({
        range: match.range,
        options: {
          className: 'find-match-highlight',
          backgroundColor: 'rgba(255, 255, 0, 0.3)',
        },
      })));
    }
  };

  const clearSearch = () => {
    if (editorInstance) {
      editorInstance.deltaDecorations([], []);
    }
    setMatchCount(0);
    setCurrentMatch(0);
  };

  const findNext = () => {
    if (!editorInstance || matchCount === 0) return;

    const matches = editorInstance.getModel()?.findMatches(
      searchTerm,
      false, // searchOnlyEditableRange
      isRegex, // isRegex
      isCaseSensitive, // matchCase
      null, // wordSeparators
      false // captureMatches
    ) || [];

    if (matches.length > 0) {
      const nextIndex = currentMatch % matches.length;
      const match = matches[nextIndex];
      editorInstance.setPosition(match.range.getStartPosition());
      editorInstance.revealPositionInCenter(match.range.getStartPosition());
      setCurrentMatch(nextIndex + 1);
    }
  };

  const findPrevious = () => {
    if (!editorInstance || matchCount === 0) return;

    const matches = editorInstance.getModel()?.findMatches(
      searchTerm,
      false, // searchOnlyEditableRange
      isRegex, // isRegex
      isCaseSensitive, // matchCase
      null, // wordSeparators
      false // captureMatches
    ) || [];

    if (matches.length > 0) {
      const prevIndex = currentMatch <= 1 ? matches.length - 1 : currentMatch - 2;
      const match = matches[prevIndex];
      editorInstance.setPosition(match.range.getStartPosition());
      editorInstance.revealPositionInCenter(match.range.getStartPosition());
      setCurrentMatch(prevIndex + 1);
    }
  };

  const replace = () => {
    if (!editorInstance || matchCount === 0) return;

    const selection = editorInstance.getSelection();
    if (!selection) return;

    const selectedText = editorInstance.getModel()?.getValueInRange(selection);
    if (selectedText === searchTerm) {
      editorInstance.executeEdits('find-replace', [{
        range: selection,
        text: replaceTerm,
      }]);
      findNext();
    }
  };

  const replaceAll = () => {
    if (!editorInstance || matchCount === 0) return;

    const matches = editorInstance.getModel()?.findMatches(
      searchTerm,
      false, // searchOnlyEditableRange
      isRegex, // isRegex
      isCaseSensitive, // matchCase
      null, // wordSeparators
      false // captureMatches
    ) || [];

    if (matches.length > 0) {
      const edits = matches.map(match => ({
        range: match.range,
        text: replaceTerm,
      }));

      editorInstance.executeEdits('find-replace-all', edits);
      clearSearch();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-vscode-sidebar border-t border-gray-700 p-3 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Find"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-1 bg-vscode-bg border border-gray-600 rounded text-sm text-vscode-text"
            autoFocus
          />
          <button
            onClick={findPrevious}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            disabled={matchCount === 0}
          >
            ↑
          </button>
          <button
            onClick={findNext}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            disabled={matchCount === 0}
          >
            ↓
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Replace"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="px-2 py-1 bg-vscode-bg border border-gray-600 rounded text-sm text-vscode-text"
          />
          <button
            onClick={replace}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            disabled={matchCount === 0}
          >
            Replace
          </button>
          <button
            onClick={replaceAll}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            disabled={matchCount === 0}
          >
            Replace All
          </button>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={isCaseSensitive}
              onChange={(e) => setIsCaseSensitive(e.target.checked)}
              className="mr-1"
            />
            <span>Case</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={isRegex}
              onChange={(e) => setIsRegex(e.target.checked)}
              className="mr-1"
            />
            <span>Regex</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={isWholeWord}
              onChange={(e) => setIsWholeWord(e.target.checked)}
              className="mr-1"
            />
            <span>Word</span>
          </label>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400">
          {matchCount > 0 && (
            <span>{currentMatch} of {matchCount} matches</span>
          )}
        </div>

        <button
          onClick={onClose}
          className="ml-auto px-2 py-1 text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  );
}; 
