/**
 * Feature Registration System Types
 * 
 * Prevents UI/functionality gaps by requiring all features to be registered
 * with clear status tracking and validation requirements.
 */

export type FeatureStatus = 
  | 'planned'           // Feature is planned but not started
  | 'ui_only'          // UI exists but no functionality (WARNING STATE)
  | 'in_progress'      // Currently being implemented
  | 'functional'       // Backend functionality complete
  | 'testing'          // In testing phase
  | 'complete'         // Fully implemented and tested
  | 'blocked'          // Implementation blocked by dependency

export type FeatureType = 
  | 'component'        // UI component (buttons, forms, etc.)
  | 'page'            // Full page or route
  | 'api'             // Backend API endpoint
  | 'workflow'        // Multi-step user workflow
  | 'integration'     // External service integration
  | 'utility'         // Helper function or utility

export type FeaturePriority = 'critical' | 'high' | 'medium' | 'low'

export type FeatureComplexity = 'simple' | 'moderate' | 'complex'

export type FeatureCategory = 
  | 'core-functionality'    // Drag-drop, properties, component rendering
  | 'data-integration'      // CSV upload, data binding, data preview
  | 'export-output'         // PDF export, template save/load
  | 'user-experience'       // Zoom, new report, navigation, UI features
  | 'report-components'     // Individual report components (text, table, chart, etc.)
  | 'infrastructure'        // Framework features, utilities, system components

export interface FeatureRequirements {
  /** Functional specifications - what the feature must do */
  functional: string[]
  
  /** UI/UX requirements - user interface specifications */
  ui: string[]
  
  /** API requirements - backend endpoint specifications */
  api: string[]
  
  /** Testing requirements - how to validate the feature works */
  testing: string[]
  
  /** Dependencies - other features this depends on */
  dependencies: string[]
  
  /** Success criteria - measurable outcomes */
  successCriteria: string[]
}

export interface FeatureDocumentation {
  /** Feature requirements document */
  requirements?: string
  
  /** API documentation */
  apiDocs?: string
  
  /** UI/UX mockups or wireframes */
  uiSpecs?: string
  
  /** Testing plan and test cases */
  testPlan?: string
  
  /** Implementation notes */
  implementationNotes?: string
}

export interface FeatureValidation {
  /** Has functional backend implementation */
  hasFunctionalBackend: boolean
  
  /** Has complete UI implementation */
  hasCompleteUI: boolean
  
  /** Has adequate testing coverage */
  hasTestCoverage: boolean
  
  /** Has proper documentation */
  hasDocumentation: boolean
  
  /** Passes all acceptance criteria */
  passesAcceptanceCriteria: boolean
  
  /** Last validation date */
  lastValidated: Date
  
  /** Validation notes */
  validationNotes: string
}

export interface RegisteredFeature {
  /** Unique feature identifier */
  id: string
  
  /** Human-readable feature name */
  name: string
  
  /** Detailed feature description */
  description: string
  
  /** Feature type classification */
  type: FeatureType
  
  /** Feature category for organization */
  category: FeatureCategory
  
  /** Current implementation status */
  status: FeatureStatus
  
  /** Feature priority level */
  priority: FeaturePriority
  
  /** Implementation complexity assessment */
  complexity: FeatureComplexity
  
  /** Estimated implementation effort (hours) */
  estimatedHours: number
  
  /** Actual implementation effort (hours) */
  actualHours?: number
  
  /** Feature requirements breakdown */
  requirements: FeatureRequirements
  
  /** Documentation links and references */
  documentation: FeatureDocumentation
  
  /** Feature validation results */
  validation: FeatureValidation
  
  /** Assigned developer/team */
  assignee?: string
  
  /** Feature tags for categorization */
  tags: string[]
  
  /** File paths associated with this feature */
  filePaths: string[]
  
  /** Creation timestamp */
  createdAt: Date
  
  /** Last update timestamp */
  updatedAt: Date
  
  /** Status change history */
  statusHistory: Array<{
    status: FeatureStatus
    timestamp: Date
    reason: string
    updatedBy: string
  }>
  
  /** Implementation notes and comments */
  notes: string[]
}

export interface FeatureRegistryState {
  /** All registered features */
  features: Record<string, RegisteredFeature>
  
  /** Features by status for quick filtering */
  featuresByStatus: Record<FeatureStatus, string[]>
  
  /** Features by type for categorization */
  featuresByType: Record<FeatureType, string[]>
  
  /** Features by priority for prioritization */
  featuresByPriority: Record<FeaturePriority, string[]>
  
  /** Features by category for organization */
  featuresByCategory: Record<FeatureCategory, string[]>
  
  /** Currently selected feature for editing */
  selectedFeatureId: string | null
  
  /** Filter and search state */
  filters: {
    status: FeatureStatus[]
    type: FeatureType[]
    priority: FeaturePriority[]
    category: FeatureCategory[]
    assignee: string[]
    tags: string[]
    searchQuery: string
  }
  
  /** Registry statistics */
  stats: {
    totalFeatures: number
    completedFeatures: number
    uiOnlyFeatures: number
    blockedFeatures: number
    completionRate: number
    averageImplementationTime: number
  }
}

export interface FeatureRegistryActions {
  /** Register a new feature */
  registerFeature: (feature: Omit<RegisteredFeature, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => string
  
  /** Update feature status */
  updateFeatureStatus: (id: string, status: FeatureStatus, reason: string, updatedBy: string) => void
  
  /** Update feature properties */
  updateFeature: (id: string, updates: Partial<RegisteredFeature>) => void
  
  /** Delete feature */
  deleteFeature: (id: string) => void
  
  /** Validate feature implementation */
  validateFeature: (id: string, validation: Partial<FeatureValidation>) => void
  
  /** Add implementation note */
  addFeatureNote: (id: string, note: string) => void
  
  /** Update feature files */
  updateFeatureFiles: (id: string, filePaths: string[]) => void
  
  /** Set filters */
  setFilters: (filters: Partial<FeatureRegistryState['filters']>) => void
  
  /** Select feature */
  selectFeature: (id: string | null) => void
  
  /** Get features by criteria */
  getFeaturesByStatus: (status: FeatureStatus) => RegisteredFeature[]
  getFeaturesByType: (type: FeatureType) => RegisteredFeature[]
  getFeaturesByPriority: (priority: FeaturePriority) => RegisteredFeature[]
  getFeaturesByCategory: (category: FeatureCategory) => RegisteredFeature[]
  
  /** Get filtered features */
  getFilteredFeatures: () => RegisteredFeature[]
  
  /** Search features */
  searchFeatures: (query: string) => RegisteredFeature[]
  
  /** Get registry statistics */
  getStats: () => FeatureRegistryState['stats']
  
  /** Export/import registry data */
  exportRegistry: () => string
  importRegistry: (data: string) => void
}

export interface FeatureTemplate {
  /** Template name */
  name: string
  
  /** Template description */
  description: string
  
  /** Feature type this template is for */
  type: FeatureType
  
  /** Default requirements structure */
  defaultRequirements: Partial<FeatureRequirements>
  
  /** Suggested complexity level */
  suggestedComplexity: FeatureComplexity
  
  /** Estimated hours for this type */
  estimatedHours: number
  
  /** Required documentation types */
  requiredDocs: Array<keyof FeatureDocumentation>
  
  /** Suggested tags */
  suggestedTags: string[]
}

/** Pre-defined feature templates for common patterns */
export const FEATURE_TEMPLATES: Record<string, FeatureTemplate> = {
  uiComponent: {
    name: 'UI Component',
    description: 'Reusable user interface component',
    type: 'component',
    defaultRequirements: {
      functional: ['Render correctly', 'Handle props appropriately', 'Support accessibility'],
      ui: ['Responsive design', 'Consistent styling', 'Interactive states'],
      testing: ['Unit tests', 'Visual regression tests', 'Accessibility tests']
    },
    suggestedComplexity: 'simple',
    estimatedHours: 4,
    requiredDocs: ['requirements', 'uiSpecs'],
    suggestedTags: ['component', 'ui', 'reusable']
  },
  
  reportComponent: {
    name: 'Report Builder Component',
    description: 'Specialized component for report building',
    type: 'component',
    defaultRequirements: {
      functional: ['Drag and drop support', 'Property panel integration', 'Data binding'],
      ui: ['Visual feedback', 'Selection states', 'Property controls'],
      testing: ['Drag/drop tests', 'Property tests', 'Data binding tests']
    },
    suggestedComplexity: 'moderate',
    estimatedHours: 8,
    requiredDocs: ['requirements', 'uiSpecs', 'implementationNotes'],
    suggestedTags: ['report', 'component', 'designer']
  },
  
  apiEndpoint: {
    name: 'API Endpoint',
    description: 'Backend API endpoint',
    type: 'api',
    defaultRequirements: {
      functional: ['Handle requests', 'Validate input', 'Return appropriate responses'],
      api: ['OpenAPI specification', 'Error handling', 'Authentication'],
      testing: ['Unit tests', 'Integration tests', 'API tests']
    },
    suggestedComplexity: 'moderate',
    estimatedHours: 6,
    requiredDocs: ['requirements', 'apiDocs'],
    suggestedTags: ['api', 'backend', 'endpoint']
  },
  
  userWorkflow: {
    name: 'User Workflow',
    description: 'Multi-step user interaction workflow',
    type: 'workflow',
    defaultRequirements: {
      functional: ['Step progression', 'State management', 'Error handling'],
      ui: ['Step indicators', 'Navigation controls', 'Progress feedback'],
      testing: ['End-to-end tests', 'User journey tests', 'Error scenario tests']
    },
    suggestedComplexity: 'complex',
    estimatedHours: 16,
    requiredDocs: ['requirements', 'uiSpecs', 'testPlan'],
    suggestedTags: ['workflow', 'user-journey', 'multi-step']
  }
}