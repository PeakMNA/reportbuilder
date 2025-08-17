import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { TemplateService } from '@/lib/templates/template-service'
import { DatabaseFactory, LocalStorageAdapter, DatabaseMonitor } from '@/lib/templates/database-adapter'
import { builtInTemplates, validateAllTemplates } from '@/data/sample-templates'
import { ReportTemplate, TemplateData } from '@/types/template'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Template Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    // Reset the database factory
    DatabaseFactory.setAdapter(new LocalStorageAdapter())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Template Lifecycle', () => {
    test('should handle complete template lifecycle: create → save → load → update → delete', async () => {
      // Step 1: Create a new custom template
      const customTemplate: ReportTemplate = {
        id: 'custom-test-template',
        name: 'Test Custom Template',
        description: 'A template created for testing',
        category: 'custom',
        components: [
          {
            id: 'test-text',
            type: 'text-label',
            name: 'Test Text',
            x: 50,
            y: 50,
            width: 200,
            height: 30,
            properties: {
              text: 'Hello World',
              fontSize: 14
            }
          }
        ],
        sampleData: {
          name: 'Test Data',
          tables: {
            testTable: [{ id: 1, name: 'Test Item' }]
          },
          variables: {
            testVar: 'Test Value'
          },
          metadata: {
            createdAt: new Date().toISOString(),
            description: 'Test sample data',
            sampleDataIncluded: true
          }
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'Test User',
          version: '1.0.0',
          tags: ['test', 'custom'],
          isBuiltIn: false
        },
        validation: {
          requiredDataSources: ['testTable'],
          requiredFields: {
            testTable: ['id', 'name']
          },
          validationRules: []
        }
      }

      // Step 2: Save the template
      await TemplateService.saveTemplate(customTemplate)
      expect(localStorageMock.setItem).toHaveBeenCalled()

      // Step 3: Load all templates and verify it exists
      const allTemplates = await TemplateService.getAllTemplates()
      const savedTemplate = allTemplates.find(t => t.id === 'custom-test-template')
      expect(savedTemplate).toBeDefined()
      expect(savedTemplate?.name).toBe('Test Custom Template')

      // Step 4: Get template by ID
      const loadedTemplate = await TemplateService.getTemplateById('custom-test-template')
      expect(loadedTemplate).toBeDefined()
      expect(loadedTemplate?.name).toBe('Test Custom Template')

      // Step 5: Update the template
      const updatedTemplate = {
        ...customTemplate,
        name: 'Updated Test Template',
        description: 'Updated description'
      }
      await TemplateService.saveTemplate(updatedTemplate)

      const reloadedTemplate = await TemplateService.getTemplateById('custom-test-template')
      expect(reloadedTemplate?.name).toBe('Updated Test Template')
      expect(reloadedTemplate?.description).toBe('Updated description')

      // Step 6: Save template data
      const templateData: TemplateData = {
        name: 'Updated Test Data',
        tables: {
          testTable: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ]
        },
        variables: {
          testVar: 'Updated Value'
        },
        metadata: {
          createdAt: new Date().toISOString(),
          description: 'Updated test data',
          sampleDataIncluded: true
        }
      }
      await TemplateService.saveTemplateData('custom-test-template', templateData)

      // Step 7: Load template data
      const loadedData = await TemplateService.getTemplateData('custom-test-template')
      expect(loadedData?.name).toBe('Updated Test Data')
      expect(loadedData?.tables.testTable).toHaveLength(2)

      // Step 8: Delete the template
      await TemplateService.deleteTemplate('custom-test-template')

      const templatesAfterDelete = await TemplateService.getAllTemplates()
      const deletedTemplate = templatesAfterDelete.find(t => t.id === 'custom-test-template')
      expect(deletedTemplate).toBeUndefined()
    })

    test('should handle template duplication workflow', async () => {
      // Initialize with built-in templates
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

      // Duplicate a built-in template
      const original = builtInTemplates[0]
      const duplicated = await TemplateService.duplicateTemplate(original.id, 'Duplicated Invoice')

      expect(duplicated.name).toBe('Duplicated Invoice')
      expect(duplicated.id).not.toBe(original.id)
      expect(duplicated.metadata.isBuiltIn).toBe(false)

      // Verify the duplicated template exists
      const loadedDuplicate = await TemplateService.getTemplateById(duplicated.id)
      expect(loadedDuplicate).toBeDefined()
      expect(loadedDuplicate?.name).toBe('Duplicated Invoice')
    })

    test('should handle export/import workflow', async () => {
      // Start with a template
      const template = builtInTemplates[0]

      // Export the template
      const exported = TemplateService.exportTemplate(template)
      expect(typeof exported).toBe('string')
      expect(() => JSON.parse(exported)).not.toThrow()

      // Clear existing templates
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      // Import the template
      const imported = await TemplateService.importTemplate(exported)
      expect(imported.name).toBe(template.name)
      expect(imported.id).not.toBe(template.id) // Should have new ID
      expect(imported.metadata.isBuiltIn).toBe(false)

      // Verify the imported template is saved
      const allTemplates = await TemplateService.getAllTemplates()
      const importedTemplate = allTemplates.find(t => t.id === imported.id)
      expect(importedTemplate).toBeDefined()
    })
  })

  describe('Database Operations Integration', () => {
    test('should handle database initialization and built-in template loading', async () => {
      // Mock empty database
      localStorageMock.getItem.mockReturnValue(null)

      // Get all templates (should trigger initialization)
      const templates = await TemplateService.getAllTemplates()

      // Should load built-in templates
      expect(templates).toHaveLength(4)
      expect(templates.every(t => t.metadata.isBuiltIn)).toBe(true)

      // Should have saved to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    test('should handle backup and restore workflow', async () => {
      // Setup initial data
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

      // Create backup
      const backup = await TemplateService.backupTemplates()
      expect(typeof backup).toBe('string')

      const parsed = JSON.parse(backup)
      expect(parsed.templates).toHaveLength(4)
      expect(parsed.version).toBeDefined()
      expect(parsed.timestamp).toBeDefined()

      // Clear database
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      // Restore from backup
      await TemplateService.restoreTemplates(backup)

      // Verify restoration
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('template-invoice-001')
      )
    })

    test('should handle database monitoring and statistics', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

      const db = await DatabaseFactory.getAdapter()
      const monitor = new DatabaseMonitor(db)

      // Get statistics
      const stats = await monitor.getStatistics()
      expect(stats.totalTemplates).toBe(4)
      expect(stats.builtInTemplates).toBe(4)
      expect(stats.customTemplates).toBe(0)
      expect(stats.templatesByCategory.business).toBe(1)
      expect(stats.averageComponentsPerTemplate).toBeGreaterThan(0)

      // Validate integrity
      const integrity = await monitor.validateIntegrity()
      expect(integrity.isValid).toBe(true)
      expect(integrity.issues).toHaveLength(0)
      expect(integrity.orphanedData).toHaveLength(0)
    })
  })

  describe('Search and Filtering Integration', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))
    })

    test('should handle comprehensive search workflow', async () => {
      // Search by text
      const textResults = await TemplateService.searchTemplates('invoice')
      expect(textResults.length).toBeGreaterThan(0)
      expect(textResults.some(t => t.name.toLowerCase().includes('invoice'))).toBe(true)

      // Search by category
      const categoryResults = await TemplateService.searchTemplates('', { category: 'business' })
      expect(categoryResults.every(t => t.category === 'business')).toBe(true)

      // Search by tags
      const tagResults = await TemplateService.searchTemplates('', { tags: ['analytics'] })
      expect(tagResults.every(t => t.metadata.tags.includes('analytics'))).toBe(true)

      // Search by author
      const authorResults = await TemplateService.searchTemplates('', { author: 'System' })
      expect(authorResults.every(t => t.metadata.author === 'System')).toBe(true)

      // Search by built-in flag
      const builtInResults = await TemplateService.searchTemplates('', { isBuiltIn: true })
      expect(builtInResults.every(t => t.metadata.isBuiltIn === true)).toBe(true)

      // Combined search
      const combinedResults = await TemplateService.searchTemplates('sales', {
        category: 'analytics',
        tags: ['report']
      })
      expect(combinedResults.every(t => 
        t.category === 'analytics' && 
        t.metadata.tags.includes('report') &&
        (t.name.toLowerCase().includes('sales') || 
         t.description.toLowerCase().includes('sales') ||
         t.metadata.tags.some(tag => tag.toLowerCase().includes('sales')))
      )).toBe(true)
    })

    test('should handle category management', async () => {
      // Get templates by category
      const businessTemplates = await TemplateService.getTemplatesByCategory('business')
      expect(businessTemplates.every(t => t.category === 'business')).toBe(true)

      const analyticsTemplates = await TemplateService.getTemplatesByCategory('analytics')
      expect(analyticsTemplates.every(t => t.category === 'analytics')).toBe(true)

      // Get all categories
      const categories = await TemplateService.getTemplateCategories()
      expect(categories).toContain('business')
      expect(categories).toContain('analytics')
      expect(categories).toContain('inventory')
      expect(categories).toContain('dashboard')
    })
  })

  describe('Validation Integration', () => {
    test('should validate all built-in templates successfully', () => {
      const validation = validateAllTemplates()
      expect(validation.valid).toBe(4)
      expect(validation.invalid).toBe(0)
      expect(Object.keys(validation.errors)).toHaveLength(0)
    })

    test('should validate individual templates with sample data', () => {
      builtInTemplates.forEach(template => {
        const validation = TemplateService.validateTemplate(template, template.sampleData)
        expect(validation.isValid).toBe(true)
        expect(validation.errors).toHaveLength(0)
      })
    })

    test('should detect validation errors', () => {
      const invalidTemplate: ReportTemplate = {
        ...builtInTemplates[0],
        name: '', // Invalid
        components: [] // Invalid
      }

      const validation = TemplateService.validateTemplate(invalidTemplate)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    test('should detect missing data sources', () => {
      const template = builtInTemplates[0]
      const incompleteData = {
        ...template.sampleData,
        tables: {} // Missing required tables
      }

      const validation = TemplateService.validateTemplate(template, incompleteData)
      expect(validation.isValid).toBe(false)
      expect(validation.missingData).toBeDefined()
      expect(validation.missingData?.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle storage errors gracefully', async () => {
      // Mock storage error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw but return empty array
      const templates = await TemplateService.getAllTemplates()
      expect(templates).toHaveLength(0)
    })

    test('should handle invalid JSON gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const templates = await TemplateService.getAllTemplates()
      expect(templates).toHaveLength(0)
    })

    test('should handle missing template operations gracefully', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      // Non-existent template operations
      const template = await TemplateService.getTemplateById('non-existent')
      expect(template).toBeNull()

      const data = await TemplateService.getTemplateData('non-existent')
      expect(data).toBeNull()

      await expect(TemplateService.duplicateTemplate('non-existent'))
        .rejects.toThrow('Template not found')
    })

    test('should handle invalid import data gracefully', async () => {
      await expect(TemplateService.importTemplate('invalid json'))
        .rejects.toThrow()

      await expect(TemplateService.importTemplate(JSON.stringify({ invalid: 'template' })))
        .rejects.toThrow('Invalid template format')
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle large numbers of templates efficiently', async () => {
      // Create a large number of templates
      const manyTemplates = Array.from({ length: 100 }, (_, i) => ({
        ...builtInTemplates[0],
        id: `template-${i}`,
        name: `Template ${i}`,
        metadata: {
          ...builtInTemplates[0].metadata,
          isBuiltIn: false
        }
      }))

      localStorageMock.getItem.mockReturnValue(JSON.stringify(manyTemplates))

      const start = Date.now()
      
      // Test operations that should be fast
      const allTemplates = await TemplateService.getAllTemplates()
      const searchResults = await TemplateService.searchTemplates('Template')
      const categories = await TemplateService.getTemplateCategories()
      
      const end = Date.now()
      const duration = end - start

      expect(allTemplates).toHaveLength(100)
      expect(searchResults).toHaveLength(100)
      expect(categories).toContain('business')
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100)
    })

    test('should handle concurrent operations', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

      // Simulate concurrent operations
      const promises = [
        TemplateService.getAllTemplates(),
        TemplateService.getTemplateCategories(),
        TemplateService.searchTemplates('invoice'),
        TemplateService.getTemplatesByCategory('business'),
        TemplateService.getTemplateById('template-invoice-001')
      ]

      const results = await Promise.all(promises)

      expect(results[0]).toHaveLength(4) // getAllTemplates
      expect(results[1]).toContain('business') // getTemplateCategories
      expect(results[2].length).toBeGreaterThan(0) // searchTemplates
      expect(results[3].every(t => t.category === 'business')).toBe(true) // getTemplatesByCategory
      expect(results[4]?.name).toBe('Professional Invoice Template') // getTemplateById
    })
  })
})