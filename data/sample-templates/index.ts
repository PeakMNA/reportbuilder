import { ReportTemplate } from '@/types/template'
import { invoiceTemplate } from './invoice-template'
import { salesTemplate } from './sales-template'
import { inventoryTemplate } from './inventory-template'
import { dashboardTemplate } from './dashboard-template'
import { sampleTemplateData } from './sample-data'

// Export individual templates
export { invoiceTemplate } from './invoice-template'
export { salesTemplate } from './sales-template'
export { inventoryTemplate } from './inventory-template'
export { dashboardTemplate } from './dashboard-template'
export { sampleTemplateData } from './sample-data'

// Export all built-in templates as an array
export const builtInTemplates: ReportTemplate[] = [
  invoiceTemplate,
  salesTemplate,
  inventoryTemplate,
  dashboardTemplate
]

// Template registry for easy lookup
export const templateRegistry = {
  'template-invoice-001': invoiceTemplate,
  'template-sales-001': salesTemplate,
  'template-inventory-001': inventoryTemplate,
  'template-dashboard-001': dashboardTemplate
}

// Template categories
export const templateCategories = {
  business: [invoiceTemplate],
  analytics: [salesTemplate],
  inventory: [inventoryTemplate],
  dashboard: [dashboardTemplate]
}

// Template metadata summary
export const templateSummary = {
  total: builtInTemplates.length,
  categories: Object.keys(templateCategories).length,
  withSampleData: builtInTemplates.filter(t => t.sampleData).length,
  withValidation: builtInTemplates.filter(t => t.validation.validationRules.length > 0).length
}

// Validation function for all templates
export function validateAllTemplates(): { 
  valid: number
  invalid: number
  errors: Record<string, string[]>
} {
  let valid = 0
  let invalid = 0
  const errors: Record<string, string[]> = {}

  builtInTemplates.forEach(template => {
    const templateErrors: string[] = []

    // Basic validation
    if (!template.name || template.name.trim().length === 0) {
      templateErrors.push('Template name is required')
    }

    if (!template.components || template.components.length === 0) {
      templateErrors.push('Template must have at least one component')
    }

    if (!template.sampleData) {
      templateErrors.push('Template must include sample data')
    }

    if (!template.validation || !template.validation.requiredDataSources) {
      templateErrors.push('Template must have validation rules')
    }

    // Component validation
    template.components.forEach((component, index) => {
      if (!component.id || !component.type || !component.name) {
        templateErrors.push(`Component ${index} is missing required fields`)
      }

      if (component.x < 0 || component.y < 0 || component.width <= 0 || component.height <= 0) {
        templateErrors.push(`Component ${component.name} has invalid dimensions`)
      }
    })

    if (templateErrors.length > 0) {
      errors[template.id] = templateErrors
      invalid++
    } else {
      valid++
    }
  })

  return { valid, invalid, errors }
}

// Get template by category
export function getTemplatesByCategory(category: string): ReportTemplate[] {
  return builtInTemplates.filter(template => template.category === category)
}

// Search templates
export function searchTemplates(
  query: string,
  filters?: {
    category?: string
    tags?: string[]
    hasValidation?: boolean
    hasSampleData?: boolean
  }
): ReportTemplate[] {
  return builtInTemplates.filter(template => {
    // Text search
    const matchesQuery = !query || 
      template.name.toLowerCase().includes(query.toLowerCase()) ||
      template.description.toLowerCase().includes(query.toLowerCase()) ||
      template.metadata.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))

    // Category filter
    const matchesCategory = !filters?.category || template.category === filters.category

    // Tags filter
    const matchesTags = !filters?.tags || 
      filters.tags.some(tag => template.metadata.tags.includes(tag))

    // Validation filter
    const matchesValidation = filters?.hasValidation === undefined || 
      (filters.hasValidation ? template.validation.validationRules.length > 0 : template.validation.validationRules.length === 0)

    // Sample data filter
    const matchesSampleData = filters?.hasSampleData === undefined ||
      (filters.hasSampleData ? !!template.sampleData : !template.sampleData)

    return matchesQuery && matchesCategory && matchesTags && matchesValidation && matchesSampleData
  })
}