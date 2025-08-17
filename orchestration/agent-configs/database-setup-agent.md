# Database Setup Agent Configuration

## Agent Specification
- **Agent ID**: Database Setup Agent
- **Task**: #5 - Database infrastructure and mock data
- **Worktree**: `../reportbuilder-task-5`
- **Port**: 3005
- **Branch**: `task-5-database-setup`
- **Persona**: `--persona-backend`

## Specialization Focus
Database infrastructure setup with mock data systems and data persistence layer.

## Technical Requirements

### Primary Technologies
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma or Drizzle
- **API Layer**: Next.js API routes
- **Data Migration**: Schema versioning and seeding
- **Mock Data**: Realistic sample datasets

### MCP Server Configuration
- **Primary**: Context7 (database patterns and ORM best practices)
- **Secondary**: Sequential (setup workflows and data modeling)

### Key Files to Create/Modify
- `lib/database/` (new database layer)
- `prisma/schema.prisma` (new database schema)
- `lib/api/` (new API layer)
- `data/mock/` (new mock data sets)
- `scripts/seed.ts` (new database seeding)

## Implementation Strategy

### Phase 1: Database Infrastructure
1. **Schema Design**: Define tables for reports, templates, data sources
2. **ORM Setup**: Configure Prisma/Drizzle with Next.js
3. **Migration System**: Version-controlled schema changes
4. **Connection Management**: Database connection pooling

### Phase 2: Mock Data Systems
1. **Sample Data**: Realistic datasets for testing
2. **Data Generators**: Programmatic data creation
3. **Seeding Scripts**: Automated database population
4. **Data Relationships**: Properly linked sample data

### Phase 3: API Layer
1. **CRUD Operations**: Complete database API
2. **Data Validation**: Input sanitization and validation
3. **Error Handling**: Graceful failure management
4. **Performance**: Query optimization and caching

## Acceptance Criteria
- [ ] Functional database with complete schema
- [ ] Mock data available for all major use cases
- [ ] API endpoints for all database operations
- [ ] Database migrations working correctly
- [ ] Performance benchmarks met (< 100ms query time)
- [ ] 100% test coverage for database operations

## Database Schema

### Core Tables
```sql
-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID REFERENCES templates(id),
  data_source_id UUID REFERENCES data_sources(id),
  layout JSON NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  layout JSON NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Data Sources table
CREATE TABLE data_sources (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'csv', 'api', 'database'
  connection_config JSON,
  schema JSON,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Interface Contracts

### Database Models
```typescript
interface Report {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  dataSourceId?: string;
  layout: ReportLayout;
  createdAt: Date;
  updatedAt: Date;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  layout: ReportLayout;
  isPublic: boolean;
  createdAt: Date;
}

interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'api' | 'database';
  connectionConfig: any;
  schema: Record<string, string>;
  createdAt: Date;
}
```

### API Endpoints
```typescript
// Reports API
GET    /api/reports           - List all reports
POST   /api/reports           - Create new report
GET    /api/reports/[id]      - Get specific report
PUT    /api/reports/[id]      - Update report
DELETE /api/reports/[id]      - Delete report

// Templates API  
GET    /api/templates         - List all templates
POST   /api/templates         - Create new template
GET    /api/templates/[id]    - Get specific template

// Data Sources API
GET    /api/data-sources      - List all data sources
POST   /api/data-sources      - Create new data source
GET    /api/data-sources/[id] - Get specific data source
```

## Mock Data Requirements

### Sample Reports
- **Sales Report**: Monthly sales performance with charts
- **Financial Report**: Quarterly financial statements
- **User Analytics**: User engagement and behavior data
- **Inventory Report**: Stock levels and turnover rates

### Sample Templates
- **Business Dashboard**: KPI overview template
- **Invoice Template**: Professional invoice layout
- **Certificate Template**: Achievement certificates
- **Label Template**: Product labels and tags

### Sample Data Sources
- **Sales CSV**: 1000+ sales transactions
- **User Analytics API**: Simulated API responses
- **Financial Database**: Sample financial records

## Testing Requirements
- **Unit Tests**: Database operations and API endpoints
- **Integration Tests**: End-to-end data flow
- **Performance Tests**: Query execution times
- **Data Integrity Tests**: Referential integrity and constraints

## Quality Gates
- TypeScript strict mode compliance
- ESLint zero warnings
- Jest test coverage 100%
- Database migration tests
- Performance benchmarks (< 100ms query response)
- Data validation and sanitization

## Performance Considerations

### Query Optimization
- Proper indexing strategy
- Query result caching
- Connection pooling
- Batch operations for bulk data

### Scalability Planning
- Database partitioning strategy
- Read replica configuration
- Caching layer integration
- API rate limiting

---
**Agent Status**: Ready for Assignment
**Estimated Completion**: 4-6 days
**Dependencies**: None (independent infrastructure task)