import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { TemplateService } from '@/lib/templates/template-service'
import { DatabaseFactory } from '@/lib/templates/database-adapter'
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

// Mock DatabaseFactory
const mockDbAdapter = {
  getAllTemplates: jest.fn(),
  getTemplate: jest.fn(),
  saveTemplate: jest.fn(),
  saveMultipleTemplates: jest.fn(),
  deleteTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  saveTemplateData: jest.fn(),
  getTemplateData: jest.fn(),
  searchTemplates: jest.fn(),
  getTemplatesByCategory: jest.fn(),
  initializeDatabase: jest.fn(),
  backup: jest.fn(),
  restore: jest.fn(),
}

// Mock the entire database adapter module
jest.mock('@/lib/templates/database-adapter', () => ({
  DatabaseFactory: {
    getAdapter: jest.fn(() => Promise.resolve(mockDbAdapter))
  },
  LocalStorageAdapter: jest.fn(() => mockDbAdapter)
}))

describe('TemplateService', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Setup default mock responses
    mockDbAdapter.getAllTemplates.mockResolvedValue([])
    mockDbAdapter.getTemplate.mockResolvedValue(null)
    mockDbAdapter.saveTemplate.mockResolvedValue('mock-id')
    mockDbAdapter.saveMultipleTemplates.mockResolvedValue(['mock-id-1', 'mock-id-2'])
    mockDbAdapter.deleteTemplate.mockResolvedValue(undefined)
    mockDbAdapter.updateTemplate.mockResolvedValue(undefined)
    mockDbAdapter.saveTemplateData.mockResolvedValue(undefined)
    mockDbAdapter.getTemplateData.mockResolvedValue(null)
    mockDbAdapter.searchTemplates.mockResolvedValue([])
    mockDbAdapter.getTemplatesByCategory.mockResolvedValue([])
    mockDbAdapter.initializeDatabase.mockResolvedValue(undefined)
    mockDbAdapter.backup.mockResolvedValue('{}')
    mockDbAdapter.restore.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Template CRUD Operations', () => {
    test('getAllTemplates should initialize with built-in templates when empty', async () => {
      // Mock empty storage initially, then return built-in templates after initialization
      mockDbAdapter.getAllTemplates
        .mockResolvedValueOnce([]) // First call returns empty
        .mockResolvedValueOnce(builtInTemplates) // Second call returns built-in templates

      const templates = await TemplateService.getAllTemplates()
      
      expect(templates).toHaveLength(4) // 4 built-in templates
      expect(templates.every(t => t.metadata.isBuiltIn)).toBe(true)
      expect(mockDbAdapter.saveMultipleTemplates).toHaveBeenCalledWith(builtInTemplates)
    })

    test('getAllTemplates should return stored templates when available', async () => {
      const storedTemplates = [builtInTemplates[0]]
      mockDbAdapter.getAllTemplates.mockResolvedValue(storedTemplates)

      const templates = await TemplateService.getAllTemplates()
      
      expect(templates).toHaveLength(1)
      expect(templates[0].id).toBe(builtInTemplates[0].id)
    })

    test('saveTemplate should save new template', async () => {
      const newTemplate: ReportTemplate = {
        ...builtInTemplates[0],
        id: 'test-template-001',
        name: 'Test Template',
        metadata: { ...builtInTemplates[0].metadata, isBuiltIn: false }
      }

      await TemplateService.saveTemplate(newTemplate)

      expect(mockDbAdapter.saveTemplate).toHaveBeenCalledWith(newTemplate)
    })

    test('saveTemplate should update existing template', async () => {
      const existingTemplate = { ...builtInTemplates[0], name: 'Original Name' }
      const updatedTemplate = { ...existingTemplate, name: 'Updated Name' }
      
      await TemplateService.saveTemplate(updatedTemplate)

      expect(mockDbAdapter.saveTemplate).toHaveBeenCalledWith(updatedTemplate)
    })

    test('getTemplateById should return correct template', async () => {
      const expectedTemplate = builtInTemplates.find(t => t.id === 'template-invoice-001')
      mockDbAdapter.getTemplate.mockResolvedValue(expectedTemplate || null)

      const template = await TemplateService.getTemplateById('template-invoice-001')
      
      expect(template).toBeDefined()
      expect(template?.name).toBe('Professional Invoice Template')
    })

    test('getTemplateById should return null for non-existent template', async () => {
      mockDbAdapter.getTemplate.mockResolvedValue(null)

      const template = await TemplateService.getTemplateById('non-existent-id')
      
      expect(template).toBeNull()
    })

    test('deleteTemplate should remove template', async () => {
      await TemplateService.deleteTemplate('template-invoice-001')

      expect(mockDbAdapter.deleteTemplate).toHaveBeenCalledWith('template-invoice-001')
    })

    test('duplicateTemplate should create copy with new ID', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

      const duplicated = await TemplateService.duplicateTemplate('template-invoice-001', 'Copy of Invoice')

      expect(duplicated.name).toBe('Copy of Invoice')
      expect(duplicated.id).not.toBe('template-invoice-001')
      expect(duplicated.metadata.isBuiltIn).toBe(false)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('Template Data Management', () => {
    test('saveTemplateData should store data', async () => {
      const templateData: TemplateData = {
        name: 'Test Data',
        tables: { test: [{ id: 1, value: 'test' }] },
        variables: { testVar: 'value' },
        metadata: {
          createdAt: new Date().toISOString(),
          description: 'Test data',
          sampleDataIncluded: true
        }
      }

      await TemplateService.saveTemplateData('template-001', templateData)

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

      const data = await TemplateService.getTemplateData('template-001')

      expect(data).toBeDefined()
      expect(data?.name).toBe('Test Data')
    })

    test('getTemplateData should return null for non-existent data', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({}))

      const data = await TemplateService.getTemplateData('non-existent')

      expect(data).toBeNull()
    })
  })

  describe('Template Validation', () => {
    test('validateTemplate should return valid for correct template', () => {
      const template = builtInTemplates[0]
      const sampleData = template.sampleData

      const result = TemplateService.validateTemplate(template, sampleData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('validateTemplate should detect missing name', () => {
      const invalidTemplate = {
        ...builtInTemplates[0],
        name: ''
      }

      const result = TemplateService.validateTemplate(invalidTemplate)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Template name is required')
    })

    test('validateTemplate should detect missing components', () => {
      const invalidTemplate = {
        ...builtInTemplates[0],
        components: []
      }

      const result = TemplateService.validateTemplate(invalidTemplate)

      expect(result.isValid).toBe(false)
      expect(result.warnings).toContain('Template has no components')
    })

    test('validateTemplate should detect missing data sources', () => {
      const template = builtInTemplates[0]
      const incompleteData = {
        ...template.sampleData,
        tables: {} // Missing all required tables
      }

      const result = TemplateService.validateTemplate(template, incompleteData)

      expect(result.isValid).toBe(false)
      expect(result.missingData).toBeDefined()
      expect(result.missingData?.length).toBeGreaterThan(0)
    })

    test('validateTemplate should detect invalid data binding', () => {
      const invalidTemplate = {
        ...builtInTemplates[0],
        components: [
          {
            id: 'test-comp',
            type: 'text-label',
            name: 'Test',
            x: 0, y: 0, width: 100, height: 50,
            properties: {},
            dataBinding: {
              sourceType: 'dynamic' as const,
              source: undefined // Invalid: no source specified
            }
          }
        ]
      }

      const result = TemplateService.validateTemplate(invalidTemplate)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Component Test has dynamic binding but no data source')
    })
  })

  describe('Import/Export Operations', () => {
    test('exportTemplate should return valid JSON', () => {
      const template = builtInTemplates[0]
      const exported = TemplateService.exportTemplate(template)

      expect(() => JSON.parse(exported)).not.toThrow()
      const parsed = JSON.parse(exported)
      expect(parsed.id).toBe(template.id)
      expect(parsed.name).toBe(template.name)
    })

    test('importTemplate should parse and save valid template', async () => {
      const template = builtInTemplates[0]
      const templateJson = JSON.stringify(template)
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      const imported = await TemplateService.importTemplate(templateJson)

      expect(imported.name).toBe(template.name)
      expect(imported.id).not.toBe(template.id) // Should generate new ID
      expect(imported.metadata.isBuiltIn).toBe(false)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    test('importTemplate should throw error for invalid JSON', async () => {
      await expect(TemplateService.importTemplate('invalid json')).rejects.toThrow()
    })

    test('importTemplate should throw error for invalid template structure', async () => {
      const invalidTemplate = { id: 'test', name: 'test' } // Missing required fields
      const templateJson = JSON.stringify(invalidTemplate)

      await expect(TemplateService.importTemplate(templateJson)).rejects.toThrow('Invalid template format')
    })
  })

  describe('Category Management', () => {
    test('getTemplatesByCategory should filter by category', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

      const businessTemplates = await TemplateService.getTemplatesByCategory('business')

      expect(businessTemplates.every(t => t.category === 'business')).toBe(true)
      expect(businessTemplates.length).toBeGreaterThan(0)
    })

    test('getTemplateCategories should return all unique categories', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

      const categories = await TemplateService.getTemplateCategories()

      expect(categories).toContain('business')
      expect(categories).toContain('analytics')
      expect(categories).toContain('inventory')
      expect(categories).toContain('dashboard')
      expect(new Set(categories).size).toBe(categories.length) // All unique
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))
    })

    test('searchTemplates should find templates by name', async () => {
      const results = await TemplateService.searchTemplates('invoice')

      expect(results.length).toBeGreaterThan(0)
      expect(results.some(t => t.name.toLowerCase().includes('invoice'))).toBe(true)
    })

    test('searchTemplates should find templates by description', async () => {
      const results = await TemplateService.searchTemplates('comprehensive')

      expect(results.length).toBeGreaterThan(0)
      expect(results.some(t => t.description.toLowerCase().includes('comprehensive'))).toBe(true)
    })

    test('searchTemplates should find templates by tags', async () => {
      const results = await TemplateService.searchTemplates('analytics')

      expect(results.length).toBeGreaterThan(0)
      expect(results.some(t => t.metadata.tags.includes('analytics'))).toBe(true)
    })

    test('searchTemplates should filter by category', async () => {
      const results = await TemplateService.searchTemplates('', { category: 'business' })

      expect(results.every(t => t.category === 'business')).toBe(true)
    })

    test('searchTemplates should filter by tags', async () => {
      const results = await TemplateService.searchTemplates('', { tags: ['invoice'] })

      expect(results.every(t => t.metadata.tags.includes('invoice'))).toBe(true)
    })

    test('searchTemplates should filter by author', async () => {
      const results = await TemplateService.searchTemplates('', { author: 'System' })

      expect(results.every(t => t.metadata.author === 'System')).toBe(true)
    })

    test('searchTemplates should handle empty results', async () => {
      const results = await TemplateService.searchTemplates('nonexistentkeyword')

      expect(results).toHaveLength(0)
    })

    test('searchTemplates should combine filters', async () => {
      const results = await TemplateService.searchTemplates('invoice', { 
        category: 'business',
        tags: ['billing']
      })

      expect(results.every(t => 
        t.category === 'business' && 
        t.metadata.tags.includes('billing') &&
        (t.name.toLowerCase().includes('invoice') || 
         t.description.toLowerCase().includes('invoice') ||
         t.metadata.tags.some(tag => tag.toLowerCase().includes('invoice')))
      )).toBe(true)
    })
  })

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const templates = await TemplateService.getAllTemplates()
      expect(templates).toHaveLength(0) // Should return empty array on error
    })

    test('should handle JSON parse errors gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const templates = await TemplateService.getAllTemplates()
      expect(templates).toHaveLength(0)
    })

    test('should handle missing template in duplicate operation', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      await expect(TemplateService.duplicateTemplate('non-existent')).rejects.toThrow('Template not found')
    })
  })

  describe('Database Operations', () => {
    test('backupTemplates should return JSON string', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(builtInTemplates))

      const backup = await TemplateService.backupTemplates()

      expect(typeof backup).toBe('string')
      expect(() => JSON.parse(backup)).not.toThrow()
      
      const parsed = JSON.parse(backup)
      expect(parsed.templates).toBeDefined()
      expect(parsed.data).toBeDefined()
      expect(parsed.metadata).toBeDefined()
    })

    test('restoreTemplates should restore from backup', async () => {
      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        templates: builtInTemplates,
        data: {},
        metadata: { version: '1.0.0' }
      }

      await TemplateService.restoreTemplates(JSON.stringify(backup))

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2) // templates + metadata
    })

    test('restoreTemplates should handle invalid backup', async () => {
      await expect(TemplateService.restoreTemplates('invalid backup')).rejects.toThrow()
    })
  })
})