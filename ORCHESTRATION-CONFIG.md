# ReportBuilder Multi-Agent Orchestration Configuration

## Overview
Parallel development workflow using specialized agents with dedicated worktrees and development environments.

## Agent Configuration Matrix

| Agent | Task | Worktree | Port | Branch | Persona | Focus |
|-------|------|----------|------|--------|---------|-------|
| **Properties Panel Agent** | Task #3 | `../reportbuilder-task-3` | 3003 | `task-3-properties-panel` | `--persona-frontend` | Real-time property updates between panel and canvas |
| **Undo/Redo System Agent** | Task #4 | `../reportbuilder-task-4` | 3004 | `task-4-undo-redo` | `--persona-architect` | Command pattern implementation |
| **Database Setup Agent** | Task #5 | `../reportbuilder-task-5` | 3005 | `task-5-database-setup` | `--persona-backend` | Database infrastructure and mock data |
| **Data Binding Agent** | Task #6 | `../reportbuilder-task-6` | 3006 | `task-6-data-binding` | `--persona-backend` | Connect data sources to components |
| **PDF Generation Agent** | Task #7 | `../reportbuilder-task-7` | 3007 | `task-7-pdf-generation` | `--persona-performance` | PDF generation engine |
| **Templates Agent** | Task #8 | `../reportbuilder-task-8` | 3008 | `task-8-templates` | `--persona-frontend` | Sample templates creation |

## Specialized Agent Configuration

### 1. Properties Panel Agent (Task #3)
**Specialization**: Frontend UI integration, React state management
**MCP Servers**: Magic (UI components), Context7 (React patterns)
**Key Files**: 
- `components/designer/properties/properties-panel.tsx`
- `components/designer/properties/property-config-renderer.tsx`
**Acceptance Criteria**: Changing properties immediately updates canvas components

### 2. Undo/Redo System Agent (Task #4)
**Specialization**: Design patterns, state management architecture
**MCP Servers**: Sequential (complex logic), Context7 (design patterns)
**Key Files**: New command system, update all edit operations
**Acceptance Criteria**: Undo/redo buttons work for all user actions

### 3. Database Setup Agent (Task #5)
**Specialization**: Backend infrastructure, database design
**MCP Servers**: Context7 (database patterns), Sequential (setup workflows)
**Key Files**: Database configuration, mock data systems
**Acceptance Criteria**: Functional database with sample data

### 4. Data Binding Agent (Task #6)
**Specialization**: Data integration, API design
**MCP Servers**: Sequential (data flow), Context7 (API patterns)
**Key Files**: New data binding components
**Acceptance Criteria**: Components display dynamic content from connected data

### 5. PDF Generation Agent (Task #7)
**Specialization**: Document generation, performance optimization
**MCP Servers**: Context7 (PDF libraries), Sequential (generation logic)
**Dependencies**: jsPDF, html2canvas
**Acceptance Criteria**: Generated PDFs match canvas exactly

### 6. Templates Agent (Task #8)
**Specialization**: Template design, data modeling
**MCP Servers**: Magic (UI templates), Context7 (template patterns)
**Key Files**: New template management system
**Acceptance Criteria**: Users can save, load, and share templates

## Shared Interface Contracts

### Component State Interface
```typescript
interface ComponentState {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
}
```

### Command Interface (for Undo/Redo)
```typescript
interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
  type: string;
  timestamp: number;
}
```

### Data Source Interface
```typescript
interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'api' | 'database';
  schema: Record<string, string>;
  data: any[];
}
```

## Communication Protocols

### Daily Sync Protocol
1. **Morning Standup** (async): Share progress via commit messages
2. **Interface Updates**: Notify other agents of interface changes
3. **Integration Points**: Coordinate shared component updates
4. **Quality Gates**: All agents must achieve 100% test coverage

### Integration Standards
- **TypeScript Strict Mode**: All implementations must be type-safe
- **ESLint Compliance**: Zero warnings before merge
- **Test Coverage**: 100% coverage for new features
- **Documentation**: Update CLAUDE.md for new patterns

### Merge Strategy
- **Feature Branches**: Each agent works on their dedicated branch
- **Pull Requests**: Required for all merges to main
- **Integration Testing**: E2E tests before final merge
- **Rollback Plan**: Keep main branch stable at all times

## Environment Setup Commands

### Properties Panel Agent (Port 3003)
```bash
cd ../reportbuilder-task-3
npm install
npm run dev # Starts on http://localhost:3003
```

### Undo/Redo System Agent (Port 3004)
```bash
cd ../reportbuilder-task-4
npm install
npm run dev # Starts on http://localhost:3004
```

### Database Setup Agent (Port 3005)
```bash
cd ../reportbuilder-task-5
npm install
npm run dev # Starts on http://localhost:3005
```

### Data Binding Agent (Port 3006)
```bash
cd ../reportbuilder-task-6
npm install
npm run dev # Starts on http://localhost:3006
```

### PDF Generation Agent (Port 3007)
```bash
cd ../reportbuilder-task-7
npm install
npm run dev # Starts on http://localhost:3007
```

### Templates Agent (Port 3008)
```bash
cd ../reportbuilder-task-8
npm install
npm run dev # Starts on http://localhost:3008
```

## Quality Gates

### Pre-Merge Checklist
- [ ] TypeScript compilation passes (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass with 100% coverage
- [ ] E2E tests validate integration
- [ ] Documentation updated
- [ ] Feature Registry updated

### Integration Testing Protocol
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Cross-component interaction
3. **E2E Tests**: Full user workflow validation
4. **Performance Tests**: Load and responsiveness
5. **Accessibility Tests**: WCAG compliance

## Coordination Tools

### Shared Resources
- **Main Repository**: `reportbuilder` (integration point)
- **Feature Registry**: `/features` page for status tracking
- **Documentation**: CLAUDE.md, UX-UI-Implementation-Plan.md
- **Issue Tracking**: GitHub Issues for cross-agent coordination

### Monitoring
- **Build Status**: All agents must maintain green builds
- **Test Coverage**: Real-time coverage reporting
- **Performance Metrics**: Response time monitoring
- **Integration Health**: Cross-agent compatibility checks

---

**Created**: August 17, 2025
**Last Updated**: August 17, 2025
**Status**: Active Multi-Agent Development