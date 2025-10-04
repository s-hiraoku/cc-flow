# CC-Flow Web Editor

Visual workflow editor for CC-Flow with an intuitive drag-and-drop interface.

## Installation

### Option 1: Install from npm (Recommended)

```bash
npm install -g @hiraoku/cc-flow-web
```

### Option 2: Development Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd cc-flow-web
npm install
```

## Usage

### Using the Published Package

Navigate to your `.claude` directory and run:

```bash
cd /path/to/your/project/.claude
cc-flow-web
```

This will:
1. Start the web server on port 3000
2. Automatically open your browser to the editor
3. Use the current directory as the Claude root path
4. Look for `agents/` and `commands/` subdirectories

#### CLI Options

```
-p, --port <port>    Port to run the server on (default: 3000)
--no-open            Do not open browser automatically
-h, --help           Display help
-V, --version        Display version
```

#### Examples

```bash
# Start on custom port
cd /path/to/.claude
cc-flow-web --port 8080

# Start without opening browser
cd /path/to/.claude
cc-flow-web --no-open
```

### Development Mode

For development, create a `.env.local` file with your Claude root path:

```bash
CLAUDE_ROOT_PATH=/path/to/your/project/.claude
```

Then start the development server:

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

## Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev         # Development server with hot reload
npm run build       # Production build
npm run start       # Production server
npm run lint        # ESLint code checking
npm run type-check  # TypeScript type checking
```

## Features

### ✅ Implemented (v0.0.1)
- **Visual Workflow Editor**: ReactFlow-based drag-and-drop canvas with 4 node types (Start, Agent, Step Group, End)
- **Agent Palette**: Search, filter, and drag agents with category-based organization
- **Properties Panel**: Configure settings, view workflow statistics, and preview JSON outputs
- **Real-time Validation**: Automatic error detection with visual indicators and detailed error messages
- **Workflow Persistence**: Save/restore workflows as JSON files with complete state preservation
- **Workflow Generation**: Generate CLI-ready commands with progress tracking and notifications
- **Keyboard Navigation**: Full keyboard accessibility with Tab, Enter, Space, and Escape support
- **Step Group Management**: Sequential and parallel execution modes with agent grouping

### 📋 Planned (Future Versions)
- Workflow templates and presets library
- Advanced graph analysis and optimization suggestions
- Collaboration features and real-time multi-user editing
- Version control integration and change tracking
- External CI/CD system integration

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

## Security

This package implements comprehensive supply chain security measures:

### For Users
- **Provenance Verification**: All releases include npm provenance attestations
- **Dependency Auditing**: Regular security scans with `npm audit`
- **Minimal Dependencies**: Standalone build reduces attack surface

### Verify Package Integrity

```bash
# Check provenance (npm 9+)
npm view @hiraoku/cc-flow-web --json | jq .dist.attestations

# Verify signatures
npm audit signatures
```

### Reporting Security Issues
Please see [SECURITY.md](./SECURITY.md) for details on reporting vulnerabilities.

## License

This project is part of the CC-Flow ecosystem. Please refer to the main repository for licensing information.

---

**Project Status**: Initial Release
**Latest Version**: 0.0.1
**Maintained by**: CC-Flow Development Team
