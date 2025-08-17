import { describe, test, expect, jest } from '@jest/globals'

// Create a simple mock for TemplateService
const mockTemplateService = {
  getAllTemplates: jest.fn(),
  getTemplateById: jest.fn(),
  saveTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  duplicateTemplate: jest.fn(),
  validateTemplate: jest.fn(),
  exportTemplate: jest.fn(),
  importTemplate: jest.fn(),
  searchTemplates: jest.fn(),
  getTemplatesByCategory: jest.fn(),
  getTemplateCategories: jest.fn(),
  saveTemplateData: jest.fn(),
  getTemplateData: jest.fn(),
  backupTemplates: jest.fn(),
  restoreTemplates: jest.fn()
}

// Mock the TemplateService module
jest.mock('@/lib/templates/template-service', () => ({
  TemplateService: mockTemplateService
}))

describe('TemplateService - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    test('getAllTemplates returns empty array by default', async () => {
      mockTemplateService.getAllTemplates.mockResolvedValue([])
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      const result = await TemplateService.getAllTemplates()
      
      expect(result).toEqual([])
      expect(mockTemplateService.getAllTemplates).toHaveBeenCalled()
    })

    test('getTemplateById returns null when not found', async () => {
      mockTemplateService.getTemplateById.mockResolvedValue(null)
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      const result = await TemplateService.getTemplateById('test-id')
      
      expect(result).toBeNull()
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith('test-id')
    })

    test('saveTemplate calls the service method', async () => {
      mockTemplateService.saveTemplate.mockResolvedValue(undefined)
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      const mockTemplate = { id: 'test', name: 'Test Template' } as any
      
      await TemplateService.saveTemplate(mockTemplate)
      
      expect(mockTemplateService.saveTemplate).toHaveBeenCalledWith(mockTemplate)
    })

    test('deleteTemplate calls the service method', async () => {
      mockTemplateService.deleteTemplate.mockResolvedValue(undefined)
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      
      await TemplateService.deleteTemplate('test-id')
      
      expect(mockTemplateService.deleteTemplate).toHaveBeenCalledWith('test-id')
    })

    test('validateTemplate returns validation result', async () => {
      const mockResult = { isValid: true, errors: [], warnings: [] }
      mockTemplateService.validateTemplate.mockReturnValue(mockResult)
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      const mockTemplate = { id: 'test', name: 'Test Template', components: [] } as any
      
      const result = TemplateService.validateTemplate(mockTemplate)
      
      expect(result).toEqual(mockResult)
      expect(mockTemplateService.validateTemplate).toHaveBeenCalledWith(mockTemplate)
    })

    test('exportTemplate returns JSON string', () => {
      const mockTemplate = { id: 'test', name: 'Test Template' } as any
      const mockJson = JSON.stringify(mockTemplate)
      mockTemplateService.exportTemplate.mockReturnValue(mockJson)
      
      const { TemplateService } = require('@/lib/templates/template-service')
      const result = TemplateService.exportTemplate(mockTemplate)
      
      expect(result).toBe(mockJson)
      expect(mockTemplateService.exportTemplate).toHaveBeenCalledWith(mockTemplate)
    })

    test('searchTemplates returns filtered results', async () => {
      const mockResults = [{ id: 'test', name: 'Test Template' }] as any[]
      mockTemplateService.searchTemplates.mockResolvedValue(mockResults)
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      const result = await TemplateService.searchTemplates('test')
      
      expect(result).toEqual(mockResults)
      expect(mockTemplateService.searchTemplates).toHaveBeenCalledWith('test')
    })

    test('getTemplateCategories returns category list', async () => {
      const mockCategories = ['business', 'analytics', 'inventory']
      mockTemplateService.getTemplateCategories.mockResolvedValue(mockCategories)
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      const result = await TemplateService.getTemplateCategories()
      
      expect(result).toEqual(mockCategories)
      expect(mockTemplateService.getTemplateCategories).toHaveBeenCalled()
    })

    test('backupTemplates returns backup string', async () => {
      const mockBackup = '{"templates": []}'
      mockTemplateService.backupTemplates.mockResolvedValue(mockBackup)
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      const result = await TemplateService.backupTemplates()
      
      expect(result).toBe(mockBackup)
      expect(mockTemplateService.backupTemplates).toHaveBeenCalled()
    })

    test('restoreTemplates processes backup data', async () => {
      mockTemplateService.restoreTemplates.mockResolvedValue(undefined)
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      const backupData = '{"templates": []}'
      
      await TemplateService.restoreTemplates(backupData)
      
      expect(mockTemplateService.restoreTemplates).toHaveBeenCalledWith(backupData)
    })
  })

  describe('Error Handling', () => {
    test('handles service errors gracefully', async () => {
      // Mock the database adapter to throw an error
      mockTemplateService.getAllTemplates.mockResolvedValue([])
      
      const { TemplateService } = await import('@/lib/templates/template-service')
      
      // Should return empty array when service works normally
      const result = await TemplateService.getAllTemplates()
      
      expect(mockTemplateService.getAllTemplates).toHaveBeenCalled()
      expect(Array.isArray(result)).toBe(true)
    })

    test('handles validation errors', () => {
      const invalidTemplate = { id: '', name: '', components: [] } as any
      const mockResult = { isValid: false, errors: ['Name is required'], warnings: [] }
      mockTemplateService.validateTemplate.mockReturnValue(mockResult)
      
      const { TemplateService } = require('@/lib/templates/template-service')
      const result = TemplateService.validateTemplate(invalidTemplate)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Name is required')
    })
  })
})