# Changelog

## [0.0.13] - 2025-09-20

### Major Improvements
- **Shell Script Usability**: Complete overhaul of `create-workflow.sh` with modern CLI interface
- **Option Parsing**: Added modern flag-based arguments (`--order`, `--purpose`, `--name`, `--quick`)
- **Help System**: Comprehensive help with `--help` and `--examples` commands
- **Shortcut Modes**: Quick workflow creation with `--quick` and `--all` options
- **Backward Compatibility**: Removed legacy positional argument support for cleaner interface

### New Features
- **Modern CLI Options**:
  - `--order "1 2 3"` - Specify agent execution order
  - `--purpose "description"` - Set workflow purpose
  - `--name "custom-name"` - Set custom workflow name
  - `--quick` - Select all agents automatically
  - `--all` - Create workflow with all available agents
- **Enhanced Help**: Detailed usage examples and option descriptions
- **Improved Validation**: Better error handling and user feedback
- **Debug Output**: Comprehensive logging for troubleshooting

### Testing Improvements
- **BATS Test Suite**: Updated all shell script tests for new option format
- **Test Coverage**: Fixed path issues in `create-workflow.bats` and `agent-discovery.bats`
- **Test Reliability**: Improved test setup and teardown procedures
- **Agent Discovery**: Complete test coverage for agent file discovery functionality

### Fixed
- **Argument Parsing**: Resolved complex argument detection and processing issues
- **Path Resolution**: Fixed template and output directory path handling
- **Test Environment**: Corrected test file paths and directory structure
- **Agent Selection**: Improved agent name extraction and validation

### Technical Details
- **Shell Scripting**: Modern bash practices with comprehensive option parsing
- **Error Handling**: Robust error messages with Japanese emoji indicators
- **Code Quality**: Enhanced debugging output and parameter validation
- **Test Infrastructure**: Reliable BATS testing with proper setup/teardown

## [0.0.12] - 2025-09-20

### Fixed
- **UI Layout**: Fixed vertical centering issue - all screens now align to top for better content visibility
- **Welcome Screen**: Removed vertical centering from welcome screen for consistent layout

## [0.0.11] - 2025-09-20

### Major Changes
- **React Ink Migration**: Complete rewrite of CLI interface using React Ink for beautiful terminal UI
- **Interactive TUI**: Replaced command-line prompts with modern terminal user interface
- **Visual Design**: Added colorful ASCII art, responsive layouts, and intuitive navigation
- **Bilingual Support**: Japanese/English UI labels and messages

### New Features
- **Beautiful Welcome Screen**: 3-color ASCII art logo with centering
- **Interactive Menus**: Checkbox-based agent selection with visual feedback
- **Screen-based Navigation**: Clean separation between workflow creation steps
- **Keyboard Shortcuts**: Full keyboard navigation with accessibility support
- **Agent Preview Cards**: Visual agent descriptions with emoji indicators
- **Real-time Validation**: Input validation with helpful error messages

### Technical Improvements
- **React Ink Architecture**: Modern component-based terminal application
- **TypeScript**: Full type safety with strict configuration
- **Testing Suite**: Comprehensive test coverage with Vitest and ink-testing-library
- **Build Pipeline**: Production-ready build with validation
- **Design System**: Reusable UI components and consistent theming

### Fixed
- **Agent Selection Bug**: Fixed "すべてのエージェント" not showing any agents
- **Workflow Generation**: Fixed single agent workflow creation
- **Security**: Updated dependencies to resolve esbuild vulnerabilities
- **TypeScript Configuration**: ES2022 target with proper ESM support

### Dependencies
- **Added**: React 19.1.1, Ink 6.3.0, React Ink ecosystem packages
- **Updated**: Vitest 3.2.4, TypeScript 5.6.0
- **Maintained**: Node.js ≥18.0.0 compatibility
