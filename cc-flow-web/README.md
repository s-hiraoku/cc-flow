# CC-Flow Web Editor

A comprehensive Next.js 15 web application that provides a visual interface for designing and managing complex workflow configurations. Built as a complement to the existing cc-flow CLI ecosystem.

## Project Overview

The CC-Flow Web Editor leverages ReactFlow for visual editing, shadcn/ui for design consistency, and seamless integration with the command-line interface. Currently running on localhost:3002 with functional drag-and-drop workflow creation, agent palette, properties panel, and API integration.

**Current Status**: Phase 1 Complete - Functional web editor with core workflow creation capabilities.

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to access the workflow editor.

### Available Scripts
```bash
npm run dev         # Development server with hot reload
npm run build       # Production build
npm run start       # Production server
npm run lint        # ESLint code checking
npm run type-check  # TypeScript type checking
```

## Features

### ✅ Implemented (Phase 1)
- **Visual Workflow Editor**: ReactFlow-based drag-and-drop interface
- **Agent Management**: Automatic discovery and categorization of agents
- **Real-time Preview**: Live JSON output with immediate validation
- **Properties Panel**: Workflow metadata and configuration editing
- **API Integration**: Backend services for agent discovery and workflow operations

### 🚧 In Development (Phase 2)
- Enhanced validation system with real-time error highlighting
- Step group management for sequential/parallel execution
- Improved user experience with keyboard shortcuts
- Advanced drag-and-drop with visual indicators

### 📋 Planned (Phase 3)
- Workflow templates and presets
- Advanced graph analysis and optimization
- Collaboration features and version control
- Integration with external CI/CD systems

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Visual Editor**: ReactFlow (XyFlow) v12.8.5
- **UI Framework**: shadcn/ui + Radix UI + Tailwind CSS
- **Type System**: TypeScript 5.6
- **State Management**: React 19 built-in state + Custom hooks

## Project Structure

```
cc-flow-web/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   │   ├── workflow-editor/    # Core editor components
│   │   ├── panels/             # UI panels and sections
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Business logic and utilities
│   ├── types/                  # TypeScript type definitions
│   └── hooks/                  # Custom React hooks
├── docs/                       # Project documentation
│   └── specifications/         # Technical specifications
└── public/                     # Static assets
```

## Documentation

### 📚 Complete Documentation Suite
Comprehensive documentation is available in the `/docs` directory:

- **[Documentation Index](./docs/README.md)** - Complete documentation navigation
- **[Development Guide](./docs/development/DEVELOPMENT_GUIDE.md)** - Setup and development workflow  
- **[User Guide](./docs/guides/USER_GUIDE.md)** - End-user documentation
- **[Technical Architecture](./docs/architecture/TECHNICAL_ARCHITECTURE.md)** - System design and components
- **[Testing Guide](./docs/testing/TESTING_GUIDE.md)** - Testing strategy and implementation
- **[Code Standards](./docs/development/CODE_STANDARDS.md)** - Coding conventions and best practices

### 🎯 Quick Navigation by Role
- **New Users**: [User Guide](./docs/guides/USER_GUIDE.md)
- **Developers**: [Development Guide](./docs/development/DEVELOPMENT_GUIDE.md)
- **Architects**: [Technical Architecture](./docs/architecture/TECHNICAL_ARCHITECTURE.md)
- **Testers**: [Testing Guide](./docs/testing/TESTING_GUIDE.md)
- **Contributors**: [Code Standards](./docs/development/CODE_STANDARDS.md)

## Integration with CC-Flow CLI

This web editor is designed to work seamlessly with the existing cc-flow CLI ecosystem:

- **Agent Discovery**: Automatically scans `.claude/agents/` directory
- **Workflow Compatibility**: Generates JSON compatible with cc-flow CLI execution
- **Launch Integration**: Can be launched directly from cc-flow CLI
- **Bidirectional Sync**: Workflows work seamlessly between web and CLI interfaces

## Contributing

### Development Workflow
1. Review [Development Guide](./docs/development/DEVELOPMENT_GUIDE.md) for setup and workflow
2. Check [Technical Architecture](./docs/architecture/TECHNICAL_ARCHITECTURE.md) for system design
3. Follow [Code Standards](./docs/development/CODE_STANDARDS.md) for consistency
4. Use [Testing Guide](./docs/testing/TESTING_GUIDE.md) for quality assurance
5. Maintain compatibility with cc-flow CLI ecosystem

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types in production
- **ESLint**: Configured for React and TypeScript best practices
- **Prettier**: Consistent code formatting
- **Accessibility**: WCAG 2.1 AA compliance for interactive elements

## License

This project is part of the CC-Flow ecosystem. Please refer to the main repository for licensing information.

---

**Project Status**: Phase 1 Complete, Phase 2 In Progress
**Latest Version**: 1.0
**Maintained by**: CC-Flow Development Team
