import { ReportTemplate, TemplateData } from '@/types/template'

// Database interface for template storage
export interface DatabaseAdapter {
  // Template operations
  saveTemplate(template: ReportTemplate): Promise<string>
  getTemplate(id: string): Promise<ReportTemplate | null>
  getAllTemplates(): Promise<ReportTemplate[]>
  updateTemplate(id: string, template: Partial<ReportTemplate>): Promise<void>
  deleteTemplate(id: string): Promise<void>
  
  // Data operations
  saveTemplateData(templateId: string, data: TemplateData): Promise<void>
  getTemplateData(templateId: string): Promise<TemplateData | null>
  
  // Search operations
  searchTemplates(query: string, filters?: unknown): Promise<ReportTemplate[]>
  getTemplatesByCategory(category: string): Promise<ReportTemplate[]>
  
  // Batch operations
  saveMultipleTemplates(templates: ReportTemplate[]): Promise<string[]>
  
  // Database maintenance
  initializeDatabase(): Promise<void>
  backup(): Promise<string>
  restore(backupData: string): Promise<void>
}

// Local Storage implementation (for demo/development)
export class LocalStorageAdapter implements DatabaseAdapter {
  private static TEMPLATES_KEY = 'reportbuilder_templates'
  private static DATA_KEY = 'reportbuilder_template_data'
  private static METADATA_KEY = 'reportbuilder_db_metadata'

  async initializeDatabase(): Promise<void> {
    // Initialize metadata if not exists
    const metadata = localStorage.getItem(LocalStorageAdapter.METADATA_KEY)
    if (!metadata) {
      const initialMetadata = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastBackup: null,
        templateCount: 0,
        dataCount: 0
      }
      localStorage.setItem(LocalStorageAdapter.METADATA_KEY, JSON.stringify(initialMetadata))
    }
  }

  async saveTemplate(template: ReportTemplate): Promise<string> {
    try {
      const templates = await this.getAllTemplates()
      const existingIndex = templates.findIndex(t => t.id === template.id)
      
      const updatedTemplate = {
        ...template,
        metadata: {
          ...template.metadata,
          updatedAt: new Date().toISOString()
        }
      }

      if (existingIndex >= 0) {
        templates[existingIndex] = updatedTemplate
      } else {
        templates.push(updatedTemplate)
      }

      localStorage.setItem(LocalStorageAdapter.TEMPLATES_KEY, JSON.stringify(templates))
      await this.updateMetadata()
      
      return template.id
    } catch (error) {
      console.error('Failed to save template:', error)
      throw new Error(`Failed to save template: ${error}`)
    }
  }

  async getTemplate(id: string): Promise<ReportTemplate | null> {
    try {
      const templates = await this.getAllTemplates()
      return templates.find(t => t.id === id) || null
    } catch (error) {
      console.error('Failed to get template:', error)
      throw new Error(`Failed to get template: ${error}`)
    }
  }

  async getAllTemplates(): Promise<ReportTemplate[]> {
    try {
      const stored = localStorage.getItem(LocalStorageAdapter.TEMPLATES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get all templates:', error)
      return []
    }
  }

  async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<void> {
    try {
      const template = await this.getTemplate(id)
      if (!template) {
        throw new Error('Template not found')
      }

      const updatedTemplate = {
        ...template,
        ...updates,
        metadata: {
          ...template.metadata,
          ...updates.metadata,
          updatedAt: new Date().toISOString()
        }
      }

      await this.saveTemplate(updatedTemplate)
    } catch (error) {
      console.error('Failed to update template:', error)
      throw new Error(`Failed to update template: ${error}`)
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      const templates = await this.getAllTemplates()
      const filtered = templates.filter(t => t.id !== id)
      localStorage.setItem(LocalStorageAdapter.TEMPLATES_KEY, JSON.stringify(filtered))
      
      // Also delete associated data
      const allData = this.getAllData()
      delete allData[id]
      localStorage.setItem(LocalStorageAdapter.DATA_KEY, JSON.stringify(allData))
      
      await this.updateMetadata()
    } catch (error) {
      console.error('Failed to delete template:', error)
      throw new Error(`Failed to delete template: ${error}`)
    }
  }

  async saveTemplateData(templateId: string, data: TemplateData): Promise<void> {
    try {
      const allData = this.getAllData()
      allData[templateId] = data
      localStorage.setItem(LocalStorageAdapter.DATA_KEY, JSON.stringify(allData))
      await this.updateMetadata()
    } catch (error) {
      console.error('Failed to save template data:', error)
      throw new Error(`Failed to save template data: ${error}`)
    }
  }

  async getTemplateData(templateId: string): Promise<TemplateData | null> {
    try {
      const allData = this.getAllData()
      return allData[templateId] || null
    } catch (error) {
      console.error('Failed to get template data:', error)
      return null
    }
  }

  async searchTemplates(query: string, filters?: unknown): Promise<ReportTemplate[]> {
    try {
      const templates = await this.getAllTemplates()
      
      return templates.filter(template => {
        // Text search
        const matchesQuery = !query || 
          template.name.toLowerCase().includes(query.toLowerCase()) ||
          template.description.toLowerCase().includes(query.toLowerCase()) ||
          template.metadata.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))

        // Apply filters
        const matchesCategory = !filters?.category || template.category === filters.category
        const matchesTags = !filters?.tags || 
          filters.tags.some((tag: string) => template.metadata.tags.includes(tag))
        const matchesAuthor = !filters?.author || template.metadata.author === filters.author
        const matchesBuiltIn = filters?.isBuiltIn === undefined || 
          template.metadata.isBuiltIn === filters.isBuiltIn

        return matchesQuery && matchesCategory && matchesTags && matchesAuthor && matchesBuiltIn
      })
    } catch (error) {
      console.error('Failed to search templates:', error)
      return []
    }
  }

  async getTemplatesByCategory(category: string): Promise<ReportTemplate[]> {
    try {
      const templates = await this.getAllTemplates()
      return templates.filter(t => t.category === category)
    } catch (error) {
      console.error('Failed to get templates by category:', error)
      return []
    }
  }

  async saveMultipleTemplates(templates: ReportTemplate[]): Promise<string[]> {
    try {
      const existingTemplates = await this.getAllTemplates()
      const updatedTemplates = [...existingTemplates]
      const savedIds: string[] = []

      for (const template of templates) {
        const existingIndex = updatedTemplates.findIndex(t => t.id === template.id)
        const updatedTemplate = {
          ...template,
          metadata: {
            ...template.metadata,
            updatedAt: new Date().toISOString()
          }
        }

        if (existingIndex >= 0) {
          updatedTemplates[existingIndex] = updatedTemplate
        } else {
          updatedTemplates.push(updatedTemplate)
        }
        
        savedIds.push(template.id)
      }

      localStorage.setItem(LocalStorageAdapter.TEMPLATES_KEY, JSON.stringify(updatedTemplates))
      await this.updateMetadata()

      return savedIds
    } catch (error) {
      console.error('Failed to save multiple templates:', error)
      throw new Error(`Failed to save multiple templates: ${error}`)
    }
  }

  async backup(): Promise<string> {
    try {
      const templates = await this.getAllTemplates()
      const data = this.getAllData()
      const metadata = this.getMetadata()

      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        templates,
        data,
        metadata
      }

      return JSON.stringify(backup, null, 2)
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw new Error(`Failed to create backup: ${error}`)
    }
  }

  async restore(backupData: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData)
      
      // Validate backup structure
      if (!backup.templates || !backup.data || !backup.metadata) {
        throw new Error('Invalid backup format')
      }

      // Restore data
      localStorage.setItem(LocalStorageAdapter.TEMPLATES_KEY, JSON.stringify(backup.templates))
      localStorage.setItem(LocalStorageAdapter.DATA_KEY, JSON.stringify(backup.data))
      
      // Update metadata
      const metadata = {
        ...backup.metadata,
        lastRestore: new Date().toISOString()
      }
      localStorage.setItem(LocalStorageAdapter.METADATA_KEY, JSON.stringify(metadata))

    } catch (error) {
      console.error('Failed to restore backup:', error)
      throw new Error(`Failed to restore backup: ${error}`)
    }
  }

  // Private helper methods
  private getAllData(): Record<string, TemplateData> {
    try {
      const stored = localStorage.getItem(LocalStorageAdapter.DATA_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to get all data:', error)
      return {}
    }
  }

  private getMetadata(): unknown {
    try {
      const stored = localStorage.getItem(LocalStorageAdapter.METADATA_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to get metadata:', error)
      return null
    }
  }

  private async updateMetadata(): Promise<void> {
    try {
      const templates = await this.getAllTemplates()
      const data = this.getAllData()
      
      const metadata = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        templateCount: templates.length,
        dataCount: Object.keys(data).length,
        lastBackup: this.getMetadata()?.lastBackup || null
      }

      localStorage.setItem(LocalStorageAdapter.METADATA_KEY, JSON.stringify(metadata))
    } catch (error) {
      console.error('Failed to update metadata:', error)
    }
  }
}

// Database factory
export class DatabaseFactory {
  private static adapter: DatabaseAdapter | null = null

  static async getAdapter(): Promise<DatabaseAdapter> {
    if (!this.adapter) {
      // For now, use LocalStorage. In production, this could be replaced with:
      // - IndexedDB adapter
      // - Firebase adapter
      // - Supabase adapter
      // - Custom API adapter
      this.adapter = new LocalStorageAdapter()
      await this.adapter.initializeDatabase()
    }
    return this.adapter
  }

  static setAdapter(adapter: DatabaseAdapter): void {
    this.adapter = adapter
  }
}

// Database statistics and monitoring
export class DatabaseMonitor {
  private adapter: DatabaseAdapter

  constructor(adapter: DatabaseAdapter) {
    this.adapter = adapter
  }

  async getStatistics(): Promise<{
    totalTemplates: number
    templatesByCategory: Record<string, number>
    builtInTemplates: number
    customTemplates: number
    templatesWithData: number
    averageComponentsPerTemplate: number
    storageUsage: number
  }> {
    try {
      const templates = await this.adapter.getAllTemplates()
      
      const stats = {
        totalTemplates: templates.length,
        templatesByCategory: {},
        builtInTemplates: templates.filter(t => t.metadata.isBuiltIn).length,
        customTemplates: templates.filter(t => !t.metadata.isBuiltIn).length,
        templatesWithData: 0,
        averageComponentsPerTemplate: 0,
        storageUsage: 0
      }

      // Category breakdown
      templates.forEach(template => {
        const category = template.category
        stats.templatesByCategory[category] = (stats.templatesByCategory[category] || 0) + 1
      })

      // Templates with data
      for (const template of templates) {
        const data = await this.adapter.getTemplateData(template.id)
        if (data) {
          stats.templatesWithData++
        }
      }

      // Average components
      if (templates.length > 0) {
        const totalComponents = templates.reduce((sum, t) => sum + t.components.length, 0)
        stats.averageComponentsPerTemplate = Math.round(totalComponents / templates.length * 100) / 100
      }

      // Storage usage (approximate for localStorage)
      const templatesSize = JSON.stringify(templates).length
      const dataSize = JSON.stringify(await this.getAllTemplateData()).length
      stats.storageUsage = templatesSize + dataSize

      return stats
    } catch (error) {
      console.error('Failed to get database statistics:', error)
      throw new Error(`Failed to get database statistics: ${error}`)
    }
  }

  private async getAllTemplateData(): Promise<Record<string, TemplateData>> {
    const templates = await this.adapter.getAllTemplates()
    const allData: Record<string, TemplateData> = {}
    
    for (const template of templates) {
      const data = await this.adapter.getTemplateData(template.id)
      if (data) {
        allData[template.id] = data
      }
    }
    
    return allData
  }

  async validateIntegrity(): Promise<{
    isValid: boolean
    issues: string[]
    orphanedData: string[]
    missingData: string[]
  }> {
    try {
      const templates = await this.adapter.getAllTemplates()
      const allData = await this.getAllTemplateData()
      
      const issues: string[] = []
      const orphanedData: string[] = []
      const missingData: string[] = []

      // Check for orphaned data (data without templates)
      Object.keys(allData).forEach(templateId => {
        if (!templates.find(t => t.id === templateId)) {
          orphanedData.push(templateId)
        }
      })

      // Check for missing sample data in built-in templates
      templates.forEach(template => {
        if (template.metadata.isBuiltIn && !template.sampleData) {
          missingData.push(template.id)
        }
      })

      // Check template validity
      templates.forEach(template => {
        if (!template.id || !template.name || !template.components) {
          issues.push(`Template ${template.id || 'unknown'} has missing required fields`)
        }

        if (template.components.length === 0) {
          issues.push(`Template ${template.name} has no components`)
        }
      })

      return {
        isValid: issues.length === 0 && orphanedData.length === 0,
        issues,
        orphanedData,
        missingData
      }
    } catch (error) {
      console.error('Failed to validate database integrity:', error)
      return {
        isValid: false,
        issues: [`Database validation failed: ${error}`],
        orphanedData: [],
        missingData: []
      }
    }
  }
}