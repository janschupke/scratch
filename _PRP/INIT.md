# Project Overview: Scratch - Custom Desktop Text Editor

## IMPORTANT: Implementation Entry Point

**This file (INIT.md) is the primary entry point for implementing the Scratch editor project.**

### Usage Instructions for Agents:
1. **Read this file first** - Understand the project goals, requirements, and approach
2. **Reference specific PRP files** - Use the file references below to get detailed implementation steps
3. **Follow the implementation sequence** - Start with PRP-00 and proceed sequentially
4. **Re-read this file** - Review this file at the start of each new implementation phase
5. **Check for updates** - This file may be updated as the project evolves

### File References for Implementation Details:

#### Reference Documents (Read First):
- **PRP-REF-UI-Testing-Analysis.md** - Unified UI/styling and testing strategy
- **PRP-Implementation-Sequence.md** - Detailed implementation order and guidelines

#### Implementation Documents (Execute Sequentially):
- **PRP-00-Design-System-Testing-Foundation.md** - Foundation (design system, testing infrastructure)
- **PRP-01-Setup.md** - Project setup (Vite, Tauri, dependencies)
- **PRP-02-UI-Skeleton.md** - Basic UI layout and components
- **PRP-03-Folder-File-Handling.md** - File system implementation
- **PRP-04-Tabs.md** - Tab management system
- **PRP-05-Editor.md** - Monaco Editor integration
- **PRP-06-State-Persistence.md** - State management and persistence
- **PRP-07-Packaging.md** - macOS packaging and distribution
- **PRP-08-Architecture-Consolidation.md** - Final architecture optimization

#### Supporting Documents (Reference as needed):
- **File-Structure-Summary.md** - Complete file organization overview
- **Implementation-Plan-Summary.md** - Comprehensive implementation strategy

## General Goals
- Build a lightweight, efficient, and modern desktop text/code editor for macOS.
- Use React + TypeScript for the frontend and Tauri for native desktop integration and packaging.
- Ensure the app is resource-efficient, fast, and easy to maintain.
- Leverage your experience as a frontend engineer with JavaScript/TypeScript.

## Core Requirements

### 1. Open Folders
- User can select and open a folder from the filesystem.
- Left sidebar displays the folder structure as a tree view, similar to VS Code.

### 2. Multiple Tabs
- Users can open multiple files in tabs.
- Tabs can be switched, closed, and reordered.

### 3. State Persistence
- The app remembers open folders, files, tabs, and window state on close.
- On restart, the previous state is restored automatically.

### 4. Dark Theme
- The app uses a default dark theme, visually similar to VS Code.
- (Optional) Allow toggling between dark and light themes.

### 5. Lightweight & Efficient
- Minimal dependencies, fast startup, and low memory usage.
- Avoid unnecessary features to keep the app focused and performant.

### 6. Syntax Highlighting & Indentation
- Automatic code highlighting and indentation for recognized source code files.
- Use Monaco Editor for code editing, supporting multiple languages.

### 7. macOS Packaging
- Build as a native .app for macOS using Tauri.
- Automate packaging and (optionally) signing/notarization for distribution.

### 8. Comprehensive Testing
- Implement thorough automated testing at all levels.
- Maintain high test coverage and code quality.
- Ensure reliable and maintainable codebase.

## Tech Stack
- **Frontend:** React, TypeScript, Monaco Editor, Tailwind CSS
- **Desktop Integration:** Tauri (Rust backend)
- **State Management:** Zustand
- **Filesystem:** Tauri APIs
- **Packaging:** Tauri build system, (optional) GitHub Actions for CI/CD
- **Testing:** Vitest, React Testing Library, MSW (Mock Service Worker)
- **Code Quality:** ESLint, Prettier, TypeScript strict mode

## UI/Styling Strategy

### Design System
- **Theme:** VS Code-inspired dark theme with consistent color palette
- **Styling:** Tailwind CSS with custom design tokens
- **Components:** Reusable component library with consistent patterns
- **Layout:** Responsive design with proper accessibility

### Color Palette
```css
/* VS Code Dark Theme Colors */
--vscode-bg: #1e1e1e;
--vscode-sidebar: #252526;
--vscode-tabs: #2d2d30;
--vscode-text: #cccccc;
--vscode-accent: #007acc;
--vscode-error: #f48771;
--vscode-warning: #cca700;
--vscode-success: #89d185;
```

### Component Architecture
- **Atomic Design:** Atoms → Molecules → Organisms → Templates → Pages
- **Consistent Patterns:** Standardized prop interfaces and styling
- **Accessibility:** ARIA labels, keyboard navigation, screen reader support
- **Performance:** Optimized rendering with React.memo and virtualization

## Testing Strategy

### Testing Pyramid
1. **Unit Tests (70%):** Individual functions, components, utilities
2. **Integration Tests (20%):** Store interactions, API calls, component integration
3. **E2E Tests (10%):** Complete user workflows, critical paths

### Testing Tools
- **Vitest:** Fast unit testing with TypeScript support
- **React Testing Library:** Component testing with user-centric approach
- **MSW:** API mocking for integration tests
- **Playwright:** E2E testing for critical user flows
- **Coverage:** Istanbul for code coverage reporting

### Testing Standards
- **Coverage Threshold:** 80% minimum coverage
- **Test Organization:** Mirror source code structure
- **Naming Convention:** `*.test.ts` for unit tests, `*.spec.ts` for integration
- **Mock Strategy:** Comprehensive mocking of external dependencies

## Implementation Approach

### Phase-Based Development
- Follow an iterative, PRP-driven development process.
- Start with PRP-00 (Design System & Testing Foundation) to establish standards.
- Each subsequent PRP file defines a focused phase with clear goals and steps.
- Implement testing alongside feature development (TDD approach).
- Use this INIT.md as a reference context for all implementation work.

### Quality Standards
- **Code Coverage:** >80% for unit tests
- **Accessibility:** WCAG 2.1 AA compliance
- **Performance:** <100ms component render time
- **Reliability:** <1% test flakiness
- **Maintainability:** Consistent code patterns

### Implementation Checklist for Each Phase:
- [ ] Review PRP-REF-UI-Testing-Analysis.md for standards
- [ ] Use design system tokens consistently
- [ ] Follow established component patterns
- [ ] Implement comprehensive tests (>80% coverage)
- [ ] Add accessibility features
- [ ] Test error handling scenarios
- [ ] Verify performance requirements
- [ ] Document any deviations from standards

## Getting Started

### For New Implementation:
1. **Read this file (INIT.md)** - Understand project goals and approach
2. **Review PRP-REF-UI-Testing-Analysis.md** - Understand unified approach
3. **Start with PRP-00** - Implement design system and testing foundation
4. **Follow PRP-Implementation-Sequence.md** - Execute phases sequentially
5. **Reference specific PRP files** - Get detailed implementation steps

### For Continuing Implementation:
1. **Re-read this file** - Refresh understanding of project goals
2. **Check current phase** - Identify which PRP to implement next
3. **Review PRP-REF-UI-Testing-Analysis.md** - Ensure standards compliance
4. **Implement current PRP** - Follow detailed implementation steps
5. **Update progress** - Document completion and move to next phase

## References
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [VS Code source](https://github.com/microsoft/vscode)
- [Tauri + Monaco Example](https://github.com/tauri-apps/tauri/discussions/3912)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Project Status Tracking

### Completed Phases:
- [ ] PRP-00: Design System & Testing Foundation
- [ ] PRP-01: Project Setup
- [ ] PRP-02: UI Skeleton
- [ ] PRP-03: Folder & File Handling
- [ ] PRP-04: Tab Management
- [ ] PRP-05: Editor Integration
- [ ] PRP-06: State Persistence
- [ ] PRP-07: Packaging & Distribution
- [ ] PRP-08: Architecture Consolidation

### Current Focus:
- Start with PRP-00 to establish foundation
- Follow sequential implementation order
- Maintain quality standards throughout
- Document progress and lessons learned
