# CC-Flow Web Editor - Project Specification

## Executive Summary

The CC-Flow Web Editor is a comprehensive Next.js 15 web application that provides a visual interface for designing and managing complex workflow configurations. Built as a complement to the existing cc-flow CLI ecosystem, this application leverages ReactFlow for visual editing, shadcn/ui for design consistency, and seamless integration with the command-line interface.

**Current Status**: Phase 1 Complete - Functional web editor running on localhost:3002 with drag-and-drop workflow creation, agent palette, properties panel, and API integration.

## Project Overview

### Vision Statement
To provide an intuitive, browser-based visual interface that makes workflow creation accessible to users regardless of their command-line expertise, while maintaining full compatibility with the existing cc-flow CLI ecosystem.

### Key Objectives
1. **Visual Workflow Design**: Enable drag-and-drop workflow creation with real-time feedback
2. **Seamless CLI Integration**: Maintain compatibility with existing cc-flow CLI workflows and patterns
3. **Enhanced User Experience**: Provide immediate visual feedback and validation
4. **Developer Productivity**: Reduce time from workflow concept to implementation
5. **Accessibility**: Make complex workflow creation accessible to non-technical users

## Technical Architecture

### Technology Stack
- **Frontend Framework**: Next.js 15 with App Router
- **Visual Editor**: ReactFlow (XyFlow) v12.8.5
- **UI Framework**: shadcn/ui + Radix UI + Tailwind CSS
- **Type System**: TypeScript 5.6
- **State Management**: React 19 built-in state + Custom hooks
- **Development Tools**: ESLint, Prettier, Vitest

### System Architecture
```mermaid
graph TB
    subgraph "cc-flow CLI Ecosystem"
        CLI[cc-flow CLI] --> WEB[Web Editor Launch]
        CLI --> AGENTS[Agent Discovery]
    end

    subgraph "Next.js 15 Application"
        WEB --> BROWSER[Browser Instance]
        BROWSER --> FRONTEND[Frontend Layer]

        subgraph "Frontend Layer"
            FRONTEND --> CANVAS[ReactFlow Canvas]
            FRONTEND --> PALETTE[Agent Palette]
            FRONTEND --> PROPS[Properties Panel]
            FRONTEND --> TOOLBAR[Toolbar & Controls]
        end

        subgraph "Application Layer"
            CANVAS --> STATE[State Management]
            PALETTE --> STATE
            PROPS --> STATE
            STATE --> VALIDATION[Validation Engine]
            STATE --> CONVERTER[Workflow Converter]
        end

        subgraph "API Layer"
            STATE --> AGENTAPI[/api/agents]
            STATE --> WORKFLOWAPI[/api/workflows]
            AGENTAPI --> FS[File System]
            WORKFLOWAPI --> FS
        end
    end

    subgraph "File System"
        FS --> AGENTFILES[.claude/agents/**/*.md]
        FS --> WORKFLOWFILES[workflows/*.json]
    end
```

## Core Features and Functionality

### 1. Visual Workflow Editor
- **ReactFlow Canvas**: Interactive drag-and-drop interface for workflow design
- **Node Types**: Support for agent nodes, step groups, start/end nodes
- **Edge Connections**: Visual representation of workflow dependencies
- **Real-time Preview**: Live JSON output with immediate validation feedback

### 2. Agent Management
- **Agent Discovery**: Automatic scanning of `.claude/agents/` directory
- **Category Organization**: Agents grouped by directory structure
- **Search and Filter**: Quick access to specific agents
- **Drag-and-Drop Integration**: Direct placement onto workflow canvas

### 3. Workflow Configuration
- **Metadata Management**: Workflow name, purpose, model selection, and argument hints
- **Step Organization**: Sequential and parallel execution mode support
- **Validation System**: Real-time error detection and user feedback
- **Export Capabilities**: JSON output compatible with cc-flow CLI

### 4. User Interface
- **Responsive Design**: Optimal experience across different screen sizes
- **Accessibility**: WCAG 2.1 compliance for interactive elements
- **Theme Support**: Consistent design system with shadcn/ui components
- **Keyboard Navigation**: Full keyboard accessibility for workflow editing

## Implementation Status

### Phase 1: Foundation (✅ Complete)
- [x] Next.js 15 application setup with TypeScript
- [x] ReactFlow integration for visual editing
- [x] Basic component structure (Canvas, AgentPalette, PropertiesPanel)
- [x] API routes for agent discovery and workflow operations
- [x] Real-time JSON preview and model selection
- [x] Basic drag-and-drop functionality

### Phase 2: Enhanced Functionality (🚧 In Progress)
- [ ] Workflow execution integration
- [ ] Advanced validation system
- [ ] Step group management
- [ ] Keyboard shortcuts and improved UX
- [ ] Enhanced drag-and-drop with visual indicators

### Phase 3: Advanced Features (📋 Planned)
- [ ] Workflow templates and presets
- [ ] Advanced graph analysis and optimization suggestions
- [ ] Collaboration features (comments, versioning)
- [ ] Integration with external systems (GitHub Actions, CI/CD)

## Requirements and User Stories

### Core User Requirements
1. **REQ-001**: Visual workflow editor with ReactFlow canvas
2. **REQ-002**: Agent palette with drag-and-drop functionality
3. **REQ-003**: Properties panel for workflow metadata editing
4. **REQ-004**: Real-time JSON preview and validation
5. **REQ-005**: File system integration for agent discovery
6. **REQ-006**: Workflow saving and loading capabilities

### User Stories
- **US-001**: As a workflow designer, I want to visually create workflows by dragging agents onto a canvas
- **US-002**: As a developer, I want real-time feedback when building complex workflows
- **US-003**: As a team lead, I want to validate workflow configurations before deployment
- **US-004**: As a CLI user, I want seamless integration between web and command-line interfaces
- **US-005**: As a new user, I want to discover available agents through an intuitive interface

## Data Models and API Design

### Core Data Types
```typescript
interface WorkflowMetadata {
  workflowName: string;
  workflowPurpose: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
  version?: string;
  author?: string;
  tags?: string[];
}

interface WorkflowStep {
  id: string;
  title: string;
  mode: 'sequential' | 'parallel';
  purpose: string;
  agents: string[];
  order: number;
}

interface POMLWorkflow extends WorkflowMetadata {
  workflowSteps: WorkflowStep[];
}
```

### API Endpoints
| Method | Route | Purpose | Status |
|--------|-------|---------|--------|
| GET | `/api/agents` | List available agents | ✅ Implemented |
| GET | `/api/agents/[category]` | Get category agents | ✅ Implemented |
| POST | `/api/workflows` | Save workflow | ✅ Implemented |
| GET | `/api/workflows` | List saved workflows | 📋 Planned |
| POST | `/api/workflows/validate` | Validate workflow | 📋 Planned |

## Development Guidelines

### Code Organization
```
cc-flow-web/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   │   ├── workflow-editor/    # Core editor components
│   │   ├── panels/             # Side panels and UI sections
│   │   └── ui/                 # Reusable UI components (shadcn/ui)
│   ├── lib/                    # Business logic and utilities
│   ├── types/                  # TypeScript type definitions
│   └── hooks/                  # Custom React hooks
├── docs/                       # Project documentation
│   └── specifications/         # Technical specifications
└── public/                     # Static assets
```

### Development Standards
- **TypeScript**: Strict mode enabled, no `any` types in production code
- **Code Quality**: ESLint and Prettier configured for consistent formatting
- **Testing**: Vitest for unit tests, Playwright for end-to-end testing
- **Performance**: Core Web Vitals compliance, optimized bundle sizes
- **Accessibility**: WCAG 2.1 AA compliance for all interactive elements

## Integration with CC-Flow CLI

### Launch Integration
The web editor is launched directly from the cc-flow CLI using:
```bash
cc-flow web [--port 3000] [--no-browser]
```

### Data Compatibility
- **Agent Discovery**: Reads from existing `.claude/agents/` directory structure
- **Workflow Export**: Generates JSON compatible with cc-flow CLI execution
- **Bidirectional Sync**: Workflows created in either interface work seamlessly in the other

### Environment Configuration
```typescript
const config = {
  development: {
    apiBaseURL: 'http://localhost:3002',
    agentsPath: '../.claude/agents',
    workflowsPath: '../workflows'
  },
  production: {
    agentsPath: process.env.AGENTS_PATH || './.claude/agents',
    workflowsPath: process.env.WORKFLOWS_PATH || './workflows'
  }
};
```

## Quality Assurance and Testing

### Testing Strategy
- **Unit Tests**: Core business logic and utility functions
- **Integration Tests**: API endpoints and file system operations
- **Component Tests**: React component behavior and user interactions
- **End-to-End Tests**: Critical user flows (≤3 key scenarios)

### Performance Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load Time | < 2 seconds | Core Web Vitals |
| Agent Discovery | < 1 second | API response time |
| Canvas Rendering | < 500ms | ReactFlow initialization |
| Node Addition | < 100ms | User interaction response |

### Security Considerations
- **Local-Only Operation**: No external network dependencies
- **Path Traversal Protection**: Sanitized file system access
- **Input Validation**: Comprehensive validation for all user inputs
- **XSS Prevention**: Sanitized user-generated content

## Deployment and Operations

### Development Environment
```bash
# Prerequisites
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Setup
cd cc-flow-web
npm install
npm run dev     # Development server on localhost:3002
```

### Production Deployment
```bash
npm run build   # Production build
npm start       # Production server
```

### Monitoring and Health Checks
- **Health Endpoint**: `/api/health` for system status monitoring
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error logging and reporting

## Future Roadmap

### Short-term Enhancements (3-6 months)
- Advanced workflow validation and optimization suggestions
- Enhanced collaboration features (comments, versioning)
- Template system for common workflow patterns
- Integration with external CI/CD systems

### Long-term Vision (6-12 months)
- Multi-user collaboration with real-time editing
- Cloud-based workflow storage and sharing
- Advanced analytics and workflow performance insights
- Plugin system for custom integrations

## Documentation References

This project specification serves as the central hub for all cc-flow-web documentation. For detailed technical information, refer to:

- **[Technical Design Specification](./TECHNICAL_DESIGN_SPEC.md)**: Comprehensive technical architecture and implementation details
- **[Implementation Specification](./IMPLEMENTATION_SPEC.md)**: Current implementation status and development roadmap
- **[Web Editor Design](./WEB_EDITOR_DESIGN.md)**: Original design document and Japanese specifications
- **[Architecture Documentation](./architecture/)**: System architecture diagrams and patterns
- **[Component Specifications](./components/)**: Detailed component documentation
- **[API Documentation](./api/)**: API endpoint specifications and examples
- **[Developer Guides](./guides/)**: Development setup and contribution guidelines

## Contributing

### Development Workflow
1. **Setup**: Follow development environment setup in this document
2. **Implementation**: Refer to Phase 2 tasks in [Implementation Specification](./IMPLEMENTATION_SPEC.md)
3. **Testing**: Ensure comprehensive test coverage for new features
4. **Documentation**: Update relevant specification documents

### Code Standards
- Follow existing TypeScript and React patterns
- Maintain compatibility with cc-flow CLI ecosystem
- Ensure accessibility compliance
- Write comprehensive tests for new functionality

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Maintainers**: CC-Flow Development Team