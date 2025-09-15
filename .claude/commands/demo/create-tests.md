---
name: create-tests
description: Generate comprehensive test suites for existing code
tools: [Read, Write, Bash]
argument-hint: <source-file-or-directory> [--framework=jest|vitest|mocha] [--coverage]
allowed-tools: [Read, Write, Bash, Grep]
---

# Test Suite Generator

Automatically generate comprehensive test suites for your code.

## Purpose

Creates thorough test coverage including:
- Unit tests for all functions/methods
- Integration tests for component interactions
- Mock implementations for dependencies
- Edge case and error condition testing

## Usage

```bash
/create-tests src/utils/auth.ts
/create-tests src/components/ --framework=jest --coverage
/create-tests . --framework=vitest
```

## Test Generation Features

### Smart Analysis
- Function signature analysis
- Dependency detection
- Parameter type inference
- Return value prediction

### Test Types
- **Unit Tests**: Individual function testing
- **Integration Tests**: Component interaction testing
- **Edge Cases**: Boundary condition testing
- **Error Handling**: Exception and error path testing

### Framework Support
- Jest (default)
- Vitest
- Mocha + Chai
- Custom framework templates

## Generated Test Structure

```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should authenticate valid credentials', async () => {
      // Test implementation
    });
    
    it('should reject invalid credentials', async () => {
      // Test implementation
    });
    
    it('should handle network errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

## Configuration

Arguments:
- `$ARGUMENTS` - Source file or directory to test
- `--framework` - Testing framework (jest, vitest, mocha)
- `--coverage` - Include coverage configuration
- `--mocks` - Generate mock implementations
- `--integration` - Include integration tests

## Features

- **Automatic Mocking**: Generate mocks for external dependencies
- **Coverage Reports**: Setup coverage thresholds and reporting
- **Async Testing**: Proper handling of promises and async/await
- **Data Fixtures**: Generate test data and fixtures
- **Snapshot Testing**: Create snapshot tests for UI components