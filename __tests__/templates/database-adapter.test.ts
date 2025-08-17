import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { LocalStorageAdapter, DatabaseFactory, DatabaseMonitor } from '@/lib/templates/database-adapter'
import { ReportTemplate, TemplateData } from '@/types/template'
import { builtInTemplates } from '@/data/sample-templates'

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

describe('Database Adapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    adapter = new LocalStorageAdapter()
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('LocalStorageAdapter', () => {
    describe('Initialization', () => {
      test('initializeDatabase should create metadata if not exists', async () => {
        localStorageMock.getItem.mockReturnValue(null)

        await adapter.initializeDatabase()

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          expect.stringContaining('metadata'),
          expect.stringContaining('version')
        )
      })

      test('initializeDatabase should not overwrite existing metadata', async () => {
        const existingMetadata = { version: '1.0.0', createdAt: '2024-01-01' }
        localStorageMock.getItem.mockReturnValue(JSON.stringify(existingMetadata))

        await adapter.initializeDatabase()

        expect(localStorageMock.setItem).not.toHaveBeenCalled()
      })
    })

    describe('Template Operations', () => {
      test('saveTemplate should save new template', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

        const template = builtInTemplates[0]
        const id = await adapter.saveTemplate(template)

        expect(id).toBe(template.id)
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining(template.id)
        )
      })

      test('saveTemplate should update existing template', async () => {
        const existingTemplate = { ...builtInTemplates[0], name: 'Original' }
        localStorageMock.getItem.mockReturnValue(JSON.stringify([existingTemplate]))

        const updatedTemplate = { ...existingTemplate, name: 'Updated' }
        await adapter.saveTemplate(updatedTemplate)

        expect(localStorageMock.setItem).toHaveBeenCalled()
        const savedData = (localStorageMock.setItem as jest.Mock).mock.calls[0][1]
        const templates = JSON.parse(savedData)
        expect(templates[0].name).toBe('Updated')
      })

      test('getTemplate should return existing template', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

        const template = await adapter.getTemplate('template-invoice-001')

        expect(template).toBeDefined()
        expect(template?.name).toBe('Professional Invoice Template')
      })

      test('getTemplate should return null for non-existent template', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

        const template = await adapter.getTemplate('non-existent')

        expect(template).toBeNull()
      })

      test('getAllTemplates should return all stored templates', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

        const templates = await adapter.getAllTemplates()

        expect(templates).toHaveLength(4)
        expect(templates[0].id).toBe(builtInTemplates[0].id)
      })

      test('getAllTemplates should return empty array when no templates', async () => {
        localStorageMock.getItem.mockReturnValue(null)

        const templates = await adapter.getAllTemplates()

        expect(templates).toHaveLength(0)
      })

      test('updateTemplate should update existing template', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

        await adapter.updateTemplate('template-invoice-001', { name: 'Updated Invoice' })

        expect(localStorageMock.setItem).toHaveBeenCalled()
        const savedData = (localStorageMock.setItem as jest.Mock).mock.calls[0][1]
        const templates = JSON.parse(savedData)
        const updatedTemplate = templates.find((t: ReportTemplate) => t.id === 'template-invoice-001')
        expect(updatedTemplate.name).toBe('Updated Invoice')
      })

      test('updateTemplate should throw error for non-existent template', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

        await expect(adapter.updateTemplate('non-existent', { name: 'Updated' }))
          .rejects.toThrow('Template not found')
      })

      test('deleteTemplate should remove template', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

        await adapter.deleteTemplate('template-invoice-001')

        expect(localStorageMock.setItem).toHaveBeenCalledTimes(2) // templates + data
        const savedData = (localStorageMock.setItem as jest.Mock).mock.calls[0][1]
        const templates = JSON.parse(savedData)
        expect(templates.find((t: ReportTemplate) => t.id === 'template-invoice-001')).toBeUndefined()
      })

      test('saveMultipleTemplates should save all templates', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

        const templates = builtInTemplates.slice(0, 2)
        const ids = await adapter.saveMultipleTemplates(templates)

        expect(ids).toHaveLength(2)
        expect(ids).toEqual(templates.map(t => t.id))
        expect(localStorageMock.setItem).toHaveBeenCalled()
      })
    })

    describe('Data Operations', () => {
      test('saveTemplateData should store data', async () => {
        const templateData: TemplateData = {
          name: 'Test Data',
          tables: { test: [{ id: 1 }] },
          variables: { var1: 'value1' },
          metadata: {
            createdAt: new Date().toISOString(),
            description: 'Test data',
            sampleDataIncluded: true
          }
        }

        await adapter.saveTemplateData('template-001', templateData)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('template-001')
        )
      })

      test('getTemplateData should retrieve stored data', async () => {
        const templateData = {
          'template-001': {
            name: 'Test Data',
            tables: { test: [{ id: 1 }] },
            variables: {},
            metadata: { createdAt: '2024-01-01', description: 'test', sampleDataIncluded: true }
          }
        }
        localStorageMock.getItem.mockReturnValue(JSON.stringify(templateData))

        const data = await adapter.getTemplateData('template-001')

        expect(data).toBeDefined()
        expect(data?.name).toBe('Test Data')
      })

      test('getTemplateData should return null for non-existent data', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify({}))

        const data = await adapter.getTemplateData('non-existent')

        expect(data).toBeNull()
      })
    })

    describe('Search Operations', () => {
      beforeEach(() => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))
      })

      test('searchTemplates should find by query', async () => {
        const results = await adapter.searchTemplates('invoice')

        expect(results.length).toBeGreaterThan(0)
        expect(results.some(t => t.name.toLowerCase().includes('invoice'))).toBe(true)
      })

      test('searchTemplates should filter by category', async () => {
        const results = await adapter.searchTemplates('', { category: 'business' })

        expect(results.every(t => t.category === 'business')).toBe(true)
      })

      test('searchTemplates should filter by tags', async () => {
        const results = await adapter.searchTemplates('', { tags: ['invoice'] })

        expect(results.every(t => t.metadata.tags.includes('invoice'))).toBe(true)
      })

      test('searchTemplates should filter by author', async () => {
        const results = await adapter.searchTemplates('', { author: 'System' })

        expect(results.every(t => t.metadata.author === 'System')).toBe(true)
      })

      test('searchTemplates should filter by isBuiltIn', async () => {
        const results = await adapter.searchTemplates('', { isBuiltIn: true })

        expect(results.every(t => t.metadata.isBuiltIn === true)).toBe(true)
      })

      test('getTemplatesByCategory should return filtered templates', async () => {
        const results = await adapter.getTemplatesByCategory('business')

        expect(results.every(t => t.category === 'business')).toBe(true)
      })
    })

    describe('Backup and Restore', () => {
      test('backup should create valid backup string', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

        const backup = await adapter.backup()

        expect(typeof backup).toBe('string')
        const parsed = JSON.parse(backup)
        expect(parsed.version).toBeDefined()
        expect(parsed.timestamp).toBeDefined()
        expect(parsed.templates).toBeDefined()
        expect(parsed.data).toBeDefined()
        expect(parsed.metadata).toBeDefined()
      })

      test('restore should restore from valid backup', async () => {
        const backup = {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          templates: builtInTemplates,
          data: {},
          metadata: { version: '1.0.0' }
        }

        await adapter.restore(JSON.stringify(backup))

        expect(localStorageMock.setItem).toHaveBeenCalledTimes(2) // templates + metadata
      })

      test('restore should handle invalid backup format', async () => {
        const invalidBackup = { templates: [] } // Missing required fields

        await expect(adapter.restore(JSON.stringify(invalidBackup)))
          .rejects.toThrow('Invalid backup format')
      })

      test('restore should handle invalid JSON', async () => {
        await expect(adapter.restore('invalid json'))
          .rejects.toThrow()
      })
    })

    describe('Error Handling', () => {
      test('should handle localStorage errors gracefully', async () => {
        localStorageMock.getItem.mockImplementation(() => {
          throw new Error('Storage error')
        })

        const templates = await adapter.getAllTemplates()
        expect(templates).toHaveLength(0)
      })

      test('should handle JSON parse errors in getAllTemplates', async () => {
        localStorageMock.getItem.mockReturnValue('invalid json')

        const templates = await adapter.getAllTemplates()
        expect(templates).toHaveLength(0)
      })

      test('should handle storage errors in saveTemplate', async () => {
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error('Storage full')
        })

        await expect(adapter.saveTemplate(builtInTemplates[0]))
          .rejects.toThrow('Failed to save template')
      })
    })
  })

  describe('DatabaseFactory', () => {
    test('getAdapter should return LocalStorageAdapter instance', async () => {
      const adapter = await DatabaseFactory.getAdapter()

      expect(adapter).toBeInstanceOf(LocalStorageAdapter)
    })

    test('getAdapter should return same instance on subsequent calls', async () => {
      const adapter1 = await DatabaseFactory.getAdapter()
      const adapter2 = await DatabaseFactory.getAdapter()

      expect(adapter1).toBe(adapter2)
    })

    test('setAdapter should allow custom adapter', async () => {
      const customAdapter = new LocalStorageAdapter()
      DatabaseFactory.setAdapter(customAdapter)

      const adapter = await DatabaseFactory.getAdapter()
      expect(adapter).toBe(customAdapter)
    })
  })

  describe('DatabaseMonitor', () => {
    let monitor: DatabaseMonitor

    beforeEach(() => {
      monitor = new DatabaseMonitor(adapter)
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))
    })

    test('getStatistics should return comprehensive stats', async () => {
      const stats = await monitor.getStatistics()

      expect(stats.totalTemplates).toBe(4)
      expect(stats.builtInTemplates).toBe(4)
      expect(stats.customTemplates).toBe(0)
      expect(stats.templatesByCategory).toBeDefined()
      expect(stats.averageComponentsPerTemplate).toBeGreaterThan(0)
      expect(stats.storageUsage).toBeGreaterThan(0)
    })

    test('getStatistics should handle empty database', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      const stats = await monitor.getStatistics()

      expect(stats.totalTemplates).toBe(0)
      expect(stats.averageComponentsPerTemplate).toBe(0)
    })

    test('validateIntegrity should detect valid database', async () => {
      const result = await monitor.validateIntegrity()

      expect(result.isValid).toBe(true)
      expect(result.issues).toHaveLength(0)
      expect(result.orphanedData).toHaveLength(0)
    })

    test('validateIntegrity should detect invalid templates', async () => {
      const invalidTemplates = [
        { ...builtInTemplates[0], name: '', components: [] } // Invalid template
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidTemplates))

      const result = await monitor.validateIntegrity()

      expect(result.isValid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    test('validateIntegrity should detect orphaned data', async () => {
      // Mock orphaned data (data without corresponding template)
      const templatesCall = jest.fn()
        .mockReturnValueOnce(JSON.stringify([]))  // getAllTemplates call
        .mockReturnValueOnce(JSON.stringify({ 'orphaned-id': {} }))  // getAllTemplateData call

      localStorageMock.getItem.mockImplementation(templatesCall)

      const result = await monitor.validateIntegrity()

      expect(result.orphanedData).toContain('orphaned-id')
    })

    test('validateIntegrity should detect missing sample data', async () => {
      const templatesWithoutSampleData = builtInTemplates.map(t => ({
        ...t,
        sampleData: undefined
      }))
      localStorageMock.getItem.mockReturnValue(JSON.stringify(templatesWithoutSampleData))

      const result = await monitor.validateIntegrity()

      expect(result.missingData.length).toBe(4) // All 4 built-in templates missing data
    })
  })
})