export interface TemplateComponent {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, unknown>
  dataBinding?: DataBinding
}

export interface DataBinding {
  sourceType: 'static' | 'dynamic' | 'calculated'
  source?: string // Field name or data source identifier
  format?: string // Format string for display
  calculation?: string // Formula for calculated fields
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min' | 'none'
}

export interface TemplateData {
  name: string
  tables: Record<string, unknown[]>
  variables: Record<string, unknown>
  metadata: {
    createdAt: string
    description: string
    sampleDataIncluded: boolean
  }
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  components: TemplateComponent[]
  sampleData: TemplateData
  metadata: {
    createdAt: string
    updatedAt: string
    author: string
    version: string
    tags: string[]
    thumbnail?: string
    isBuiltIn: boolean
    testCoverage?: number
  }
  validation: {
    requiredDataSources: string[]
    requiredFields: Record<string, string[]> // table -> required fields
    validationRules: ValidationRule[]
  }
}

export interface ValidationRule {
  field: string
  type: 'required' | 'format' | 'range' | 'custom'
  message: string
  params?: Record<string, unknown>
}

export type TemplateCategory = 
  | 'business' 
  | 'financial' 
  | 'inventory' 
  | 'analytics' 
  | 'dashboard' 
  | 'custom'

export interface TemplatePreviewProps {
  template: ReportTemplate
  data?: TemplateData
  scale?: number
  interactive?: boolean
}

export interface TemplateValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missingData?: string[]
}

// Chart Configuration Types
export interface ChartDataConfig {
  xAxis: string
  yAxis: string | string[]
  series?: ChartSeries[]
  colors?: string[]
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter'
}

export interface ChartSeries {
  name: string
  dataKey: string
  color?: string
  type?: 'line' | 'bar' | 'area'
}

// KPI Configuration Types
export interface KPIConfig {
  value: string | number
  label: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
    period: string
  }
  target?: number
  format: 'number' | 'currency' | 'percentage'
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'neutral'
}

// Table Configuration Types
export interface TableConfig {
  columns: TableColumn[]
  data: unknown[]
  pagination?: boolean
  sorting?: boolean
  filtering?: boolean
  grouping?: string[]
}

export interface TableColumn {
  key: string
  header: string
  type: 'text' | 'number' | 'currency' | 'date' | 'percentage'
  sortable?: boolean
  filterable?: boolean
  width?: number
  alignment?: 'left' | 'center' | 'right'
  format?: string
}