import { describe, test, expect, beforeEach } from '@jest/globals'
import { 
  builtInTemplates, 
  validateAllTemplates,
  invoiceTemplate,
  salesTemplate,
  inventoryTemplate,
  dashboardTemplate
} from '@/data/sample-templates'
import { TemplateService } from '@/lib/templates/template-service'
import { ReportTemplate } from '@/types/template'

describe('Template Validation', () => {
  describe('Built-in Templates Structure', () => {
    test('should have exactly 4 built-in templates', () => {
      expect(builtInTemplates).toHaveLength(4)
    })

    test('all built-in templates should have required fields', () => {
      builtInTemplates.forEach((template, index) => {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.category).toBeDefined()
        expect(template.components).toBeDefined()
        expect(template.sampleData).toBeDefined()
        expect(template.metadata).toBeDefined()
        expect(template.validation).toBeDefined()
      })
    })

    test('all templates should have unique IDs', () => {
      const ids = builtInTemplates.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    test('all templates should have at least one component', () => {
      builtInTemplates.forEach(template => {
        expect(template.components.length).toBeGreaterThan(0)
      })
    })

    test('all templates should have valid metadata', () => {
      builtInTemplates.forEach(template => {
        expect(template.metadata.createdAt).toBeDefined()
        expect(template.metadata.updatedAt).toBeDefined()
        expect(template.metadata.author).toBeDefined()
        expect(template.metadata.version).toBeDefined()
        expect(template.metadata.tags).toBeDefined()
        expect(Array.isArray(template.metadata.tags)).toBe(true)
        expect(template.metadata.isBuiltIn).toBe(true)
      })
    })

    test('all templates should have validation rules', () => {
      builtInTemplates.forEach(template => {
        expect(template.validation.requiredDataSources).toBeDefined()
        expect(Array.isArray(template.validation.requiredDataSources)).toBe(true)
        expect(template.validation.requiredFields).toBeDefined()
        expect(template.validation.validationRules).toBeDefined()
        expect(Array.isArray(template.validation.validationRules)).toBe(true)
      })
    })
  })

  describe('Invoice Template Validation', () => {
    test('should have correct structure', () => {
      expect(invoiceTemplate.id).toBe('template-invoice-001')
      expect(invoiceTemplate.name).toBe('Professional Invoice Template')
      expect(invoiceTemplate.category).toBe('business')
      expect(invoiceTemplate.components.length).toBeGreaterThan(10)
    })

    test('should have required data sources', () => {
      expect(invoiceTemplate.validation.requiredDataSources).toContain('company')
      expect(invoiceTemplate.validation.requiredDataSources).toContain('customer')
      expect(invoiceTemplate.validation.requiredDataSources).toContain('invoice')
      expect(invoiceTemplate.validation.requiredDataSources).toContain('items')
    })

    test('should have sample data with correct structure', () => {
      expect(invoiceTemplate.sampleData).toBeDefined()
      expect(invoiceTemplate.sampleData.tables.company).toBeDefined()
      expect(invoiceTemplate.sampleData.tables.customer).toBeDefined()
      expect(invoiceTemplate.sampleData.tables.invoice).toBeDefined()
      expect(invoiceTemplate.sampleData.tables.items).toBeDefined()
    })

    test('should validate successfully with sample data', () => {
      const validation = TemplateService.validateTemplate(invoiceTemplate, invoiceTemplate.sampleData)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should have components with valid data bindings', () => {
      const componentsWithBinding = invoiceTemplate.components.filter(c => c.dataBinding)
      expect(componentsWithBinding.length).toBeGreaterThan(5)
      
      componentsWithBinding.forEach(component => {
        expect(component.dataBinding?.sourceType).toMatch(/^(static|dynamic|calculated)$/)
        if (component.dataBinding?.sourceType === 'dynamic') {
          expect(component.dataBinding.source).toBeDefined()
        }
      })
    })
  })

  describe('Sales Template Validation', () => {
    test('should have correct structure', () => {
      expect(salesTemplate.id).toBe('template-sales-001')
      expect(salesTemplate.name).toBe('Monthly Sales Report')
      expect(salesTemplate.category).toBe('analytics')
      expect(salesTemplate.components.length).toBeGreaterThan(15)
    })

    test('should have chart components', () => {
      const chartComponents = salesTemplate.components.filter(c => c.type === 'chart')
      expect(chartComponents.length).toBeGreaterThan(0)
    })

    test('should have table components', () => {
      const tableComponents = salesTemplate.components.filter(c => c.type === 'table')
      expect(tableComponents.length).toBeGreaterThan(1)
    })

    test('should validate successfully with sample data', () => {
      const validation = TemplateService.validateTemplate(salesTemplate, salesTemplate.sampleData)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('Inventory Template Validation', () => {
    test('should have correct structure', () => {
      expect(inventoryTemplate.id).toBe('template-inventory-001')
      expect(inventoryTemplate.name).toBe('Inventory Status Report')
      expect(inventoryTemplate.category).toBe('inventory')
      expect(inventoryTemplate.components.length).toBeGreaterThan(20)
    })

    test('should have inventory table with conditional formatting', () => {
      const inventoryTable = inventoryTemplate.components.find(c => 
        c.type === 'table' && c.name === 'Inventory Items Table'
      )
      expect(inventoryTable).toBeDefined()
      expect(inventoryTable?.properties.conditionalFormatting).toBeDefined()
    })

    test('should validate successfully with sample data', () => {
      const validation = TemplateService.validateTemplate(inventoryTemplate, inventoryTemplate.sampleData)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('Dashboard Template Validation', () => {
    test('should have correct structure', () => {
      expect(dashboardTemplate.id).toBe('template-dashboard-001')
      expect(dashboardTemplate.name).toBe('Executive Dashboard')
      expect(dashboardTemplate.category).toBe('dashboard')
      expect(dashboardTemplate.components.length).toBeGreaterThan(25)
    })

    test('should have KPI components', () => {
      const kpiComponents = dashboardTemplate.components.filter(c => 
        c.name.toLowerCase().includes('kpi') || c.type === 'gauge'
      )
      expect(kpiComponents.length).toBeGreaterThan(3)
    })

    test('should have chart components', () => {
      const chartComponents = dashboardTemplate.components.filter(c => c.type === 'chart')
      expect(chartComponents.length).toBeGreaterThan(1)
    })

    test('should validate successfully with sample data', () => {
      const validation = TemplateService.validateTemplate(dashboardTemplate, dashboardTemplate.sampleData)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('Template System Validation', () => {
    test('validateAllTemplates should return all valid', () => {
      const result = validateAllTemplates()
      expect(result.valid).toBe(4)
      expect(result.invalid).toBe(0)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    test('should handle invalid template gracefully', () => {
      const invalidTemplate: ReportTemplate = {
        ...invoiceTemplate,
        name: '', // Invalid: empty name
        components: [] // Invalid: no components
      }

      const validation = TemplateService.validateTemplate(invalidTemplate)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    test('should detect missing data sources', () => {
      const templateWithMissingData = {
        ...invoiceTemplate.sampleData,
        tables: {
          ...invoiceTemplate.sampleData.tables,
          company: undefined // Missing required data source
        }
      }

      const validation = TemplateService.validateTemplate(invoiceTemplate, templateWithMissingData)
      expect(validation.isValid).toBe(false)
      expect(validation.missingData).toContain('company')
    })
  })

  describe('Component Validation', () => {
    test('all components should have valid dimensions', () => {
      builtInTemplates.forEach(template => {
        template.components.forEach(component => {
          expect(component.x).toBeGreaterThanOrEqual(0)
          expect(component.y).toBeGreaterThanOrEqual(0)
          expect(component.width).toBeGreaterThan(0)
          expect(component.height).toBeGreaterThan(0)
        })
      })
    })

    test('all components should have unique IDs within template', () => {
      builtInTemplates.forEach(template => {
        const componentIds = template.components.map(c => c.id)
        const uniqueIds = new Set(componentIds)
        expect(uniqueIds.size).toBe(componentIds.length)
      })
    })

    test('all components should have valid types', () => {
      const validTypes = [
        'text-label', 'heading', 'image', 'table', 'chart', 'rectangle', 
        'circle', 'line-divider', 'gauge', 'qr-code'
      ]

      builtInTemplates.forEach(template => {
        template.components.forEach(component => {
          expect(validTypes).toContain(component.type)
        })
      })
    })

    test('data binding components should have valid configurations', () => {
      builtInTemplates.forEach(template => {
        template.components.forEach(component => {
          if (component.dataBinding) {
            expect(['static', 'dynamic', 'calculated']).toContain(component.dataBinding.sourceType)
            
            if (component.dataBinding.sourceType === 'dynamic') {
              expect(component.dataBinding.source).toBeDefined()
              expect(typeof component.dataBinding.source).toBe('string')
            }
            
            if (component.dataBinding.sourceType === 'calculated') {
              expect(component.dataBinding.calculation).toBeDefined()
              expect(typeof component.dataBinding.calculation).toBe('string')
            }
          }
        })
      })
    })
  })

  describe('Sample Data Validation', () => {
    test('all sample data should have required structure', () => {
      builtInTemplates.forEach(template => {
        expect(template.sampleData.name).toBeDefined()
        expect(template.sampleData.tables).toBeDefined()
        expect(template.sampleData.variables).toBeDefined()
        expect(template.sampleData.metadata).toBeDefined()
        expect(template.sampleData.metadata.sampleDataIncluded).toBe(true)
      })
    })

    test('sample data should match validation requirements', () => {
      builtInTemplates.forEach(template => {
        template.validation.requiredDataSources.forEach(source => {
          expect(template.sampleData.tables[source]).toBeDefined()
          expect(Array.isArray(template.sampleData.tables[source])).toBe(true)
        })
      })
    })

    test('sample data tables should have required fields', () => {
      builtInTemplates.forEach(template => {
        Object.entries(template.validation.requiredFields).forEach(([tableName, fields]) => {
          const tableData = template.sampleData.tables[tableName]
          if (tableData && tableData.length > 0) {
            const firstRow = tableData[0]
            fields.forEach(field => {
              expect(firstRow).toHaveProperty(field)
            })
          }
        })
      })
    })
  })
})