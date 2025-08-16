/**
 * Complete Workflow Integration Tests
 * 
 * These tests validate end-to-end workflows that span multiple components
 * and test the integration between different parts of the system.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportDesigner } from '@/components/designer/report-designer'
import { server } from '@/tests/mocks/server'
import { rest } from 'msw'

// Mock Next.js components that aren't available in test environment
jest.mock('next/dynamic', () => {
  return (dynamicFunction: any) => {
    const Component = dynamicFunction()
    Component.displayName = 'MockedDynamicComponent'
    return Component
  }
})

describe('Complete Report Creation Workflow', () => {
  beforeEach(() => {
    // Reset any stored state
    localStorage.clear()
    sessionStorage.clear()
    
    // Reset MSW handlers to default state
    server.resetHandlers()
  })

  describe('Finance Team Workflow - UAT Scenario', () => {
    test('creates financial report from template in under 5 clicks', async () => {
      const user = userEvent.setup()
      const startTime = performance.now()
      
      // Setup: Mock template API with financial template
      server.use(
        rest.get('/api/templates', (req, res, ctx) => {
          return res(
            ctx.json([
              {
                id: 'financial-template-1',
                name: 'Financial Statement Template',
                category: 'Finance',
                description: 'Standard financial reporting template',
                components: [
                  {
                    id: 'header-1',
                    type: 'page-header',
                    x: 0,
                    y: 0,
                    width: 800,
                    height: 60,
                    properties: {
                      content: 'Financial Statement',
                      fontSize: 18,
                      fontWeight: 'bold'
                    }
                  },
                  {
                    id: 'balance-sheet-1',
                    type: 'table',
                    x: 50,
                    y: 100,
                    width: 700,
                    height: 300,
                    properties: {
                      title: 'Balance Sheet',
                      columns: ['Account', 'Amount'],
                      dataSource: '{{balance_sheet_data}}'
                    }
                  },
                  {
                    id: 'income-statement-1',
                    type: 'table',
                    x: 50,
                    y: 450,
                    width: 700,
                    height: 250,
                    properties: {
                      title: 'Income Statement',
                      columns: ['Item', 'Amount'],
                      dataSource: '{{income_statement_data}}'
                    }
                  }
                ]
              }
            ])
          )
        }),
        
        rest.get('/api/data-sources/latest', (req, res, ctx) => {
          return res(
            ctx.json({
              id: 'latest-financial-data',
              name: 'Q4 2024 Financial Data',
              lastUpdated: new Date().toISOString(),
              preview: {
                balance_sheet_data: [
                  ['Cash', '$150,000'],
                  ['Accounts Receivable', '$85,000'],
                  ['Total Assets', '$235,000']
                ],
                income_statement_data: [
                  ['Revenue', '$500,000'],
                  ['Expenses', '$350,000'],
                  ['Net Income', '$150,000']
                ]
              }
            })
          )
        }),
        
        rest.post('/api/generate-pdf', (req, res, ctx) => {
          return res(
            ctx.delay(2000), // Simulate processing time
            ctx.set('Content-Type', 'application/pdf'),
            ctx.set('Content-Disposition', 'attachment; filename="financial-statement.pdf"'),
            ctx.body(new ArrayBuffer(50000)) // Mock PDF data
          )
        })
      )

      render(<ReportDesigner />)

      // Click 1: Load financial template
      const loadTemplateButton = screen.getByRole('button', { name: /load template/i })
      await user.click(loadTemplateButton)
      
      await waitFor(() => {
        expect(screen.getByText('Financial Statement Template')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Financial Statement Template'))

      // Click 2: Verify template loaded and use latest data
      await waitFor(() => {
        expect(screen.getByText(/balance sheet/i)).toBeInTheDocument()
        expect(screen.getByText(/income statement/i)).toBeInTheDocument()
      })
      
      const useLatestDataButton = screen.getByRole('button', { name: /use latest data/i })
      await user.click(useLatestDataButton)

      // Click 3: Verify data connected
      await waitFor(() => {
        expect(screen.getByText('Q4 2024 Financial Data')).toBeInTheDocument()
        expect(screen.getByText('$150,000')).toBeInTheDocument() // Cash amount
      })

      // Click 4: Generate PDF
      const generatePdfButton = screen.getByRole('button', { name: /generate pdf/i })
      await user.click(generatePdfButton)

      // Click 5: Download PDF
      await waitFor(() => {
        expect(screen.getByText(/pdf generated successfully/i)).toBeInTheDocument()
      }, { timeout: 5000 })
      
      const downloadButton = screen.getByRole('button', { name: /download pdf/i })
      await user.click(downloadButton)

      const endTime = performance.now()
      const totalTime = (endTime - startTime) / 1000

      // Verify success criteria
      expect(totalTime).toBeLessThan(30) // Completed in under 30 seconds
      expect(screen.getByText(/download started/i)).toBeInTheDocument()
    })

    test('customizes existing financial template without technical knowledge', async () => {
      const user = userEvent.setup()
      
      // Setup: Mock template with customizable elements
      server.use(
        rest.get('/api/templates/quarterly-report', (req, res, ctx) => {
          return res(
            ctx.json({
              id: 'quarterly-template-1',
              name: 'Quarterly Report Template',
              components: [
                {
                  id: 'logo-1',
                  type: 'image',
                  x: 50,
                  y: 20,
                  width: 100,
                  height: 50,
                  properties: {
                    src: '/images/default-logo.png',
                    alt: 'Company Logo'
                  }
                },
                {
                  id: 'header-1',
                  type: 'page-header',
                  x: 0,
                  y: 80,
                  width: 800,
                  height: 60,
                  properties: {
                    content: 'Quarterly Financial Report',
                    fontSize: 18
                  }
                }
              ]
            })
          )
        })
      )

      render(<ReportDesigner />)

      // Load existing template
      await user.click(screen.getByRole('button', { name: /load template/i }))
      await user.click(screen.getByText(/quarterly report template/i))

      // Wait for template to load
      await waitFor(() => {
        expect(screen.getByText(/quarterly financial report/i)).toBeInTheDocument()
      })

      // Customize company logo (visual task)
      const logoComponent = screen.getByTestId('component-logo-1')
      await user.click(logoComponent)
      
      // Verify properties panel shows image properties
      expect(screen.getByLabelText(/image source/i)).toBeInTheDocument()
      
      const changeImageButton = screen.getByRole('button', { name: /change image/i })
      await user.click(changeImageButton)

      // Simulate file upload
      const logoInput = screen.getByLabelText(/upload new logo/i)
      const logoFile = new File(['mock-logo-content'], 'company-logo.png', { type: 'image/png' })
      await user.upload(logoInput, logoFile)

      // Verify logo updated
      await waitFor(() => {
        expect(screen.getByDisplayValue(/company-logo.png/i)).toBeInTheDocument()
      })

      // Customize header text
      const headerComponent = screen.getByTestId('component-header-1')
      await user.click(headerComponent)
      
      const headerInput = screen.getByLabelText(/header text/i)
      await user.clear(headerInput)
      await user.type(headerInput, 'Q4 2024 Financial Report')

      // Verify changes are visible
      expect(screen.getByText('Q4 2024 Financial Report')).toBeInTheDocument()

      // Save as new template
      await user.click(screen.getByRole('button', { name: /save as new template/i }))
      await user.type(screen.getByLabelText(/template name/i), 'Q4 2024 Custom Report')
      await user.click(screen.getByRole('button', { name: /save/i }))

      // Verify save success
      await waitFor(() => {
        expect(screen.getByText(/template saved successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe('Tech Support Workflow - UAT Scenario', () => {
    test('creates complex template from scratch in reasonable time', async () => {
      const user = userEvent.setup()
      const startTime = performance.now()

      render(<ReportDesigner />)

      // Verify empty canvas
      expect(screen.getByText(/no components on canvas/i)).toBeInTheDocument()

      // Add page header with company branding
      const headerComponent = screen.getByTestId('palette-page-header')
      const canvas = screen.getByTestId('design-canvas')
      
      await user.pointer([
        { keys: '[MouseLeft>]', target: headerComponent },
        { coords: { x: 100, y: 50 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      // Configure header
      const addedHeader = await screen.findByTestId(/component-page-header-/)
      await user.click(addedHeader)
      
      const headerTextInput = screen.getByLabelText(/header text/i)
      await user.clear(headerTextInput)
      await user.type(headerTextInput, 'Company Annual Report')

      // Add main content sections
      const headingComponent = screen.getByTestId('palette-heading')
      await user.pointer([
        { keys: '[MouseLeft>]', target: headingComponent },
        { coords: { x: 100, y: 150 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      const textComponent = screen.getByTestId('palette-text')
      await user.pointer([
        { keys: '[MouseLeft>]', target: textComponent },
        { coords: { x: 100, y: 200 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      const tableComponent = screen.getByTestId('palette-table')
      await user.pointer([
        { keys: '[MouseLeft>]', target: tableComponent },
        { coords: { x: 100, y: 300 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      // Configure table for financial data
      const addedTable = await screen.findByTestId(/component-table-/)
      await user.click(addedTable)
      
      // Switch to data tab
      await user.click(screen.getByRole('tab', { name: /data/i }))
      
      const tableTitleInput = screen.getByLabelText(/table title/i)
      await user.clear(tableTitleInput)
      await user.type(tableTitleInput, 'Revenue Breakdown')

      // Add chart component
      const chartComponent = screen.getByTestId('palette-chart')
      await user.pointer([
        { keys: '[MouseLeft>]', target: chartComponent },
        { coords: { x: 100, y: 550 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      // Add page footer with page numbers
      const footerComponent = screen.getByTestId('palette-page-footer')
      await user.pointer([
        { keys: '[MouseLeft>]', target: footerComponent },
        { coords: { x: 100, y: 750 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      const addedFooter = await screen.findByTestId(/component-page-footer-/)
      await user.click(addedFooter)
      
      const includePageNumbers = screen.getByLabelText(/include page numbers/i)
      await user.check(includePageNumbers)

      // Configure data binding placeholders
      await user.click(addedTable)
      await user.click(screen.getByRole('button', { name: /configure data mapping/i }))
      
      const dataSourceInput = screen.getByLabelText(/data source/i)
      await user.clear(dataSourceInput)
      await user.type(dataSourceInput, '{{annual_revenue_data}}')

      // Test template with sample data
      await user.click(screen.getByRole('button', { name: /preview with sample data/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/preview mode/i)).toBeInTheDocument()
      })

      // Exit preview and save template
      await user.click(screen.getByRole('button', { name: /exit preview/i }))
      await user.click(screen.getByRole('button', { name: /save template/i }))

      // Fill template metadata
      const templateNameInput = screen.getByLabelText(/template name/i)
      await user.type(templateNameInput, 'Annual Report Template')
      
      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Comprehensive annual report with financial tables and charts')
      
      await user.selectOptions(screen.getByLabelText(/category/i), 'Financial Reports')
      await user.click(screen.getByRole('button', { name: /save/i }))

      const endTime = performance.now()
      const totalTime = (endTime - startTime) / (1000 * 60) // Convert to minutes

      // Verify success criteria
      expect(totalTime).toBeLessThan(60) // Under 1 hour (in real workflow)
      
      await waitFor(() => {
        expect(screen.getByText(/template saved successfully/i)).toBeInTheDocument()
      })

      // Verify template complexity - should have multiple sections
      const allComponents = screen.getAllByTestId(/component-/)
      expect(allComponents.length).toBeGreaterThanOrEqual(5)
    })

    test('sets up data source connections for various systems', async () => {
      const user = userEvent.setup()
      
      // Mock successful database connections
      server.use(
        rest.post('/api/data-sources/test-connection', (req, res, ctx) => {
          const { type, server: dbServer, database } = req.body
          
          if (type === 'sql-server' && dbServer && database) {
            return res(
              ctx.json({
                success: true,
                message: 'Connection successful',
                connectionId: 'sql-conn-123',
                schema: ['Users', 'Orders', 'Products', 'FinancialData']
              })
            )
          }
          
          if (type === 'rest-api') {
            return res(
              ctx.json({
                success: true,
                message: 'API connection successful',
                connectionId: 'api-conn-456',
                endpoints: ['/reports/data', '/analytics/metrics', '/financial/summary']
              })
            )
          }
          
          return res(ctx.status(400), ctx.json({ success: false, message: 'Invalid parameters' }))
        })
      )

      render(<ReportDesigner />)

      // Open data source manager
      await user.click(screen.getByRole('button', { name: /manage data sources/i }))

      // Test SQL Server connection
      await user.click(screen.getByRole('button', { name: /add data source/i }))
      await user.selectOptions(screen.getByLabelText(/source type/i), 'sql-server')
      
      await user.type(screen.getByLabelText(/server/i), 'prod-sql.company.com')
      await user.type(screen.getByLabelText(/database/i), 'FinancialDB')
      await user.type(screen.getByLabelText(/username/i), 'report_user')
      await user.type(screen.getByLabelText(/password/i), 'secure_password')

      await user.click(screen.getByRole('button', { name: /test connection/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/connection successful/i)).toBeInTheDocument()
      })

      // Verify available schemas
      expect(screen.getByText('FinancialData')).toBeInTheDocument()

      // Save SQL connection
      await user.type(screen.getByLabelText(/connection name/i), 'Production Financial DB')
      await user.click(screen.getByRole('button', { name: /save connection/i }))

      // Test API connection
      await user.click(screen.getByRole('button', { name: /add data source/i }))
      await user.selectOptions(screen.getByLabelText(/source type/i), 'rest-api')
      
      await user.type(screen.getByLabelText(/api url/i), 'https://api.company.com/reports/data')
      await user.selectOptions(screen.getByLabelText(/authentication/i), 'bearer-token')
      await user.type(screen.getByLabelText(/token/i), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

      await user.click(screen.getByRole('button', { name: /test api/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/api connection successful/i)).toBeInTheDocument()
      })

      // Save API connection
      await user.type(screen.getByLabelText(/connection name/i), 'Company API Reports')
      await user.click(screen.getByRole('button', { name: /save connection/i }))

      // Verify both connections are available
      expect(screen.getByText('Production Financial DB')).toBeInTheDocument()
      expect(screen.getByText('Company API Reports')).toBeInTheDocument()

      // Test connection list shows both
      const connectionItems = screen.getAllByTestId(/data-source-item-/)
      expect(connectionItems).toHaveLength(2)
    })
  })

  describe('Data Integration Workflow', () => {
    test('handles CSV upload, parsing, and data binding', async () => {
      const user = userEvent.setup()
      
      // Mock CSV parsing
      server.use(
        rest.post('/api/parse-csv', (req, res, ctx) => {
          return res(
            ctx.json({
              columns: ['Product', 'Q1 Sales', 'Q2 Sales', 'Q3 Sales', 'Q4 Sales'],
              rows: [
                ['Laptops', '15000', '18000', '22000', '25000'],
                ['Desktops', '8000', '7500', '9000', '12000'],
                ['Accessories', '5000', '5500', '6000', '7500']
              ],
              totalRows: 3,
              dataTypes: {
                'Product': 'string',
                'Q1 Sales': 'number',
                'Q2 Sales': 'number',
                'Q3 Sales': 'number',
                'Q4 Sales': 'number'
              },
              errors: []
            })
          )
        })
      )

      render(<ReportDesigner />)

      // Upload CSV file
      await user.click(screen.getByRole('button', { name: /connect data source/i }))
      await user.selectOptions(screen.getByLabelText(/source type/i), 'csv')

      const fileInput = screen.getByLabelText(/upload csv file/i)
      const csvContent = `Product,Q1 Sales,Q2 Sales,Q3 Sales,Q4 Sales
Laptops,15000,18000,22000,25000
Desktops,8000,7500,9000,12000
Accessories,5000,5500,6000,7500`

      const csvFile = new File([csvContent], 'sales-data.csv', { type: 'text/csv' })
      await user.upload(fileInput, csvFile)

      // Verify parsing and preview
      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeInTheDocument()
        expect(screen.getByText('15000')).toBeInTheDocument()
        expect(screen.getByText('Desktops')).toBeInTheDocument()
      })

      // Verify column detection
      expect(screen.getByText('Product')).toBeInTheDocument()
      expect(screen.getByText('Q1 Sales')).toBeInTheDocument()
      expect(screen.getByText('Q4 Sales')).toBeInTheDocument()

      // Save data source
      await user.type(screen.getByLabelText(/data source name/i), 'Q4 Sales Data')
      await user.click(screen.getByRole('button', { name: /save data source/i }))

      // Add table component for data binding
      const tableComponent = screen.getByTestId('palette-table')
      const canvas = screen.getByTestId('design-canvas')
      
      await user.pointer([
        { keys: '[MouseLeft>]', target: tableComponent },
        { coords: { x: 100, y: 200 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      // Bind data to table
      const addedTable = await screen.findByTestId(/component-table-/)
      await user.click(addedTable)
      
      await user.click(screen.getByRole('tab', { name: /data/i }))
      await user.selectOptions(screen.getByLabelText(/data source/i), 'Q4 Sales Data')

      // Verify data binding
      await waitFor(() => {
        expect(screen.getByText(/data bound successfully/i)).toBeInTheDocument()
      })

      // Test data preview in table
      expect(screen.getByText('Laptops')).toBeInTheDocument()
      expect(screen.getByText('25000')).toBeInTheDocument() // Q4 sales
    })

    test('validates data transformations and calculations', async () => {
      const user = userEvent.setup()
      
      render(<ReportDesigner />)

      // Setup: Add table with numeric data
      const tableComponent = screen.getByTestId('palette-table')
      const canvas = screen.getByTestId('design-canvas')
      
      await user.pointer([
        { keys: '[MouseLeft>]', target: tableComponent },
        { coords: { x: 100, y: 200 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      const addedTable = await screen.findByTestId(/component-table-/)
      await user.click(addedTable)

      // Configure calculations
      await user.click(screen.getByRole('tab', { name: /data/i }))
      await user.click(screen.getByRole('button', { name: /add calculated column/i }))

      // Create total sales calculation
      const calculationInput = screen.getByLabelText(/calculation formula/i)
      await user.type(calculationInput, 'SUM(Q1_Sales, Q2_Sales, Q3_Sales, Q4_Sales)')
      
      const columnNameInput = screen.getByLabelText(/column name/i)
      await user.type(columnNameInput, 'Total Sales')

      await user.click(screen.getByRole('button', { name: /apply calculation/i }))

      // Verify calculation applied
      await waitFor(() => {
        expect(screen.getByText('Total Sales')).toBeInTheDocument()
        expect(screen.getByText(/calculation applied/i)).toBeInTheDocument()
      })

      // Test filtering
      await user.click(screen.getByRole('button', { name: /add filter/i }))
      await user.selectOptions(screen.getByLabelText(/filter column/i), 'Total Sales')
      await user.selectOptions(screen.getByLabelText(/filter operator/i), 'greater_than')
      await user.type(screen.getByLabelText(/filter value/i), '50000')

      await user.click(screen.getByRole('button', { name: /apply filter/i }))

      // Verify filter applied
      await waitFor(() => {
        expect(screen.getByText(/filter applied/i)).toBeInTheDocument()
      })
    })
  })

  describe('Export and Generation Workflow', () => {
    test('generates PDF with complex multi-page layout', async () => {
      const user = userEvent.setup()
      
      // Mock PDF generation with processing time
      server.use(
        rest.post('/api/generate-pdf', (req, res, ctx) => {
          return res(
            ctx.delay(3000), // 3 second processing time
            ctx.set('Content-Type', 'application/pdf'),
            ctx.set('Content-Disposition', 'attachment; filename="complex-report.pdf"'),
            ctx.body(new ArrayBuffer(100000)) // 100KB PDF
          )
        })
      )

      render(<ReportDesigner />)

      // Create multi-page layout
      const components = [
        'page-header', 'heading', 'text', 'table', 'chart', 
        'page-footer', 'heading', 'table', 'image'
      ]

      for (let i = 0; i < components.length; i++) {
        const component = screen.getByTestId(`palette-${components[i]}`)
        const canvas = screen.getByTestId('design-canvas')
        
        await user.pointer([
          { keys: '[MouseLeft>]', target: component },
          { coords: { x: 100, y: 100 + (i * 80) }, target: canvas },
          { keys: '[/MouseLeft]' },
        ])
      }

      // Verify all components added
      const allComponents = screen.getAllByTestId(/component-/)
      expect(allComponents.length).toBe(components.length)

      // Generate PDF
      const startTime = performance.now()
      await user.click(screen.getByRole('button', { name: /generate pdf/i }))

      // Verify processing indicator
      expect(screen.getByText(/generating pdf/i)).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/pdf generated successfully/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      const endTime = performance.now()
      const generationTime = (endTime - startTime) / 1000

      // Verify performance requirements
      expect(generationTime).toBeLessThan(5) // Under 5 seconds for complex report

      // Verify download available
      const downloadButton = screen.getByRole('button', { name: /download pdf/i })
      expect(downloadButton).toBeInTheDocument()
      expect(downloadButton).not.toBeDisabled()

      // Test download
      await user.click(downloadButton)
      expect(screen.getByText(/download started/i)).toBeInTheDocument()
    })

    test('handles batch report generation for multiple data sets', async () => {
      const user = userEvent.setup()
      
      // Mock batch generation endpoint
      server.use(
        rest.post('/api/generate-batch-pdf', (req, res, ctx) => {
          const { datasets } = req.body
          
          return res(
            ctx.delay(2000 * datasets.length), // 2 seconds per dataset
            ctx.json({
              success: true,
              batchId: 'batch-123',
              reportCount: datasets.length,
              downloadUrls: datasets.map((_, i) => `/downloads/report-${i + 1}.pdf`)
            })
          )
        })
      )

      render(<ReportDesigner />)

      // Create template with data binding
      const tableComponent = screen.getByTestId('palette-table')
      const canvas = screen.getByTestId('design-canvas')
      
      await user.pointer([
        { keys: '[MouseLeft>]', target: tableComponent },
        { coords: { x: 100, y: 200 }, target: canvas },
        { keys: '[/MouseLeft]' },
      ])

      // Configure for batch generation
      await user.click(screen.getByRole('button', { name: /generate options/i }))
      await user.check(screen.getByLabelText(/batch generation/i))

      // Select multiple datasets
      await user.selectOptions(screen.getByLabelText(/data sources/i), [
        'Q1-2024-Data',
        'Q2-2024-Data', 
        'Q3-2024-Data',
        'Q4-2024-Data'
      ])

      // Start batch generation
      await user.click(screen.getByRole('button', { name: /generate batch/i }))

      // Verify batch processing
      expect(screen.getByText(/generating 4 reports/i)).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/batch generation complete/i)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Verify all reports generated
      expect(screen.getByText(/4 reports generated successfully/i)).toBeInTheDocument()
      
      const downloadLinks = screen.getAllByRole('link', { name: /download report/i })
      expect(downloadLinks).toHaveLength(4)
    })
  })

  describe('Performance and Error Handling', () => {
    test('handles large dataset processing efficiently', async () => {
      const user = userEvent.setup()
      
      // Mock large dataset
      const largeDataset = {
        columns: Array.from({ length: 20 }, (_, i) => `Column_${i + 1}`),
        rows: Array.from({ length: 1000 }, (_, i) => 
          Array.from({ length: 20 }, (_, j) => `Row_${i + 1}_Col_${j + 1}`)
        )
      }

      server.use(
        rest.post('/api/data-sources/preview', (req, res, ctx) => {
          return res(
            ctx.delay(1000), // 1 second processing time
            ctx.json({
              ...largeDataset,
              totalRows: 1000,
              pageSize: 50,
              currentPage: 1
            })
          )
        })
      )

      render(<ReportDesigner />)

      const startTime = performance.now()

      // Upload large CSV
      await user.click(screen.getByRole('button', { name: /connect data source/i }))
      await user.selectOptions(screen.getByLabelText(/source type/i), 'csv')

      const largeFile = new File(['large-dataset-content'], 'large-data.csv', { type: 'text/csv' })
      const fileInput = screen.getByLabelText(/upload csv file/i)
      await user.upload(fileInput, largeFile)

      // Wait for processing
      await waitFor(() => {
        expect(screen.getByText(/processing large dataset/i)).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Row_1_Col_1')).toBeInTheDocument()
      }, { timeout: 5000 })

      const endTime = performance.now()
      const processingTime = (endTime - startTime) / 1000

      // Verify performance
      expect(processingTime).toBeLessThan(3) // Under 3 seconds
      
      // Verify pagination for large dataset
      expect(screen.getByText(/showing 1-50 of 1000/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()

      // Test pagination
      await user.click(screen.getByRole('button', { name: /next page/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/showing 51-100 of 1000/i)).toBeInTheDocument()
      })
    })

    test('handles network errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock network failure
      server.use(
        rest.post('/api/templates', (req, res, ctx) => {
          return res.networkError('Network connection failed')
        }),
        
        rest.post('/api/generate-pdf', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            error: 'PDF generation service unavailable'
          }))
        })
      )

      render(<ReportDesigner />)

      // Try to save template (network error)
      await user.click(screen.getByRole('button', { name: /save template/i }))
      await user.type(screen.getByLabelText(/template name/i), 'Test Template')
      await user.click(screen.getByRole('button', { name: /save/i }))

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })

      // Try PDF generation (server error)
      await user.click(screen.getByRole('button', { name: /generate pdf/i }))

      await waitFor(() => {
        expect(screen.getByText(/pdf generation service unavailable/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })

      // Verify app remains functional
      expect(screen.getByTestId('design-canvas')).toBeInTheDocument()
      expect(screen.getByTestId('component-palette')).toBeInTheDocument()
    })
  })
})