---
name: analyze-code
description: Analyze code quality, patterns, and suggest improvements
tools: [Read, Grep, Write]
argument-hint: <file-or-directory>
allowed-tools: [Read, Grep, Write, Bash]
---

# Code Analysis Tool

Comprehensive code analysis for quality assessment and improvement suggestions.

## Purpose

This command performs deep code analysis including:
- Code quality metrics
- Design pattern detection
- Performance bottlenecks identification
- Security vulnerability scanning
- Best practices compliance

## Usage

```bash
/analyze-code src/
/analyze-code src/components/UserAuth.ts
/analyze-code . --deep
```

## Analysis Areas

1. **Code Quality**
   - Complexity analysis
   - Code duplication detection
   - Naming convention compliance

2. **Architecture Review**
   - Design pattern usage
   - Dependency analysis
   - Module coupling assessment

3. **Performance**
   - Potential performance issues
   - Memory usage patterns
   - Optimization opportunities

4. **Security**
   - Common vulnerability patterns
   - Input validation checks
   - Authentication/authorization review

## Output Format

- Executive summary
- Detailed findings by category
- Prioritized improvement recommendations
- Code examples with suggested fixes