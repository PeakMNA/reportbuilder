# Templates Agent Configuration

## Agent Specification
- **Agent ID**: Templates Agent
- **Task**: #8 - Sample templates creation
- **Worktree**: `../reportbuilder-task-8`
- **Port**: 3008
- **Branch**: `task-8-templates`
- **Persona**: `--persona-frontend`

## Specialization Focus
Template design and data modeling with sample template creation and template management system.

## Technical Requirements

### Primary Technologies
- **Template Engine**: React-based template system
- **Design System**: ShadCN components, Tailwind CSS
- **Data Modeling**: Template schemas and validation
- **Asset Management**: Template images, icons, fonts
- **Export/Import**: Template sharing and distribution

### MCP Server Configuration
- **Primary**: Magic (UI template generation and design systems)
- **Secondary**: Context7 (template patterns and best practices)

### Key Files to Create/Modify
- `templates/` (new template definitions)
- `components/templates/` (new template management UI)
- `lib/templates/` (new template engine)
- `data/sample-templates/` (new template collections)

## Implementation Strategy

### Phase 1: Template Infrastructure
1. **Template Schema**: Define template structure and metadata
2. **Template Engine**: Runtime template processing and rendering
3. **Template Validation**: Schema validation and error handling
4. **Template Preview**: Real-time template preview system

### Phase 2: Sample Template Creation
1. **Business Templates**: Professional business report templates
2. **Financial Templates**: Financial statements and dashboards
3. **Marketing Templates**: Brochures, flyers, and presentations
4. **Educational Templates**: Certificates, reports, and materials

### Phase 3: Template Management
1. **Template Gallery**: Browse and preview templates
2. **Import/Export**: Template sharing capabilities
3. **Customization**: Template modification and personalization
4. **Version Control**: Template versioning and history

## Acceptance Criteria
- [ ] Users can save, load, and share templates
- [ ] 20+ high-quality sample templates available
- [ ] Template preview and customization interface
- [ ] Template import/export functionality
- [ ] Template categorization and search
- [ ] 100% test coverage for template system

## Interface Contracts

### Template Definition
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  preview: string; // base64 image
  layout: TemplateLayout;
  metadata: TemplateMetadata;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateLayout {
  components: ComponentDefinition[];
  pageSettings: PageSettings;
  styles: TemplateStyles;
  dataBindings: DataBindingTemplate[];
}

interface TemplateMetadata {
  author: string;
  license: string;
  compatibility: string[];
  requiredData?: DataSchema;
  customizations: CustomizationOption[];
}
```

### Template Categories
```typescript
enum TemplateCategory {
  BUSINESS = 'business',
  FINANCIAL = 'financial',
  MARKETING = 'marketing',
  EDUCATIONAL = 'educational',
  HEALTHCARE = 'healthcare',
  LEGAL = 'legal',
  TECHNICAL = 'technical',
  PERSONAL = 'personal'
}

interface CustomizationOption {
  id: string;
  name: string;
  type: 'color' | 'font' | 'logo' | 'text' | 'layout';
  defaultValue: any;
  options?: any[];
  validation?: ValidationRule[];
}
```

### Template Engine
```typescript
interface TemplateEngine {
  loadTemplate(id: string): Promise<Template>;
  renderTemplate(template: Template, data?: any): Promise<RenderedTemplate>;
  customizeTemplate(template: Template, customizations: any): Promise<Template>;
  validateTemplate(template: Template): Promise<ValidationResult>;
  exportTemplate(template: Template, format: 'json' | 'zip'): Promise<Blob>;
  importTemplate(file: File): Promise<Template>;
}

interface RenderedTemplate {
  html: string;
  css: string;
  assets: TemplateAsset[];
  metadata: TemplateMetadata;
}
```

## Sample Template Collection

### Business Templates
1. **Executive Dashboard**
   - KPI overview with charts and metrics
   - Clean, professional design
   - Customizable company branding

2. **Sales Report**
   - Monthly/quarterly sales performance
   - Revenue charts and trend analysis
   - Territory and product breakdowns

3. **Project Status Report**
   - Project timeline and milestones
   - Resource allocation and budget tracking
   - Risk assessment and action items

4. **Employee Performance Review**
   - Goal tracking and achievement metrics
   - Skills assessment and development plans
   - 360-degree feedback integration

### Financial Templates
1. **Income Statement**
   - Professional P&L format
   - Multi-period comparison
   - Variance analysis

2. **Balance Sheet**
   - Standard accounting format
   - Asset and liability breakdowns
   - Financial ratio calculations

3. **Cash Flow Statement**
   - Operating, investing, financing activities
   - Cash position tracking
   - Liquidity analysis

4. **Budget vs Actual Report**
   - Budget performance tracking
   - Variance explanations
   - Forecast adjustments

### Marketing Templates
1. **Campaign Performance Report**
   - Multi-channel marketing metrics
   - ROI and conversion tracking
   - Customer acquisition costs

2. **Product Brochure**
   - Professional product showcase
   - Feature highlights and benefits
   - Call-to-action integration

3. **Event Program**
   - Conference or meeting agenda
   - Speaker profiles and bios
   - Sponsor acknowledgments

4. **Customer Survey Results**
   - Survey response analysis
   - Satisfaction metrics
   - Recommendation tracking

### Educational Templates
1. **Course Completion Certificate**
   - Professional certificate design
   - Student and course information
   - Digital signature support

2. **Student Progress Report**
   - Academic performance tracking
   - Grade analysis and trends
   - Parent communication

3. **Research Paper Template**
   - Academic formatting standards
   - Citation and bibliography
   - Figure and table layouts

4. **Training Material**
   - Instructional content layout
   - Step-by-step procedures
   - Assessment integration

## Template Management Features

### Template Gallery
- **Grid View**: Visual template browser
- **Category Filters**: Filter by template category
- **Search**: Template name and tag search
- **Preview**: Hover previews and full-screen preview
- **Sorting**: Sort by name, date, popularity, rating

### Customization Interface
- **Visual Editor**: Drag-and-drop template customization
- **Brand Settings**: Logo, colors, fonts customization
- **Content Editing**: Text and data field modification
- **Layout Adjustments**: Component positioning and sizing
- **Preview Updates**: Real-time customization preview

### Import/Export Features
- **Template Packages**: Bundle templates with assets
- **Version Control**: Template versioning and change tracking
- **Sharing**: Template sharing via links or files
- **Marketplace**: Community template sharing
- **Backup/Restore**: Template collection backup

## Testing Requirements
- **Unit Tests**: Template engine and validation logic
- **Integration Tests**: Template loading and rendering
- **Visual Tests**: Template preview accuracy
- **E2E Tests**: Complete template workflows
- **Performance Tests**: Template loading and rendering speed

## Quality Gates
- TypeScript strict mode compliance
- ESLint zero warnings
- Jest test coverage 100%
- Visual regression tests for templates
- Template validation tests
- Performance benchmarks (< 2s template loading)

## Design Considerations

### Template Quality Standards
- **Professional Design**: High-quality visual design
- **Responsive Layout**: Works across different page sizes
- **Accessibility**: WCAG compliance for all templates
- **Brand Flexibility**: Easy customization for different brands
- **Data Compatibility**: Works with various data sources

### Performance Optimization
- **Lazy Loading**: Load templates on demand
- **Asset Optimization**: Compressed images and optimized assets
- **Caching**: Template caching for better performance
- **Bundling**: Efficient template packaging

### User Experience
- **Intuitive Interface**: Easy template browsing and selection
- **Quick Customization**: Streamlined customization workflow
- **Preview Accuracy**: What-you-see-is-what-you-get previews
- **Help Documentation**: Template usage guides and tutorials

---
**Agent Status**: Ready for Assignment
**Estimated Completion**: 4-6 days
**Dependencies**: Database Setup Agent (Task #5) for template persistence