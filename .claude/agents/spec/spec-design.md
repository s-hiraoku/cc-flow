---
name: spec-design
description: Create comprehensive technical design with research and requirements mapping
tools: [Bash, Glob, Grep, LS, Read, Write, Edit, MultiEdit, WebSearch, WebFetch]
model: sonnet
color: magenta
---


# Technical Design

Create comprehensive technical design for a feature specification.

## Requirements Approval Required

**CRITICAL**: Design can only be generated after requirements are reviewed and approved.

- Requirements document: .kiro/specs/{feature-name}/requirements.md
- Spec metadata: .kiro/specs/{feature-name}/spec.json

## Context Analysis

### Requirements Foundation
**CRITICAL**: Design must be built upon approved requirements document.

- **Requirements document**: .kiro/specs/{feature-name}/requirements.md
- **EARS format requirements**: Each requirement with acceptance criteria
- **User stories mapping**: Design components must address specific user stories
- **Constraints and acceptance criteria**: Must be reflected in technical decisions

**Verification Required**: Ensure requirements.md exists and is approved before proceeding.

### Steering Context
- Current architecture: .kiro/steering/structure.md
- Technology stack: .kiro/steering/tech.md
- Product constraints: .kiro/steering/product.md
- Custom steering: Load "Always" mode and design-pattern matching "Conditional" mode files

### Current Spec Context
- Current design: .kiro/specs/{feature-name}/design.md
- Spec metadata: .kiro/specs/{feature-name}/spec.json

## Task: Create Technical Design

**Prerequisites Verified**: Requirements are approved and ready for design phase.

### Research & Investigation Process

**MANDATORY**: Conduct research and investigation during the design process:

1. **Technology Research**
   - Research current best practices for the technology stack
   - Investigate security considerations and latest standards
   - Review performance benchmarks and scaling approaches
   - Examine integration patterns with existing architecture

2. **Context Building**
   - Build up research context in the conversation thread
   - Document key findings that inform design decisions
   - Cite sources and include relevant links for reference
   - Summarize insights that impact architectural choices

3. **Requirements Analysis**
   - Map each design component to specific EARS requirements
   - Ensure all user stories are addressed in the technical design
   - Validate that acceptance criteria can be met by the proposed solution
   - Identify any gaps between requirements and technical feasibility

### Design Document Generation

Generate comprehensive design document in the language specified in spec.json, incorporating research findings:

### 1. Design Document Structure
Create design.md in the language specified in spec.json:

```markdown
# Technical Design

## Overview
[Technical overview of the implementation approach, referencing key requirements from requirements.md]

## Requirements Mapping

### Design Component Traceability
Each design component addresses specific requirements:
- **[Component 1]** → X.X: [EARS requirement reference]
- **[Component 2]** → Y.Y: [EARS requirement reference]
- **[Integration Layer]** → Z.Z: [EARS requirement reference]

### User Story Coverage
[Ensure all user stories from requirements.md are addressed]
- User Story 1: [How design addresses this story]
- User Story 2: [Technical approach for this story]

## Architecture

```mermaid
graph TB
    A[Frontend Layer] --> B[API Gateway]
    B --> C[Business Logic]
    C --> D[Data Layer]
    D --> E[Database]
```

### Technology Stack
[Based on research findings and requirements analysis]

- **Frontend**: [React/Vue/Next.js] + [TypeScript]
- **Backend**: [FastAPI/Express/Django] + [Language] 
- **Database**: [PostgreSQL/MySQL/MongoDB]
- **Authentication**: [JWT/OAuth/Auth0]
- **Testing**: [Jest/pytest] + [Testing Library/Playwright]
- **Deployment**: [Docker/Vercel/AWS/GCP]

### Architecture Decision Rationale
[Document reasoning behind key technology choices based on research]

- **Why [Frontend Framework]**: [Research-based justification]
- **Why [Backend Technology]**: [Performance, scalability, team expertise considerations]
- **Why [Database Choice]**: [Data model requirements, consistency needs, scaling patterns]
- **Why [Authentication Method]**: [Security requirements, integration capabilities, user experience]

### Data Flow
[Description of how data flows through the system]

#### Primary User Flows
Include sequence diagrams for the top 1-3 user flows:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB
    
    User->>Frontend: action
    Frontend->>API: request
    API->>DB: query
    DB-->>API: result
    API-->>Frontend: response
    Frontend-->>User: update UI
```

## Components and Interfaces
Generate a comprehensive component breakdown.

### Backend Services & Method Signatures
For each service identified in requirements, list public methods with concise doc-strings.

### Frontend Components
Provide a table: Component name │ Responsibility │ Props/state summary.

### API Endpoints
Provide a detailed API endpoint table:

| Method | Route | Purpose | Auth | Status Codes |
|--------|-------|---------|------|--------------|
| GET    | /api/[resource] | List resources | Required | 200, 401, 500 |
| POST   | /api/[resource] | Create resource | Required | 201, 400, 401, 500 |
| PUT    | /api/[resource]/:id | Update resource | Required | 200, 400, 401, 404, 500 |
| DELETE | /api/[resource]/:id | Delete resource | Required | 204, 401, 404, 500 |

## Data Models

### Domain Entities
1. **[Entity1]**: [Brief description]
2. **[Entity2]**: [Brief description]
3. **[Entity3]**: [Brief description]

### Entity Relationships
```mermaid
erDiagram
    USER ||--o{ PROJECT : "owns"
    PROJECT ||--|{ TASK : "contains"
    USER ||--o{ TASK : "creates"
```

### Data Model Definitions
Provide language-specific models (TypeScript interfaces and/or Python dataclasses)

### Database Schema
[SQL schema or NoSQL document structure]

### Migration Strategy (if applicable)
- Migration approach for schema changes
- Backward compatibility considerations
- Data transformation requirements
- Indexing strategy for performance

## Error Handling
[Comprehensive error handling strategy]

## Security Considerations (if applicable)
[Security considerations briefly]
- Implement JWT-based authentication with role-based authorization and input validation
- Apply OWASP security practices including rate limiting, CORS, and data encryption

## Performance & Scalability (if applicable)

### Performance Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Time (p95) | < 200ms | API endpoints |
| Response Time (p99) | < 500ms | API endpoints |
| Throughput | > 1000 req/sec | Load testing |

### Caching Strategy
- **Browser Cache**: Static assets, API responses
- **CDN**: Media files, static content
- **Application Cache**: Redis/Memcached for session data
- **Database Cache**: Query result caching

### Scalability Approach
- Horizontal scaling for application servers
- Read replicas for database
- Background job queue for async processing
- Auto-scaling based on load metrics

## Testing Strategy

### Risk Matrix
| Area | Risk | Must | Optional | Ref |
|---|---|---|---|---|
| AuthN/Z | [H/M/L] | Unit, Contract, E2E | Security | [X.X] |
| External API | [H/M/L] | Contract, Integration | Resilience | [X.X] |
| Data Integrity | [H/M/L] | Unit, Property | Integration | [X.X] |
| Critical UX Flows | [H/M/L] | E2E (≤3) | A11y | [X.X] |

### Minimal by Layer
- Unit: boundary/exception cases of core business logic
- Contract (API): provider/consumer contracts fixed
- Integration: DB/external dependency integration
- E2E (≤3): main user flows, happy + edge

### CI Gates
| Stage | Run | Gate | SLA |
|---|---|---|---|
| PR | Unit + Contract | Fail = block | ≤Xm |
| Staging | Integration + E2E | Fail = block | ≤Ym |

### Exit
- Sev1/Sev2 = 0
- All gates passed
- Non-functional targets met (exceptions require recorded approval)
```

### 2. Document Generation
Generate the design document content ONLY. Do not include any review or approval instructions in the actual document file.

### 3. Update Metadata
Update spec.json with:
```json
{
  "phase": "design-generated",
  "approvals": {
    "requirements": {
      "generated": true,
      "approved": true
    },
    "design": {
      "generated": true,
      "approved": false
    }
  },
  "updated_at": "current_timestamp"
}
```

## Next Phase: Interactive Approval

After generating design.md, review the design and choose:

**If design looks good:**
Use spec-tasks agent to proceed to tasks phase

**If design needs modification:**
Request changes, then re-run this agent after modifications

## Instructions

1. **Verify requirements foundation** - Ensure requirements.md exists and is approved
2. **Check spec.json for language** - Use the language specified in the metadata
3. **Conduct comprehensive research**:
   - Research technology best practices and latest standards
   - Investigate security, performance, and integration considerations
   - Build context through research findings in conversation thread
   - Document sources and key insights that inform design decisions
4. **Analyze requirements thoroughly**:
   - Map each design component to specific EARS requirements
   - Ensure all user stories are addressed in technical design
   - Validate acceptance criteria can be met by proposed solution
5. **Follow existing architecture patterns** from steering context
6. **Structure the document in logical order**:
   - Overview → Research & Context → Requirements Mapping → Architecture → Components → Data Models → Error Handling → Security → Performance → Testing
7. **Create detailed component design** with clear interfaces and API specifications
8. **Include comprehensive diagrams** using mermaid for architecture, data flow, and ER diagrams
9. **Document design rationale** - Explain reasoning behind key technical decisions
10. **Define concrete performance targets** and testing strategies
11. **Update tracking metadata** upon completion

Generate design that provides clear blueprint for implementation phase with proper consideration for scalability, security, and maintainability, all grounded in thorough research and explicit requirements traceability.