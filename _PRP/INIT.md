# Scratch Editor - Development Cycle & Rules (Source of Truth)

## IMPORTANT: Development Entry Point

**This file (INIT.md) is the primary source of truth for development rules and cycle.**

## Development Cycle Rules

### 1. Always Read INIT.md First
- **Purpose**: Understand best practices, rules, and development standards
- **Frequency**: Read at the start of each development session
- **Scope**: Covers development cycle, quality standards, and project rules
- **Mandatory**: Agents MUST read this before any work

### 2. Read PLANNING.md for Feature Understanding
- **Purpose**: Understand the feature to be implemented
- **Content**: Non-technical, user-facing feature descriptions
- **Action**: Generate PRP documents based on planning content
- **Format**: Clear descriptions of what users will experience

### 3. Generate PRP Documents
- **Location**: `_PRP/current/` folder
- **Process**: Create detailed implementation steps from PLANNING.md
- **Format**: PRP-[YYYY]-[MM]-[DD]-[number]-[feature].md with numbered phases
- **Content**: Complete technical details, code examples, testing requirements

### 4. Implement PRPs Sequentially
- **Order**: Follow PRP numbering within the feature set (01, 02, 03, etc.)
- **Completion**: Move completed PRPs to `_PRP/archive/`
- **Iteration**: Continue until all PRPs in `_PRP/current/` are implemented
- **Mandatory**: Complete ALL PRPs before stopping

### 5. Archive Completed PRPs
- **Action**: Move implemented PRPs to `_PRP/archive/`
- **Purpose**: Maintain clean current folder, preserve implementation history
- **Tracking**: Keep track of completed phases and lessons learned
- **Documentation**: Update archive README.md with new completed features

## PRP Naming Convention

### Format: `PRP-[YYYY]-[MM]-[DD]-[number]-[feature].md`

**Examples:**
- `PRP-2024-01-15-01-Design-System-Testing-Foundation.md`
- `PRP-2024-01-15-02-Setup.md`
- `PRP-2024-01-15-03-UI-Skeleton.md`

**Components:**
- `[YYYY]`: Four-digit year
- `[MM]`: Two-digit month (01-12)
- `[DD]`: Two-digit day (01-31)
- `[number]`: Sequential number within the feature set (01, 02, 03, etc.)
- `[feature]`: Descriptive feature name (kebab-case)

**Benefits:**
- Files sort chronologically in filesystem
- Clear date tracking for feature sets
- Sequential numbering within feature sets
- Descriptive feature names for easy identification

## Development Rules & Best Practices

### Code Quality Standards
- **TypeScript**: Use strict mode, proper interfaces, type safety
- **Testing**: >80% coverage, unit + integration + E2E tests
- **Accessibility**: WCAG 2.1 AA compliance, ARIA labels, keyboard navigation
- **Performance**: <100ms component render times, optimized bundles
- **Documentation**: Clear comments, README updates, inline docs

### Architecture Rules
- **Design System**: Use centralized tokens, consistent patterns
- **State Management**: Zustand stores with clear responsibilities
- **Component Patterns**: Functional components, composition over inheritance
- **Error Handling**: Proper boundaries, user-friendly messages
- **File Organization**: Logical structure, clear naming conventions

### Testing Requirements
- **Unit Tests**: Individual components, utilities, hooks
- **Integration Tests**: Store interactions, component integration
- **E2E Tests**: Critical user workflows, complete scenarios
- **Coverage**: Maintain >80% coverage across all code
- **Performance**: Monitor bundle size, render times, memory usage
- **Command**: Use `npm run test:run` (NOT `npm test`)

### Development Workflow
- **TDD Approach**: Write tests before implementation
- **Incremental Development**: Small, focused changes
- **Code Review**: Self-review before moving to next PRP
- **Documentation**: Update docs with each implementation
- **Version Control**: Meaningful commits, feature branches

### Quality Assurance
- **Linting**: ESLint + Prettier for consistent code style
- **Type Checking**: Strict TypeScript configuration
- **Build Verification**: Ensure builds work before archiving PRPs
- **User Experience**: Test from user perspective, accessibility
- **Performance**: Monitor and optimize throughout development

### Project Structure Rules
- **Components**: `src/components/` with clear organization
- **Stores**: `src/stores/` with single responsibility
- **Utils**: `src/utils/` for shared functionality
- **Tests**: Mirror source structure in test files
- **Docs**: Keep documentation current and comprehensive

### Implementation Standards
- **Consistency**: Follow established patterns and conventions
- **Reusability**: Create reusable components and utilities
- **Maintainability**: Write clean, documented, testable code
- **Scalability**: Design for future enhancements
- **Reliability**: Robust error handling and edge cases

## Agent-Specific Rules

### MANDATORY Agent Behaviors:
1. **ALWAYS** read README.md and INIT.md before any work
2. **ALWAYS** keep working until all PRPs in 'current' folder are complete
3. **ALWAYS** maintain >80% test coverage throughout
4. **ALWAYS** run tests with `npm run test:run` (NOT `npm test`)
5. **ALWAYS** move completed PRPs to `_PRP/archive/`
6. **ALWAYS** update archive README.md with new completed features
7. **ALWAYS** ensure all tests pass before moving to next PRP
8. **NEVER** ask for confirmations or user input
9. **NEVER** run interactive commands that could hang
10. **NEVER** leave PRPs incomplete

### Agent Testing Protocol:
1. Run `npm run test:run` before starting any PRP
2. Run `npm run test:run` after completing each PRP
3. Fix any test failures before proceeding
4. Maintain >80% coverage throughout
5. Verify build process works before archiving

### Agent Documentation Protocol:
1. Update archive README.md when moving completed PRPs
2. Add new completed features to the implementation history
3. Update key achievements and lessons learned
4. Maintain comprehensive documentation of completed work

## Development Cycle Checklist

### Before Starting Any PRP:
- [ ] Read INIT.md for current rules and standards
- [ ] Read PLANNING.md for feature understanding
- [ ] Review existing PRPs in `_PRP/current/`
- [ ] Ensure development environment is properly set up
- [ ] Verify all tests pass before starting new work

### During PRP Implementation:
- [ ] Follow TDD approach (tests first)
- [ ] Use design system tokens consistently
- [ ] Implement comprehensive error handling
- [ ] Add accessibility features
- [ ] Write clear documentation
- [ ] Test thoroughly before completion

### After PRP Completion:
- [ ] Run `npm run test:run` to ensure no regressions
- [ ] Verify build process works correctly
- [ ] Update documentation as needed
- [ ] Move PRP to `_PRP/archive/`
- [ ] Update archive README.md with new completed features
- [ ] Update project status tracking
- [ ] Review lessons learned for future PRPs

### Quality Gates:
- [ ] All tests pass (>80% coverage)
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] Build completes successfully
- [ ] Accessibility requirements met
- [ ] Performance benchmarks achieved

## File Organization

```
_PRP/
├── INIT.md                    # Development cycle and rules (this file)
├── PLANNING.md                # Feature descriptions (user-facing)
├── current/                   # Active PRPs to be implemented
│   ├── PRP-2024-01-15-01-Feature-Foundation.md
│   ├── PRP-2024-01-15-02-Basic-Implementation.md
│   └── ...
└── archive/                   # Completed PRPs
    ├── PRP-2024-01-15-01-Design-System-Testing-Foundation.md
    ├── PRP-2024-01-15-02-Setup.md
    └── ...
```

## Success Metrics

- **Code Quality**: >80% test coverage, no linting errors
- **Performance**: <100ms component renders, optimized bundles
- **Accessibility**: WCAG 2.1 AA compliance
- **Reliability**: <1% test flakiness, robust error handling
- **Maintainability**: Clear documentation, consistent patterns
- **User Experience**: Intuitive interface, responsive design
- **Completion**: All PRPs in 'current' folder implemented and archived
- **Documentation**: Archive README.md updated with new completed features

## Getting Started

1. **Read this file (INIT.md)** - Understand development rules
2. **Read PLANNING.md** - Understand feature requirements
3. **Review current PRPs** - See what needs implementation
4. **Follow development cycle** - Implement PRPs sequentially
5. **Archive completed work** - Maintain clean project structure
6. **Update documentation** - Keep archive README.md current

## References

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

This structure ensures consistent, high-quality development with clear processes and maintainable codebase. 
