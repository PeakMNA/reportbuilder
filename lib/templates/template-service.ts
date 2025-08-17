import { ReportTemplate, TemplateData, TemplateValidationResult } from '@/types/template'
import { DatabaseFactory } from './database-adapter'
import { builtInTemplates } from '@/data/sample-templates'

export class TemplateService {
  // Template CRUD Operations
  static async saveTemplate(template: ReportTemplate): Promise<void> {
    try {
      const db = await DatabaseFactory.getAdapter()
      await db.saveTemplate(template)
    } catch (error) {
      console.error('Failed to save template:', error)
      throw new Error('Failed to save template')
    }
  }

  static async getAllTemplates(): Promise<ReportTemplate[]> {
    try {
      const db = await DatabaseFactory.getAdapter()
      const templates = await db.getAllTemplates()
      
      if (templates.length === 0) {
        // Initialize with built-in templates if none exist
        await this.initializeBuiltInTemplates()
        return await db.getAllTemplates()
      }
      
      return templates
    } catch (error) {
      console.error('Failed to load templates:', error)
      return []
    }
  }

  static async getTemplateById(id: string): Promise<ReportTemplate | null> {
    try {
      const db = await DatabaseFactory.getAdapter()
      return await db.getTemplate(id)
    } catch (error) {
      console.error('Failed to get template:', error)
      return null
    }
  }

  static async deleteTemplate(id: string): Promise<void> {
    try {
      const db = await DatabaseFactory.getAdapter()
      await db.deleteTemplate(id)
    } catch (error) {
      console.error('Failed to delete template:', error)
      throw new Error('Failed to delete template')
    }
  }

  static async duplicateTemplate(id: string, newName?: string): Promise<ReportTemplate> {
    try {
      const template = await this.getTemplateById(id)
      if (!template) {
        throw new Error('Template not found')
      }

      const duplicated: ReportTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        name: newName || `${template.name} (Copy)`,
        metadata: {
          ...template.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isBuiltIn: false
        }
      }

      await this.saveTemplate(duplicated)
      return duplicated
    } catch (error) {
      console.error('Failed to duplicate template:', error)
      throw new Error('Failed to duplicate template')
    }
  }

  // Template Data Management
  static async saveTemplateData(templateId: string, data: TemplateData): Promise<void> {
    try {
      const db = await DatabaseFactory.getAdapter()
      await db.saveTemplateData(templateId, data)
    } catch (error) {
      console.error('Failed to save template data:', error)
      throw new Error('Failed to save template data')
    }
  }

  static async getTemplateData(templateId: string): Promise<TemplateData | null> {
    try {
      const db = await DatabaseFactory.getAdapter()
      return await db.getTemplateData(templateId)
    } catch (error) {
      console.error('Failed to get template data:', error)
      return null
    }
  }

  // Template Validation
  static validateTemplate(template: ReportTemplate, data?: TemplateData): TemplateValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const missingData: string[] = []

    // Basic template validation
    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required')
    }

    if (!template.components || template.components.length === 0) {
      warnings.push('Template has no components')
    }

    // Data validation
    if (data) {
      template.validation.requiredDataSources.forEach(source => {
        if (!data.tables[source]) {
          missingData.push(source)
        }
      })

      Object.entries(template.validation.requiredFields).forEach(([table, fields]) => {
        if (data.tables[table]) {
          const tableData = data.tables[table]
          if (tableData.length > 0) {
            const firstRow = tableData[0]
            fields.forEach(field => {
              if (!(field in firstRow)) {
                missingData.push(`${table}.${field}`)
              }
            })
          }
        }
      })
    }

    // Component validation
    template.components.forEach(component => {
      if (component.dataBinding?.sourceType === 'dynamic' && !component.dataBinding.source) {
        errors.push(`Component ${component.name} has dynamic binding but no data source`)
      }
    })

    return {
      isValid: errors.length === 0 && missingData.length === 0,
      errors,
      warnings,
      missingData: missingData.length > 0 ? missingData : undefined
    }
  }

  // Export/Import
  static exportTemplate(template: ReportTemplate): string {
    return JSON.stringify(template, null, 2)
  }

  static async importTemplate(templateJson: string): Promise<ReportTemplate> {
    try {
      const template = JSON.parse(templateJson) as ReportTemplate
      
      // Validate imported template structure
      if (!template.id || !template.name || !template.components) {
        throw new Error('Invalid template format')
      }

      // Generate new ID to avoid conflicts
      template.id = `template-${Date.now()}`
      template.metadata.updatedAt = new Date().toISOString()
      template.metadata.isBuiltIn = false

      await this.saveTemplate(template)
      return template
    } catch (error) {
      console.error('Failed to import template:', error)
      throw new Error('Failed to import template. Please check the file format.')
    }
  }

  // Initialize built-in templates
  private static async initializeBuiltInTemplates(): Promise<void> {
    try {
      const db = await DatabaseFactory.getAdapter()
      await db.saveMultipleTemplates(builtInTemplates)
      
      // Also save sample data for each template
      for (const template of builtInTemplates) {
        if (template.sampleData) {
          await db.saveTemplateData(template.id, template.sampleData)
        }
      }
    } catch (error) {
      console.error('Failed to initialize built-in templates:', error)
    }
  }

  // Category management
  static async getTemplatesByCategory(category: string): Promise<ReportTemplate[]> {
    try {
      const db = await DatabaseFactory.getAdapter()
      return await db.getTemplatesByCategory(category)
    } catch (error) {
      console.error('Failed to get templates by category:', error)
      return []
    }
  }

  static async getTemplateCategories(): Promise<string[]> {
    try {
      const templates = await this.getAllTemplates()
      const categories = new Set(templates.map(t => t.category))
      return Array.from(categories)
    } catch (error) {
      console.error('Failed to get template categories:', error)
      return []
    }
  }

  // Search functionality
  static async searchTemplates(query: string, filters?: {
    category?: string
    tags?: string[]
    author?: string
    isBuiltIn?: boolean
  }): Promise<ReportTemplate[]> {
    try {
      const db = await DatabaseFactory.getAdapter()
      return await db.searchTemplates(query, filters)
    } catch (error) {
      console.error('Failed to search templates:', error)
      return []
    }
  }

  // Database operations
  static async backupTemplates(): Promise<string> {
    try {
      const db = await DatabaseFactory.getAdapter()
      return await db.backup()
    } catch (error) {
      console.error('Failed to backup templates:', error)
      throw new Error('Failed to backup templates')
    }
  }

  static async restoreTemplates(backupData: string): Promise<void> {
    try {
      const db = await DatabaseFactory.getAdapter()
      await db.restore(backupData)
    } catch (error) {
      console.error('Failed to restore templates:', error)
      throw new Error('Failed to restore templates')
    }
  }
}