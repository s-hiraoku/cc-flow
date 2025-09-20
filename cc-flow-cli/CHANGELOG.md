# Changelog

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
