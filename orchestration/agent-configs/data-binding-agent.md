# Data Binding Agent Configuration

## Agent Specification
- **Agent ID**: Data Binding Agent
- **Task**: #6 - Connect data sources to components
- **Worktree**: `../reportbuilder-task-6`
- **Port**: 3006
- **Branch**: `task-6-data-binding`
- **Persona**: `--persona-backend`

## Specialization Focus
Data integration and API design for connecting data sources to report components with dynamic content rendering.

## Technical Requirements

### Primary Technologies
- **Data Processing**: CSV parsing, API integration, SQL querying
- **State Management**: Zustand for data state
- **Type Safety**: Zod schemas for data validation
- **Real-time Updates**: WebSocket connections for live data
- **Performance**: Data virtualization for large datasets

### MCP Server Configuration
- **Primary**: Sequential (data flow and integration logic)
- **Secondary**: Context7 (API patterns and data handling)

### Key Files to Create/Modify
- `lib/data-binding/` (new data binding system)
- `components/designer/data-preview/data-preview-panel.tsx`
- `lib/data-sources/` (new data source connectors)
- `types/data-binding.ts` (new type definitions)

## Implementation Strategy

### Phase 1: Data Source Connectors
1. **CSV Connector**: File upload and parsing with Papa Parse
2. **API Connector**: REST API integration with validation
3. **Database Connector**: Direct database queries
4. **Data Validation**: Schema validation and type checking

### Phase 2: Data Binding System
1. **Binding Interface**: Visual mapping between data fields and components
2. **Data Transformation**: Field mapping and data formatting
3. **Dynamic Rendering**: Real-time component updates with data
4. **Error Handling**: Graceful handling of data source failures

### Phase 3: Advanced Features
1. **Data Filtering**: Dynamic filtering and sorting
2. **Data Aggregation**: Summary calculations and grouping
3. **Live Updates**: Real-time data refresh capabilities
4. **Data Caching**: Efficient data storage and retrieval

## Acceptance Criteria
- [ ] Components display dynamic content from connected data sources
- [ ] Visual data field mapping interface
- [ ] Support for CSV, API, and database data sources
- [ ] Real-time data updates in components
- [ ] Data validation and error handling
- [ ] 100% test coverage for data binding logic

## Interface Contracts

### Data Binding Configuration
```typescript
interface DataBinding {
  id: string;
  componentId: string;
  dataSourceId: string;
  fieldMappings: FieldMapping[];
  transformations: DataTransformation[];
  refreshInterval?: number;
}

interface FieldMapping {
  sourceField: string;
  targetProperty: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  formatter?: string;
  defaultValue?: any;
}

interface DataTransformation {
  type: 'filter' | 'sort' | 'aggregate' | 'format';
  config: any;
}
```

### Data Source Integration
```typescript
interface DataSourceConnector {
  type: 'csv' | 'api' | 'database';
  connect(config: any): Promise<DataConnection>;
  validate(config: any): Promise<boolean>;
  getSchema(): Promise<DataSchema>;
}

interface DataConnection {
  id: string;
  source: DataSourceConnector;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  getData(query?: DataQuery): Promise<DataResult>;
  close(): Promise<void>;
}

interface DataQuery {
  fields?: string[];
  filters?: FilterCriteria[];
  sort?: SortCriteria[];
  limit?: number;
  offset?: number;
}
```

### Component Data Integration
```typescript
interface ComponentDataProvider {
  componentId: string;
  bindings: DataBinding[];
  currentData: any;
  isLoading: boolean;
  error?: string;
  
  updateData(): Promise<void>;
  mapFieldToProperty(field: string, property: string): void;
  addTransformation(transform: DataTransformation): void;
}
```

## Data Source Support

### CSV Files
- **Upload Handling**: Drag & drop and file picker
- **Parsing**: Automatic delimiter detection
- **Type Inference**: Smart data type detection
- **Preview**: Data grid with sampling

### API Endpoints
- **REST Integration**: GET/POST request support
- **Authentication**: API key and OAuth support
- **Response Mapping**: JSON path extraction
- **Rate Limiting**: Respectful API consumption

### Database Connections
- **SQL Support**: PostgreSQL, MySQL, SQLite
- **Query Builder**: Visual query construction
- **Security**: Connection string encryption
- **Performance**: Query optimization

## Testing Requirements
- **Unit Tests**: Data connectors and binding logic
- **Integration Tests**: End-to-end data flow
- **Performance Tests**: Large dataset handling
- **Security Tests**: Data validation and sanitization
- **E2E Tests**: Complete data binding workflows

## Quality Gates
- TypeScript strict mode compliance
- ESLint zero warnings
- Jest test coverage 100%
- Playwright E2E validation
- Performance benchmarks (< 2s for 10k records)
- Security audit for data handling

## Performance Considerations

### Large Dataset Handling
- **Virtual Scrolling**: Efficient rendering of large lists
- **Data Pagination**: Server-side pagination support
- **Lazy Loading**: On-demand data fetching
- **Caching Strategy**: Smart data caching

### Real-time Updates
- **WebSocket Integration**: Live data streaming
- **Debounced Updates**: Efficient update batching
- **Conflict Resolution**: Handle concurrent data changes
- **Offline Support**: Cache for offline usage

## Security Considerations

### Data Protection
- **Input Sanitization**: Prevent injection attacks
- **Access Control**: Role-based data access
- **Encryption**: Sensitive data protection
- **Audit Logging**: Data access tracking

### Privacy Compliance
- **Data Masking**: PII protection in previews
- **Retention Policies**: Automatic data cleanup
- **Consent Management**: User data permissions
- **GDPR Compliance**: Right to deletion

---
**Agent Status**: Ready for Assignment
**Estimated Completion**: 5-7 days
**Dependencies**: Database Setup Agent (Task #5) for data persistence