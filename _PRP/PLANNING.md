# Planning Document

## Critical Issues (High Priority)

### File System & Editor Functionality
- **Fix folder opening error**: Users encounter a React error (#310) when trying to open folders, preventing any file editing functionality
- **Create comprehensive test suite**: Implement tests to verify that folders and files can be opened and edited properly

### Application Behavior
- **Fix Cmd+Q on Mac**: The application currently hijacks Cmd+Q, preventing users from quitting the app normally. System hotkeys should remain functional
- **Update hotkey notation**: Current hotkey display shows "Ctrl + letter" but should show "Cmd + letter" on Mac by default

## UI/UX Improvements (Medium Priority)

### Editor Interface
- **Add status bar**: Implement a status bar at the bottom of the editor to show current file information, cursor position, and other relevant details
- **Add find/replace interface**: Create an expandable find/replace UI at the bottom of the editor for text search and replacement functionality

### Menu System
- **Remove irrelevant menu items**: Remove the "Check for Updates" menu item as it's not relevant to the application
- **Connect menu actions**: Currently menu items do nothing - hook them up to appropriate functionality (File > Open, Edit > Copy/Paste, etc.)

## User Experience Focus

All improvements should prioritize what users will experience:
- Smooth file opening and editing workflow
- Intuitive keyboard shortcuts that work as expected
- Clear visual feedback through status indicators
- Functional menu system for common operations
- Proper application behavior that doesn't interfere with system shortcuts

## Success Criteria

- Users can open folders without errors
- Users can open and edit files successfully
- Cmd+Q properly quits the application on Mac
- Hotkey display matches the actual key combinations for the platform
- Status bar provides useful information about current file/editor state
- Find/replace functionality is easily accessible
- Menu items perform their expected functions
- All functionality is thoroughly tested
