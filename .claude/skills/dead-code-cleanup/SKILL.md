# dead-code-cleanup

```yaml
name: dead-code-cleanup
description: Identify and remove unused code from TypeScript/React files
model: haiku
```

Analyze provided files for dead code and unused exports:

## Unused Imports
- Imports that are never referenced in the file
- Redundant imports (same thing imported twice)
- Unused type imports (should use `import type`)

## Unused Exports
- Named exports that aren't imported in the codebase
- Unused function declarations
- Unused component exports
- Unused type/interface exports

## Unused Variables
- Variables declared but never referenced
- Function parameters that aren't used
- Loop variables in unused iterations

## Dead Branches
- Unreachable code after return statements
- Dead branches in if/switch statements
- Try/catch blocks with empty handlers

## Commented Code
- Code left in comments that can be safely deleted
- Old implementations or debug code

## Redundant Code
- Duplicate logic that could be consolidated
- Multiple similar functions that could be unified

## Circular Dependencies
- Import cycles that could be refactored

## Output Format
```
## Unused Imports
- [File]: [Import names]

## Unused Variables
- [File:Line]: [Variable name]

## Unused Functions/Components
- [File]: [Name] - [Why unused]

## Commented Code
- [File:Line-Line]: [Preview]

## Summary
- Removed: [X] unused imports, [X] unused variables, [X] unused exports, [X] lines of commented code
```
