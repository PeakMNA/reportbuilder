import { ReportTemplate } from '@/types/template'
import { inventoryData } from './sample-data'

export const inventoryTemplate: ReportTemplate = {
  id: 'template-inventory-001',
  name: 'Inventory Status Report',
  description: 'Comprehensive inventory management report with stock levels, supplier information, and reorder alerts',
  category: 'inventory',
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
        text: 'Inventory Status Report',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a365d',
        align: 'left'
      }
    },
    {
      id: 'comp-warehouse-location',
      type: 'text-label',
      name: 'Warehouse Location',
      x: 50,
      y: 100,
      width: 300,
      height: 25,
      properties: {
        text: 'Main Warehouse - Building A',
        fontSize: 14,
        color: '#4a5568',
        align: 'left'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.warehouseLocation'
      }
    },
    {
      id: 'comp-report-date',
      type: 'text-label',
      name: 'Report Date',
      x: 450,
      y: 100,
      width: 150,
      height: 25,
      properties: {
        text: 'As of: 2024-01-15',
        fontSize: 12,
        color: '#718096',
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.reportDate',
        format: 'As of: {value}'
      }
    },

    // Inventory Summary Cards
    {
      id: 'comp-summary-header',
      type: 'heading',
      name: 'Inventory Summary',
      x: 50,
      y: 160,
      width: 200,
      height: 30,
      properties: {
        text: 'Inventory Summary',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },

    // Total Value Card
    {
      id: 'comp-total-value-card',
      type: 'rectangle',
      name: 'Total Value Card',
      x: 50,
      y: 200,
      width: 120,
      height: 80,
      properties: {
        backgroundColor: '#edf2f7',
        borderColor: '#cbd5e0',
        borderWidth: 1,
        borderRadius: 8
      }
    },
    {
      id: 'comp-total-value-label',
      type: 'text-label',
      name: 'Total Value Label',
      x: 60,
      y: 210,
      width: 100,
      height: 20,
      properties: {
        text: 'Total Value',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },
    {
      id: 'comp-total-value',
      type: 'text-label',
      name: 'Total Value',
      x: 60,
      y: 235,
      width: 100,
      height: 30,
      properties: {
        text: '$198,000',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3748',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.totalInventoryValue',
        format: 'currency'
      }
    },

    // Low Stock Alert Card
    {
      id: 'comp-low-stock-card',
      type: 'rectangle',
      name: 'Low Stock Card',
      x: 190,
      y: 200,
      width: 120,
      height: 80,
      properties: {
        backgroundColor: '#fef5e7',
        borderColor: '#f6ad55',
        borderWidth: 1,
        borderRadius: 8
      }
    },
    {
      id: 'comp-low-stock-label',
      type: 'text-label',
      name: 'Low Stock Label',
      x: 200,
      y: 210,
      width: 100,
      height: 20,
      properties: {
        text: 'Low Stock Items',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },
    {
      id: 'comp-low-stock-count',
      type: 'text-label',
      name: 'Low Stock Count',
      x: 200,
      y: 235,
      width: 100,
      height: 30,
      properties: {
        text: '3',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d69e2e',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.lowStockItems'
      }
    },

    // Critical Stock Alert Card
    {
      id: 'comp-critical-stock-card',
      type: 'rectangle',
      name: 'Critical Stock Card',
      x: 330,
      y: 200,
      width: 120,
      height: 80,
      properties: {
        backgroundColor: '#fed7d7',
        borderColor: '#fc8181',
        borderWidth: 1,
        borderRadius: 8
      }
    },
    {
      id: 'comp-critical-stock-label',
      type: 'text-label',
      name: 'Critical Stock Label',
      x: 340,
      y: 210,
      width: 100,
      height: 20,
      properties: {
        text: 'Critical Stock',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },
    {
      id: 'comp-critical-stock-count',
      type: 'text-label',
      name: 'Critical Stock Count',
      x: 340,
      y: 235,
      width: 100,
      height: 30,
      properties: {
        text: '2',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e53e3e',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.criticalStockItems'
      }
    },

    // Inventory Items Table
    {
      id: 'comp-inventory-header',
      type: 'heading',
      name: 'Inventory Items Header',
      x: 50,
      y: 320,
      width: 200,
      height: 30,
      properties: {
        text: 'Current Inventory',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-inventory-table',
      type: 'table',
      name: 'Inventory Items Table',
      x: 50,
      y: 360,
      width: 520,
      height: 200,
      properties: {
        columns: [
          { key: 'sku', header: 'SKU', width: '12%', align: 'left' },
          { key: 'name', header: 'Product Name', width: '25%', align: 'left' },
          { key: 'category', header: 'Category', width: '15%', align: 'left' },
          { key: 'stock', header: 'Stock', width: '8%', align: 'right' },
          { key: 'reorderLevel', header: 'Reorder', width: '8%', align: 'right' },
          { key: 'unitCost', header: 'Unit Cost', width: '12%', align: 'right', format: 'currency' },
          { key: 'totalValue', header: 'Total Value', width: '12%', align: 'right', format: 'currency' },
          { key: 'supplier', header: 'Supplier', width: '8%', align: 'left' }
        ],
        showHeader: true,
        borderStyle: 'grid',
        headerBg: '#f7fafc',
        alternateRows: true,
        fontSize: 10,
        conditionalFormatting: [
          {
            condition: 'stock < reorderLevel',
            style: { backgroundColor: '#fed7d7', color: '#c53030' }
          }
        ]
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'inventory'
      }
    },

    // Category Analysis
    {
      id: 'comp-category-header',
      type: 'heading',
      name: 'Category Analysis Header',
      x: 50,
      y: 590,
      width: 200,
      height: 30,
      properties: {
        text: 'Category Analysis',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-category-table',
      type: 'table',
      name: 'Category Analysis Table',
      x: 50,
      y: 630,
      width: 400,
      height: 120,
      properties: {
        columns: [
          { key: 'name', header: 'Category', width: '30%', align: 'left' },
          { key: 'totalItems', header: 'Items', width: '20%', align: 'right' },
          { key: 'totalValue', header: 'Total Value', width: '30%', align: 'right', format: 'currency' },
          { key: 'avgTurnover', header: 'Avg Turnover', width: '20%', align: 'right', format: 'decimal' }
        ],
        showHeader: true,
        borderStyle: 'grid',
        headerBg: '#f7fafc',
        alternateRows: true,
        fontSize: 11
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'categories'
      }
    },

    // Supplier Information
    {
      id: 'comp-supplier-header',
      type: 'heading',
      name: 'Supplier Information Header',
      x: 50,
      y: 780,
      width: 200,
      height: 30,
      properties: {
        text: 'Supplier Information',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-supplier-table',
      type: 'table',
      name: 'Supplier Information Table',
      x: 50,
      y: 820,
      width: 520,
      height: 120,
      properties: {
        columns: [
          { key: 'name', header: 'Supplier', width: '25%', align: 'left' },
          { key: 'itemCount', header: 'Items', width: '15%', align: 'right' },
          { key: 'totalValue', header: 'Total Value', width: '20%', align: 'right', format: 'currency' },
          { key: 'rating', header: 'Rating', width: '15%', align: 'right', format: 'decimal' },
          { key: 'lastDelivery', header: 'Last Delivery', width: '25%', align: 'center', format: 'date' }
        ],
        showHeader: true,
        borderStyle: 'grid',
        headerBg: '#f7fafc',
        alternateRows: true,
        fontSize: 11
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'suppliers'
      }
    },

    // Reorder Alerts Section
    {
      id: 'comp-alerts-header',
      type: 'heading',
      name: 'Reorder Alerts Header',
      x: 50,
      y: 970,
      width: 200,
      height: 30,
      properties: {
        text: 'Reorder Alerts',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#e53e3e'
      }
    },
    {
      id: 'comp-alerts-text',
      type: 'text-label',
      name: 'Reorder Alerts Text',
      x: 50,
      y: 1010,
      width: 520,
      height: 60,
      properties: {
        text: '⚠️ USB-C Cable (SKU-003): Stock level (18) below reorder point (100)\n⚠️ Webcam HD (SKU-005): Stock level (5) below reorder point (20)',
        fontSize: 12,
        color: '#e53e3e',
        lineHeight: 1.5,
        backgroundColor: '#fed7d7',
        padding: 10,
        borderRadius: 4
      }
    },

    // Report Footer
    {
      id: 'comp-footer-divider',
      type: 'line-divider',
      name: 'Footer Divider',
      x: 50,
      y: 1100,
      width: 520,
      height: 2,
      properties: {
        color: '#e2e8f0',
        thickness: 1
      }
    },
    {
      id: 'comp-footer-note',
      type: 'text-label',
      name: 'Footer Note',
      x: 50,
      y: 1110,
      width: 520,
      height: 20,
      properties: {
        text: 'Report generated automatically. Please review reorder alerts and take appropriate action.',
        fontSize: 10,
        color: '#a0aec0',
        align: 'center',
        style: 'italic'
      }
    }
  ],
  sampleData: inventoryData,
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    version: '1.0.0',
    tags: ['inventory', 'stock', 'warehouse', 'suppliers', 'reorder'],
    isBuiltIn: true,
    testCoverage: 0
  },
  validation: {
    requiredDataSources: ['inventory', 'categories', 'suppliers'],
    requiredFields: {
      inventory: ['sku', 'name', 'category', 'stock', 'reorderLevel', 'unitCost', 'totalValue', 'supplier'],
      categories: ['name', 'totalItems', 'totalValue', 'avgTurnover'],
      suppliers: ['name', 'itemCount', 'totalValue', 'rating', 'lastDelivery']
    },
    validationRules: [
      {
        field: 'inventory.stock',
        type: 'required',
        message: 'Stock level is required for all items'
      },
      {
        field: 'inventory.reorderLevel',
        type: 'required',
        message: 'Reorder level is required for all items'
      },
      {
        field: 'inventory.stock',
        type: 'range',
        message: 'Stock level cannot be negative',
        params: { min: 0 }
      }
    ]
  }
}