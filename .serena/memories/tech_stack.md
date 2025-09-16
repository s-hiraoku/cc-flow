# CC-Flow Tech Stack

## Core Technologies
- **TypeScript** - Primary development language with ESNext/ES2022 target
- **Node.js** - Runtime environment (minimum version 18.0.0)
- **npm** - Package management and distribution

## UI/TUI Libraries
- **@inquirer/checkbox** - Interactive checkbox selections
- **@inquirer/input** - Text input prompts
- **@inquirer/prompts** - Core prompt system
- **@inquirer/select** - Selection menus
- **boxen** - Terminal box drawing
- **chalk** - Terminal colors and styling
- **figlet** - ASCII art text generation

## Development Tools
- **tsx** - TypeScript execution for development
- **vitest** - Testing framework with coverage support
- **TypeScript 5.6** - Type checking and compilation

## Project Structure
- `src/` - TypeScript source code
  - `ui/` - TUI components, screens, themes
  - `core/` - Business logic and workflow creation
  - `services/` - External service integrations
  - `cli/` - Command-line interface entry points
- `scripts/` - Build and utility scripts
- `templates/` - POML workflow templates
- `bin/` - Executable scripts
- `dist/` - Compiled JavaScript output

## Module System
- ESModules with .js imports
- TypeScript compilation target: ES2022
- Module resolution: Node.js style