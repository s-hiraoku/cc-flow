---
description: Example of a fully compatible slash command
argument-hint: <project-path>
allowed-tools: [Read, Glob, Write]
---

# compatible-example

This is an example of a slash command that converts perfectly to an agent.

## Features
- Uses only agent-compatible tools
- No direct bash execution
- No system commands
- Pure documentation and file processing

## How it works
1. Scans the project directory for documentation files
2. Analyzes the structure and content
3. Generates a summary report
4. Outputs results in markdown format

## Usage
```
/compatible-example ./my-project
```

This type of command translates seamlessly to agent format because it:
- ✅ Uses standard tools (Read, Glob, Write)
- ✅ Processes text and files
- ✅ Has clear, declarative functionality
- ✅ No system dependencies