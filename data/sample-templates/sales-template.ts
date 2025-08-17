import { ReportTemplate } from '@/types/template'
import { salesData } from './sample-data'

export const salesTemplate: ReportTemplate = {
  id: 'template-sales-001',
  name: 'Monthly Sales Report',
  description: 'Comprehensive sales analysis report with revenue charts, product performance tables, and regional comparison',
  category: 'analytics',
  components: [
    // Report Header
    {
      id: 'comp-report-title',
      type: 'heading',
      name: 'Report Title',
      x: 50,
      y: 50,
      width: 400,
      height: 40,
      properties: {
        text: 'Monthly Sales Report',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a365d',
        align: 'left'
      }
    },
    {
      id: 'comp-report-period',
      type: 'text-label',
      name: 'Report Period',
      x: 50,
      y: 100,
      width: 200,
      height: 25,
      properties: {
        text: 'Q2 2024',
        fontSize: 16,
        color: '#4a5568',
        align: 'left'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.reportPeriod'
      }
    },
    {
      id: 'comp-generated-date',
      type: 'text-label',
      name: 'Generated Date',
      x: 450,
      y: 100,
      width: 150,
      height: 25,
      properties: {
        text: 'Generated: 2024-01-15',
        fontSize: 12,
        color: '#718096',
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.currentDate',
        format: 'Generated: {value}'
      }
    },

    // Executive Summary Section
    {
      id: 'comp-summary-header',
      type: 'heading',
      name: 'Executive Summary',
      x: 50,
      y: 160,
      width: 200,
      height: 30,
      properties: {
        text: 'Executive Summary',
        fontSize: 20,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    
    // KPI Cards
    {
      id: 'comp-total-revenue',
      type: 'rectangle',
      name: 'Revenue Card Background',
      x: 50,
      y: 200,
      width: 130,
      height: 80,
      properties: {
        backgroundColor: '#edf2f7',
        borderColor: '#cbd5e0',
        borderWidth: 1,
        borderRadius: 8
      }
    },
    {
      id: 'comp-revenue-label',
      type: 'text-label',
      name: 'Revenue Label',
      x: 60,
      y: 210,
      width: 110,
      height: 20,
      properties: {
        text: 'Total Revenue',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },
    {
      id: 'comp-revenue-value',
      type: 'text-label',
      name: 'Revenue Value',
      x: 60,
      y: 235,
      width: 110,
      height: 30,
      properties: {
        text: '$3,201,000',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3748',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.totalRevenue',
        format: 'currency'
      }
    },

    {
      id: 'comp-growth-card',
      type: 'rectangle',
      name: 'Growth Card Background',
      x: 200,
      y: 200,
      width: 130,
      height: 80,
      properties: {
        backgroundColor: '#f0fff4',
        borderColor: '#9ae6b4',
        borderWidth: 1,
        borderRadius: 8
      }
    },
    {
      id: 'comp-growth-label',
      type: 'text-label',
      name: 'Growth Label',
      x: 210,
      y: 210,
      width: 110,
      height: 20,
      properties: {
        text: 'Growth Rate',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },
    {
      id: 'comp-growth-value',
      type: 'text-label',
      name: 'Growth Value',
      x: 210,
      y: 235,
      width: 110,
      height: 30,
      properties: {
        text: '+8.5%',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#38a169',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.growthRate',
        format: '+{value}%'
      }
    },

    {
      id: 'comp-performer-card',
      type: 'rectangle',
      name: 'Top Performer Card Background',
      x: 350,
      y: 200,
      width: 130,
      height: 80,
      properties: {
        backgroundColor: '#fffaf0',
        borderColor: '#fbd38d',
        borderWidth: 1,
        borderRadius: 8
      }
    },
    {
      id: 'comp-performer-label',
      type: 'text-label',
      name: 'Top Performer Label',
      x: 360,
      y: 210,
      width: 110,
      height: 20,
      properties: {
        text: 'Top Performer',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },
    {
      id: 'comp-performer-value',
      type: 'text-label',
      name: 'Top Performer Value',
      x: 360,
      y: 235,
      width: 110,
      height: 30,
      properties: {
        text: 'East Region',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#d69e2e',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.topPerformer'
      }
    },

    // Monthly Revenue Chart
    {
      id: 'comp-chart-header',
      type: 'heading',
      name: 'Monthly Trends Header',
      x: 50,
      y: 320,
      width: 200,
      height: 30,
      properties: {
        text: 'Monthly Revenue Trends',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-revenue-chart',
      type: 'chart',
      name: 'Monthly Revenue Chart',
      x: 50,
      y: 360,
      width: 520,
      height: 200,
      properties: {
        chartType: 'line',
        title: 'Revenue by Month and Region',
        xAxisLabel: 'Month',
        yAxisLabel: 'Revenue ($)',
        showGrid: true,
        showLegend: true,
        colors: ['#4299e1', '#48bb78'],
        backgroundColor: '#ffffff',
        borderRadius: 8
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'sales',
        format: 'chart',
        aggregation: 'sum'
      }
    },

    // Product Performance Table
    {
      id: 'comp-products-header',
      type: 'heading',
      name: 'Product Performance Header',
      x: 50,
      y: 600,
      width: 200,
      height: 30,
      properties: {
        text: 'Product Performance',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-products-table',
      type: 'table',
      name: 'Products Table',
      x: 50,
      y: 640,
      width: 520,
      height: 150,
      properties: {
        columns: [
          { key: 'name', header: 'Product', width: '30%', align: 'left' },
          { key: 'category', header: 'Category', width: '20%', align: 'left' },
          { key: 'q1', header: 'Q1 Sales', width: '20%', align: 'right', format: 'currency' },
          { key: 'q2', header: 'Q2 Sales', width: '20%', align: 'right', format: 'currency' },
          { key: 'growth', header: 'Growth %', width: '10%', align: 'right', format: 'percentage' }
        ],
        showHeader: true,
        borderStyle: 'grid',
        headerBg: '#f7fafc',
        alternateRows: true,
        fontSize: 11
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'products'
      }
    },

    // Regional Performance
    {
      id: 'comp-regions-header',
      type: 'heading',
      name: 'Regional Performance Header',
      x: 50,
      y: 820,
      width: 200,
      height: 30,
      properties: {
        text: 'Regional Performance',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-regions-table',
      type: 'table',
      name: 'Regions Table',
      x: 50,
      y: 860,
      width: 520,
      height: 120,
      properties: {
        columns: [
          { key: 'name', header: 'Region', width: '20%', align: 'left' },
          { key: 'manager', header: 'Manager', width: '25%', align: 'left' },
          { key: 'ytdSales', header: 'YTD Sales', width: '20%', align: 'right', format: 'currency' },
          { key: 'target', header: 'Target', width: '20%', align: 'right', format: 'currency' },
          { key: 'performance', header: 'Performance %', width: '15%', align: 'right', format: 'percentage' }
        ],
        showHeader: true,
        borderStyle: 'grid',
        headerBg: '#f7fafc',
        alternateRows: true,
        fontSize: 11
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'regions'
      }
    },

    // Footer
    {
      id: 'comp-footer-line',
      type: 'line-divider',
      name: 'Footer Divider',
      x: 50,
      y: 1020,
      width: 520,
      height: 2,
      properties: {
        color: '#e2e8f0',
        thickness: 1
      }
    },
    {
      id: 'comp-footer-text',
      type: 'text-label',
      name: 'Footer Text',
      x: 50,
      y: 1030,
      width: 520,
      height: 20,
      properties: {
        text: 'This report is generated automatically and contains confidential business information.',
        fontSize: 10,
        color: '#a0aec0',
        align: 'center',
        style: 'italic'
      }
    }
  ],
  sampleData: salesData,
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    version: '1.0.0',
    tags: ['sales', 'analytics', 'report', 'charts', 'performance'],
    isBuiltIn: true,
    testCoverage: 0
  },
  validation: {
    requiredDataSources: ['sales', 'products', 'regions'],
    requiredFields: {
      sales: ['month', 'revenue', 'units', 'region'],
      products: ['name', 'category', 'q1', 'q2', 'growth'],
      regions: ['name', 'manager', 'ytdSales', 'target', 'performance']
    },
    validationRules: [
      {
        field: 'sales.revenue',
        type: 'required',
        message: 'Sales revenue is required'
      },
      {
        field: 'products',
        type: 'required',
        message: 'Product data is required'
      }
    ]
  }
}