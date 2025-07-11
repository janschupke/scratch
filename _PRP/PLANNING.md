# Scratch Editor - Feature Planning (User-Facing Descriptions)

## Project Overview

Scratch is a modern, lightweight, and efficient desktop text/code editor for macOS, inspired by VS Code. This document contains user-facing feature descriptions that focus on what users will experience, not technical implementation details.

## Core User Features

### 1. Folder Management
**User Experience**: Users can open and browse folders from their computer
- Users can select a folder from their file system
- Users see a tree view of the folder structure in the left sidebar
- Users can expand/collapse folders to navigate the structure
- Users can see file names and folder names clearly organized

### 2. File Editing with Tabs
**User Experience**: Users can open and edit multiple files simultaneously
- Users can open files by clicking on them in the sidebar
- Users see open files as tabs at the top of the editor
- Users can switch between files by clicking on different tabs
- Users can close tabs when they're done with a file
- Users can reorder tabs by dragging them
- Users can pin important tabs to keep them open

### 3. Code Editing Experience
**User Experience**: Users get a professional code editing experience
- Users see syntax highlighting for different programming languages
- Users get automatic indentation and code formatting
- Users can edit code with a familiar interface similar to VS Code
- Users see line numbers and can navigate easily
- Users get word wrap and other text editing features

### 4. State Persistence
**User Experience**: The app remembers user's work between sessions
- Users can close the app and reopen it to find their work exactly as they left it
- Users see the same folders, files, and tabs they had open
- Users don't lose their work or have to reopen everything manually
- Users can rely on the app to maintain their workspace

### 5. Visual Design
**User Experience**: Users see a clean, professional dark theme
- Users see a dark interface that's easy on the eyes
- Users get a consistent, modern design similar to popular code editors
- Users can focus on their code without visual distractions
- Users get clear visual feedback for their actions

### 6. Performance
**User Experience**: Users get a fast, responsive editing experience
- Users can open the app quickly without waiting
- Users can switch between files instantly
- Users can edit large files without lag
- Users get a smooth, responsive interface

### 7. Accessibility
**User Experience**: Users with different needs can use the app effectively
- Users can navigate with keyboard shortcuts
- Users with screen readers can use the app
- Users can adjust settings to meet their needs
- Users get clear visual and audio feedback

## New Features to Implement

### 8. Complete State Persistence
**User Experience**: Users get a fully persistent workspace that remembers everything
- Users can close and reopen the app to find their window exactly where they left it
- Users see the same window size and position they had before
- Users find their opened folder still selected in the sidebar
- Users see all their previously opened tabs still available
- Users can continue editing exactly where they left off in each file
- Users don't lose their cursor position or scroll position in any file

### 9. Universal File Support
**User Experience**: Users can open any file type that contains readable text
- Users can click on any file in the sidebar and it opens immediately
- Users can open configuration files like .gitignore, .env, .json files
- Users can open documentation files like README.md, CHANGELOG.md
- Users can open any text-based file regardless of extension
- Users get helpful error messages only for truly non-text files
- Users can edit any file that contains readable text content

### 10. Standard Desktop Menu
**User Experience**: Users get familiar desktop application controls
- Users see a standard menu bar with File, Edit, View, and Help menus
- Users can create new files through the File menu
- Users can open existing files through the File menu
- Users can open folders through the File menu
- Users can save files through the File menu
- Users can exit the application through the File menu
- Users get a familiar desktop application experience

### 11. Keyboard Shortcuts
**User Experience**: Users can work efficiently with keyboard shortcuts
- Users can create new files with Cmd+N
- Users can open files with Cmd+O
- Users can open folders with Cmd+Shift+O
- Users can save files with Cmd+S
- Users can exit the app with Cmd+Q
- Users can switch between tabs with Cmd+1, Cmd+2, etc.
- Users can close tabs with Cmd+W
- Users get standard shortcuts that work like other macOS apps

## User Workflows

### Opening and Editing Files
1. User opens the Scratch editor
2. User clicks "Open Folder" or selects a folder
3. User sees the folder structure in the sidebar
4. User clicks on a file to open it
5. User sees the file content in the editor with syntax highlighting
6. User can edit the file and see changes immediately
7. User can open more files as tabs

### Managing Multiple Files
1. User has multiple files open as tabs
2. User can click between tabs to switch files
3. User can drag tabs to reorder them
4. User can close tabs when done
5. User can pin important tabs to keep them open
6. User can see which files have unsaved changes

### Persistent Workspace
1. User sets up their workspace with folders and files
2. User positions the window where they want it
3. User opens several files and positions cursors in each
4. User closes the app
5. User reopens the app later
6. User sees the same workspace exactly as they left it
7. User can continue working immediately from where they stopped

### Universal File Access
1. User opens a project folder
2. User sees all files in the sidebar, including .gitignore, README.md, etc.
3. User clicks on any file and it opens immediately
4. User can edit configuration files, documentation, and any text files
5. User gets helpful feedback only for non-text files

### Desktop Application Experience
1. User sees a standard menu bar at the top
2. User can use File menu to create new files
3. User can use File menu to open existing files
4. User can use File menu to open folders
5. User can use File menu to save files
6. User can use keyboard shortcuts for all common actions
7. User gets a familiar desktop application experience

## User Interface Elements

### Sidebar
- Shows folder structure as a tree
- Allows expanding/collapsing folders
- Shows file icons and names
- Provides clear navigation
- Opens any file with a single click

### Tab Bar
- Shows open files as tabs
- Allows switching between files
- Shows which files have unsaved changes
- Allows closing and reordering tabs

### Editor Area
- Shows file content with syntax highlighting
- Provides familiar text editing features
- Shows line numbers and rulers
- Supports code formatting and indentation
- Remembers cursor position and scroll state

### Menu Bar
- Standard File, Edit, View, and Help menus
- Common desktop application controls
- Keyboard shortcuts for all actions
- Familiar macOS application experience

### Status Bar
- Shows current file information
- Shows language and encoding
- Shows cursor position
- Provides file status indicators

## User Expectations

### Performance
- App opens quickly (< 2 seconds)
- File switching is instant
- Large files load without lag
- Smooth scrolling and editing

### Reliability
- No data loss when closing/reopening
- Files save automatically
- Error messages are clear and helpful
- App doesn't crash during normal use
- Window position and size are preserved
- All open files and tabs are restored

### Usability
- Interface is intuitive and familiar
- Keyboard shortcuts work as expected
- Visual feedback is clear and immediate
- Settings are easy to find and adjust
- Any text file can be opened
- Single click opens files in sidebar

### Accessibility
- Works with screen readers
- Supports keyboard navigation
- Provides clear visual feedback
- Respects system accessibility settings

## Success Criteria

### User Satisfaction
- Users can open and edit files without confusion
- Users find the interface familiar and intuitive
- Users can work efficiently without interruptions
- Users trust the app to preserve their work
- Users can open any text file without restrictions
- Users get a standard desktop application experience

### Performance Metrics
- App startup time < 2 seconds
- File switching time < 100ms
- Memory usage stays reasonable
- No lag during typing or scrolling

### Reliability Metrics
- No data loss during normal use
- App handles errors gracefully
- Files save reliably
- State persists correctly between sessions
- Window position and size are preserved
- All open files and tabs are restored

This planning document focuses on what users will experience and achieve, providing clear guidance for implementing features that meet user needs and expectations.
