# CC-Flow Development Commands

## Development
```bash
# Development mode with hot reload
npm run dev

# Type checking without compilation
npm run type-check
npm run lint

# Testing
npm run test           # Run tests once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

## Build and Distribution
```bash
# Clean and compile
npm run clean
npm run compile

# Full build for distribution
npm run build

# Validate before release
npm run validate       # Type check + build

# Test build process
npm run test:build
```

## Running the CLI
```bash
# Local development
npm run dev

# After build
npm start
node dist/cli/main.js

# Installed globally
cc-flow

# Via npx
npx @hiraoku/cc-flow-cli
```

## Project Scripts
```bash
# Set executable permissions
chmod +x scripts/create-workflow.sh

# Direct script usage
./scripts/create-workflow.sh ./agents/spec "1 3 4"

# Convert slash commands
./scripts/convert-slash-commands.sh demo
```

## System Commands (macOS/Darwin)
```bash
# File operations
ls -la                 # List files with details
find . -name "*.ts"    # Find TypeScript files
grep -r "pattern" src/ # Search in source

# Git operations
git status
git add .
git commit -m "message"

# Terminal utilities
clear                  # Clear screen
which node             # Find Node.js path
echo $TERM            # Terminal type
```