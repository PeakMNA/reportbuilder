/**
 * Mock Service Worker (MSW) Server Setup
 * 
 * This file sets up a mock server using MSW for API testing.
 * It intercepts HTTP requests and provides mock responses for testing.
 */

import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock API handlers
export const handlers = [
  // Template Management APIs
  rest.get('/api/templates', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Financial Statement Template',
          category: 'Finance',
          description: 'Standard financial reporting template with balance sheet and income statement',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          thumbnail: '/templates/financial-statement-thumb.png',
          isPublic: true,
          tags: ['finance', 'accounting', 'quarterly'],
          componentCount: 8,
        },
        {
          id: '2',
          name: 'Quarterly Report Template',
          category: 'Reports',
          description: 'Comprehensive quarterly business report template',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          thumbnail: '/templates/quarterly-report-thumb.png',
          isPublic: true,
          tags: ['quarterly', 'business', 'executive'],
          componentCount: 12,
        },
        {
          id: '3',
          name: 'Sales Dashboard Template',
          category: 'Analytics',
          description: 'Sales performance dashboard with charts and KPIs',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
          thumbnail: '/templates/sales-dashboard-thumb.png',
          isPublic: false,
          tags: ['sales', 'dashboard', 'kpi'],
          componentCount: 15,
        },
      ])
    )
  }),

  rest.get('/api/templates/:id', (req, res, ctx) => {
    const { id } = req.params
    
    const templates = {
      '1': {
        id: '1',
        name: 'Financial Statement Template',
        description: 'Standard financial reporting template',
        category: 'Finance',
        components: [
          {
            id: 'header-1',
            type: 'page-header',
            name: 'Page Header',
            x: 0,
            y: 0,
            width: 800,
            height: 60,
            properties: {
              content: 'Financial Statement Q4 2024',
              fontSize: 18,
              fontWeight: 'bold',
              backgroundColor: '#f8f9fa',
              textAlign: 'center',
            },
          },
          {
            id: 'logo-1',
            type: 'image',
            name: 'Company Logo',
            x: 50,
            y: 10,
            width: 100,
            height: 40,
            properties: {
              src: '/images/company-logo.png',
              alt: 'Company Logo',
              objectFit: 'contain',
            },
          },
          {
            id: 'balance-sheet-1',
            type: 'table',
            name: 'Balance Sheet',
            x: 50,
            y: 100,
            width: 700,
            height: 300,
            properties: {
              title: 'Balance Sheet',
              columns: ['Account', 'Amount'],
              showHeader: true,
              borderStyle: 'solid',
              dataSource: '{{balance_sheet_data}}',
              formatting: {
                currency: 'USD',
                decimals: 2,
              },
            },
          },
          {
            id: 'income-statement-1',
            type: 'table',
            name: 'Income Statement',
            x: 50,
            y: 450,
            width: 700,
            height: 250,
            properties: {
              title: 'Income Statement',
              columns: ['Item', 'Amount'],
              showHeader: true,
              borderStyle: 'solid',
              dataSource: '{{income_statement_data}}',
              formatting: {
                currency: 'USD',
                decimals: 2,
              },
            },
          },
          {
            id: 'footer-1',
            type: 'page-footer',
            name: 'Page Footer',
            x: 0,
            y: 750,
            width: 800,
            height: 40,
            properties: {
              content: 'Page {{page}} of {{total_pages}} | Generated on {{date}}',
              fontSize: 10,
              textAlign: 'center',
              showPageNumbers: true,
            },
          },
        ],
        metadata: {
          version: '1.0',
          author: 'System',
          lastModified: '2024-01-01T00:00:00Z',
          tags: ['finance', 'accounting'],
        },
      },
      '2': {
        id: '2',
        name: 'Quarterly Report Template',
        description: 'Quarterly business report',
        category: 'Reports',
        components: [
          {
            id: 'header-1',
            type: 'page-header',
            name: 'Report Header',
            x: 0,
            y: 0,
            width: 800,
            height: 80,
            properties: {
              content: 'Quarterly Business Report',
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          {
            id: 'summary-1',
            type: 'text',
            name: 'Executive Summary',
            x: 50,
            y: 120,
            width: 700,
            height: 100,
            properties: {
              content: 'Executive Summary section placeholder',
              fontSize: 14,
            },
          },
        ],
      },
    }
    
    const template = templates[id]
    
    if (template) {
      return res(ctx.status(200), ctx.json(template))
    } else {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Template not found' })
      )
    }
  }),

  rest.post('/api/templates', (req, res, ctx) => {
    const templateData = req.body
    
    return res(
      ctx.status(201),
      ctx.json({
        id: `template-${Date.now()}`,
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        success: true,
        message: 'Template saved successfully',
      })
    )
  }),

  rest.put('/api/templates/:id', (req, res, ctx) => {
    const { id } = req.params
    const updateData = req.body
    
    return res(
      ctx.status(200),
      ctx.json({
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
        success: true,
        message: 'Template updated successfully',
      })
    )
  }),

  rest.delete('/api/templates/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Template deleted successfully',
      })
    )
  }),

  // Data Source Management APIs
  rest.get('/api/data-sources', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'ds-1',
          name: 'Production Financial DB',
          type: 'sql',
          connectionString: 'Server=prod-sql.company.com;Database=FinancialDB',
          status: 'connected',
          lastTested: '2024-01-01T12:00:00Z',
          schema: ['Users', 'Accounts', 'Transactions', 'Reports'],
        },
        {
          id: 'ds-2',
          name: 'Sales API',
          type: 'rest-api',
          endpoint: 'https://api.company.com/sales',
          status: 'connected',
          lastTested: '2024-01-01T11:30:00Z',
          endpoints: ['/daily', '/monthly', '/quarterly'],
        },
        {
          id: 'ds-3',
          name: 'Q4 Financial Data',
          type: 'csv',
          filename: 'q4-financial-data.csv',
          status: 'ready',
          uploadedAt: '2024-01-01T10:00:00Z',
          rowCount: 1250,
          columns: ['Date', 'Account', 'Amount', 'Category', 'Description'],
        },
      ])
    )
  }),

  rest.post('/api/data-sources/test-connection', (req, res, ctx) => {
    const { type, host, database, apiUrl, credentials } = req.body
    
    // Simulate connection testing
    if (type === 'sql' && host && database) {
      return res(
        ctx.delay(1000), // Simulate network delay
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'Database connection successful',
          connectionId: 'conn-123',
          metadata: {
            serverVersion: '14.0.1000.169',
            database: database,
            schema: ['dbo', 'reporting', 'staging'],
            tables: ['Users', 'Orders', 'Products', 'FinancialData'],
          },
        })
      )
    }
    
    if (type === 'rest-api' && apiUrl) {
      return res(
        ctx.delay(800),
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'API connection successful',
          connectionId: 'api-456',
          metadata: {
            version: '2.1',
            endpoints: ['/reports/data', '/analytics/metrics', '/financial/summary'],
            rateLimit: '1000 requests/hour',
          },
        })
      )
    }
    
    if (type === 'csv') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'CSV file validation successful',
          metadata: {
            rowCount: 1000,
            columnCount: 5,
            hasHeaders: true,
            encoding: 'UTF-8',
          },
        })
      )
    }
    
    return res(
      ctx.status(400),
      ctx.json({
        success: false,
        message: 'Invalid connection parameters',
        errors: ['Missing required fields'],
      })
    )
  }),

  rest.post('/api/data-sources/preview', (req, res, ctx) => {
    const { dataSourceId, query, limit = 100 } = req.body
    
    return res(
      ctx.delay(500),
      ctx.status(200),
      ctx.json({
        columns: ['Name', 'Value', 'Category', 'Date', 'Amount'],
        rows: [
          ['Product A', '1000', 'Electronics', '2024-01-01', '$1,250.00'],
          ['Product B', '750', 'Electronics', '2024-01-02', '$875.50'],
          ['Service C', '500', 'Services', '2024-01-03', '$2,100.00'],
          ['Product D', '1200', 'Electronics', '2024-01-04', '$950.75'],
          ['Service E', '300', 'Services', '2024-01-05', '$1,800.25'],
        ],
        totalRows: 1247,
        hasMore: true,
        dataTypes: {
          Name: 'string',
          Value: 'number',
          Category: 'string',
          Date: 'date',
          Amount: 'currency',
        },
        summary: {
          recordCount: 1247,
          dateRange: { start: '2024-01-01', end: '2024-12-31' },
          categories: ['Electronics', 'Services', 'Software'],
          valueStats: { min: 50, max: 5000, avg: 850 },
        },
      })
    )
  }),

  rest.get('/api/data-sources/latest', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'latest-financial-data',
        name: 'Q4 2024 Financial Data',
        type: 'sql',
        lastUpdated: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        recordCount: 2847,
        status: 'ready',
        preview: {
          balance_sheet_data: [
            ['Cash and Cash Equivalents', '$150,000'],
            ['Accounts Receivable', '$85,000'],
            ['Inventory', '$120,000'],
            ['Total Current Assets', '$355,000'],
            ['Property, Plant & Equipment', '$450,000'],
            ['Total Assets', '$805,000'],
          ],
          income_statement_data: [
            ['Revenue', '$2,500,000'],
            ['Cost of Goods Sold', '$1,200,000'],
            ['Gross Profit', '$1,300,000'],
            ['Operating Expenses', '$850,000'],
            ['Operating Income', '$450,000'],
            ['Net Income', '$375,000'],
          ],
        },
      })
    )
  }),

  // CSV Parsing API
  rest.post('/api/parse-csv', (req, res, ctx) => {
    // Simulate CSV parsing
    return res(
      ctx.delay(300),
      ctx.status(200),
      ctx.json({
        columns: ['Product', 'Price', 'Category', 'Stock', 'Supplier'],
        rows: [
          ['Laptop Pro 15"', '1999.99', 'Electronics', '45', 'TechCorp'],
          ['Wireless Mouse', '29.99', 'Electronics', '120', 'TechCorp'],
          ['Office Desk', '299.99', 'Furniture', '15', 'OfficePlus'],
          ['Ergonomic Chair', '449.99', 'Furniture', '8', 'OfficePlus'],
          ['Monitor 27"', '329.99', 'Electronics', '32', 'DisplayTech'],
        ],
        totalRows: 150,
        dataTypes: {
          Product: 'string',
          Price: 'number',
          Category: 'string',
          Stock: 'number',
          Supplier: 'string',
        },
        errors: [],
        warnings: [],
        encoding: 'UTF-8',
        delimiter: ',',
        hasHeaders: true,
      })
    )
  }),

  // PDF Generation APIs
  rest.post('/api/generate-pdf', (req, res, ctx) => {
    const { templateId, components, dataBindings, options = {} } = req.body
    
    // Simulate processing time based on complexity
    const componentCount = components?.length || 5
    const processingTime = Math.min(componentCount * 200, 5000) // Max 5 seconds
    
    return res(
      ctx.delay(processingTime),
      ctx.set('Content-Type', 'application/pdf'),
      ctx.set('Content-Disposition', 'attachment; filename="report.pdf"'),
      ctx.set('X-Generation-Time', processingTime.toString()),
      ctx.body(new ArrayBuffer(Math.max(50000, componentCount * 10000))) // Realistic PDF size
    )
  }),

  rest.post('/api/generate-batch-pdf', (req, res, ctx) => {
    const { templateId, datasets, options = {} } = req.body
    const reportCount = datasets?.length || 1
    
    return res(
      ctx.delay(2000 * reportCount), // 2 seconds per report
      ctx.status(200),
      ctx.json({
        success: true,
        batchId: `batch-${Date.now()}`,
        reportCount,
        estimatedTime: reportCount * 2,
        status: 'processing',
        downloadUrls: datasets.map((_, i) => `/downloads/batch-${Date.now()}/report-${i + 1}.pdf`),
        metadata: {
          totalSize: reportCount * 75000, // Estimated total size
          generatedAt: new Date().toISOString(),
        },
      })
    )
  }),

  rest.get('/api/generate-pdf/status/:jobId', (req, res, ctx) => {
    const { jobId } = req.params
    
    return res(
      ctx.status(200),
      ctx.json({
        jobId,
        status: 'completed',
        progress: 100,
        downloadUrl: `/downloads/${jobId}/report.pdf`,
        generatedAt: new Date().toISOString(),
        fileSize: 87532,
      })
    )
  }),

  // File Upload API
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.delay(1000),
      ctx.status(200),
      ctx.json({
        success: true,
        fileId: `file-${Date.now()}`,
        filename: 'uploaded-file.csv',
        size: 15847,
        url: `/uploads/file-${Date.now()}.csv`,
        uploadedAt: new Date().toISOString(),
      })
    )
  }),

  // Component Library API
  rest.get('/api/components', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'text',
          name: 'Text',
          category: 'Basic',
          icon: 'Type',
          description: 'Simple text component with formatting options',
          defaultProps: {
            content: 'Sample Text',
            fontSize: 14,
            fontWeight: 'normal',
            color: '#000000',
            alignment: 'left',
          },
        },
        {
          id: 'table',
          name: 'Table',
          category: 'Data',
          icon: 'Table',
          description: 'Data table with sorting and filtering',
          defaultProps: {
            columns: ['Column 1', 'Column 2', 'Column 3'],
            showHeader: true,
            borderStyle: 'solid',
            rowsPerPage: 10,
          },
        },
        {
          id: 'chart',
          name: 'Chart',
          category: 'Visualization',
          icon: 'BarChart',
          description: 'Various chart types for data visualization',
          defaultProps: {
            chartType: 'bar',
            title: 'Chart Title',
            showLegend: true,
            colors: ['#3b82f6', '#ef4444', '#10b981'],
          },
        },
      ])
    )
  }),

  // Error simulation endpoints for testing error handling
  rest.get('/api/error-test/500', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the server',
        code: 'INTERNAL_ERROR',
      })
    )
  }),

  rest.get('/api/error-test/timeout', (req, res, ctx) => {
    return res(
      ctx.delay(30000), // 30 second delay to trigger timeout
      ctx.status(200),
      ctx.json({ message: 'This should timeout' })
    )
  }),

  rest.get('/api/error-test/network', (req, res, ctx) => {
    return res.networkError('Network connection failed')
  }),

  // Health check endpoint
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: 3600,
        services: {
          database: 'connected',
          redis: 'connected',
          storage: 'available',
        },
      })
    )
  }),
]

// Create and export the server
export const server = setupServer(...handlers)