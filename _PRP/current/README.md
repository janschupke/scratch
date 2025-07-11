# Current PRPs - Active Implementation

This folder contains PRP (Project Requirements & Planning) documents that are currently being implemented or waiting to be implemented.

## Structure

PRP documents in this folder should follow the naming convention:
- `PRP-[YYYY]-[MM]-[DD]-[number]-[feature].md` where:
  - `[YYYY]`: Four-digit year
  - `[MM]`: Two-digit month (01-12)
  - `[DD]`: Two-digit day (01-31)
  - `[number]`: Sequential number within the feature set (01, 02, 03, etc.)
  - `[feature]`: Descriptive feature name (kebab-case)
- Each PRP should be comprehensive and self-contained
- PRPs should be implemented in numerical order within the feature set

## Example Structure

```
current/
├── README.md                    # This file
├── PRP-2024-01-15-01-Feature-Foundation.md
├── PRP-2024-01-15-02-Basic-Implementation.md
├── PRP-2024-01-15-03-Advanced-Features.md
└── ...
```

## PRP Content Requirements

Each PRP document should contain:

### 1. Overview
- Clear description of what will be implemented
- User-facing benefits and outcomes
- Scope and boundaries

### 2. Functional Requirements
- Detailed feature specifications
- User interaction flows
- Expected behaviors

### 3. Technical Requirements
- Implementation approach
- Code examples and patterns
- Integration points with existing codebase
- Performance considerations

### 4. Testing Requirements
- Unit test specifications
- Integration test requirements
- Coverage targets
- Test scenarios and edge cases

### 5. Non-Functional Requirements
- Performance benchmarks
- Accessibility requirements
- Security considerations
- Error handling strategies

### 6. Implementation Steps
- Detailed step-by-step implementation
- Code examples and references
- Testing checkpoints
- Quality gates

### 7. Risks and Mitigation
- Potential issues and challenges
- Mitigation strategies
- Fallback approaches

## Implementation Process

1. **Read README.md and INIT.md** from the parent folder
2. **Implement PRPs in numerical order** (01, 02, 03, etc.)
3. **Run tests after each PRP** with `npm run test:run`
4. **Build the app** with `npm run tauri build` and fix any errors
5. **Refactor code** if needed to maintain logical structure
6. **Move completed PRPs to archive** when implementation is complete
7. **Update archive README.md** with new completed features
8. **Continue until all PRPs are implemented**

## Quality Standards

- Maintain >80% test coverage
- Ensure all tests pass before moving to next PRP
- **ALWAYS** build the app successfully before marking PRP as completed
- Follow established code patterns and conventions
- Use enums, constants, and abstraction to avoid hardcoding
- Maintain logical code structure and refactor when needed
- Update documentation as needed
- Verify no regressions in existing functionality
- Update archive README.md when moving completed PRPs

## Code Structure Requirements

### Abstraction and Constants
- Use enums for type-safe constants (e.g., `ShortcutCategory`, `FileType`)
- Extract magic numbers and strings into named constants
- Create utility functions for repeated business logic
- Use proper TypeScript interfaces for type safety

### File Organization
- Maintain logical component hierarchy
- Group related functionality in appropriate directories
- Use consistent naming conventions across files
- Refactor when new additions cause structural issues

### Code Quality
- Avoid duplication of business logic
- Extract reusable patterns into shared utilities
- Use proper abstraction layers for complex operations
- Maintain clean, readable code structure

## Naming Convention Benefits

- **Chronological Sorting**: Files sort properly in filesystem
- **Date Tracking**: Clear tracking of when feature sets were created
- **Sequential Ordering**: Easy to follow implementation order
- **Descriptive Names**: Clear identification of feature content
- **Consistent Format**: Standardized naming across all PRPs

This folder should be empty when all features are complete, with all PRPs moved to the `archive/` folder. 
