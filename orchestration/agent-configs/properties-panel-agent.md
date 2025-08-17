# Properties Panel Agent Configuration

## Agent Specification
- **Agent ID**: Properties Panel Agent
- **Task**: #3 - Connect properties panel to component updates
- **Worktree**: `../reportbuilder-task-3`
- **Port**: 3003
- **Branch**: `task-3-properties-panel`
- **Persona**: `--persona-frontend`

## Specialization Focus
Real-time property updates between panel and canvas with React state management and UI integration.

## Technical Requirements

### Primary Technologies
- **Frontend**: React 19, TypeScript
- **UI Components**: ShadCN, Tailwind CSS v4
- **State Management**: React useState, Context API
- **Real-time Updates**: useEffect, Custom hooks

### MCP Server Configuration
- **Primary**: Magic (UI component optimization)
- **Secondary**: Context7 (React patterns and best practices)

### Key Files to Modify
- `components/designer/properties/properties-panel.tsx`
- `components/designer/properties/property-config-renderer.tsx`
- `components/designer/canvas/report-component.tsx`
- `components/designer/report-designer.tsx`

## Implementation Strategy

### Phase 1: Property Update Pipeline
1. **State Bridge Setup**: Connect property panel state to canvas components
2. **Real-time Synchronization**: Implement immediate property propagation
3. **Property Validation**: Ensure type safety and value constraints
4. **Visual Feedback**: Show property changes in real-time on canvas

### Phase 2: Advanced Property Controls
1. **Dynamic Property Rendering**: Conditional property controls based on component type
2. **Property Groups**: Organize properties into logical sections
3. **Property History**: Track property changes for undo/redo integration
4. **Property Presets**: Quick-apply common property configurations

## Acceptance Criteria
- [ ] Changing properties in panel immediately updates canvas components
- [ ] All 11 component types support property editing
- [ ] Property validation prevents invalid configurations
- [ ] Real-time visual feedback during property changes
- [ ] Type-safe property interfaces
- [ ] 100% test coverage for property update logic

## Interface Contracts

### ComponentPropertyUpdate
```typescript
interface ComponentPropertyUpdate {
  componentId: string;
  propertyPath: string;
  newValue: any;
  previousValue: any;
  timestamp: number;
}
```

### PropertyPanelState
```typescript
interface PropertyPanelState {
  selectedComponentId: string | null;
  properties: Record<string, any>;
  isUpdating: boolean;
  validationErrors: PropertyValidationError[];
}
```

## Testing Requirements
- **Unit Tests**: Property update functions and validation logic
- **Integration Tests**: Property panel ↔ canvas communication
- **E2E Tests**: Complete property editing workflows
- **Performance Tests**: Real-time update responsiveness

## Quality Gates
- TypeScript strict mode compliance
- ESLint zero warnings
- Jest test coverage 100%
- Playwright E2E validation
- Performance benchmarks met (< 50ms update latency)

---
**Agent Status**: Ready for Assignment
**Estimated Completion**: 3-5 days
**Dependencies**: Current drag-and-drop system, component state management