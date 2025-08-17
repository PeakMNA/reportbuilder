import { TemplateData } from '@/types/template'

// Invoice Template Sample Data
export const invoiceData: TemplateData = {
  name: 'Invoice Sample Data',
  tables: {
    company: [{
      name: 'Acme Corp Solutions',
      address: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '+1 (555) 123-4567',
      email: 'billing@acmecorp.com',
      website: 'www.acmecorp.com',
      logo: '/logo-placeholder.png'
    }],
    customer: [{
      id: 'CUST-001',
      name: 'Global Tech Industries',
      contactPerson: 'John Smith',
      email: 'john.smith@globaltech.com',
      phone: '+1 (555) 987-6543',
      address: '456 Tech Boulevard',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    }],
    invoice: [{
      number: 'INV-2024-001',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      subtotal: 2650.00,
      taxRate: 0.0875,
      taxAmount: 231.88,
      total: 2881.88,
      status: 'pending',
      terms: 'Net 30 days'
    }],
    items: [
      {
        id: 1,
        description: 'Web Development Services',
        category: 'Development',
        quantity: 40,
        unitPrice: 125.00,
        total: 5000.00
      },
      {
        id: 2,
        description: 'UI/UX Design Consultation',
        category: 'Design',
        quantity: 20,
        unitPrice: 150.00,
        total: 3000.00
      },
      {
        id: 3,
        description: 'Project Management',
        category: 'Management',
        quantity: 30,
        unitPrice: 100.00,
        total: 3000.00
      },
      {
        id: 4,
        description: 'Quality Assurance Testing',
        category: 'Testing',
        quantity: 15,
        unitPrice: 90.00,
        total: 1350.00
      }
    ]
  },
  variables: {
    currentDate: new Date().toISOString().split('T')[0],
    companyLogo: '/logo-placeholder.png',
    paymentInstructions: 'Payment due within 30 days. Late payments subject to 1.5% monthly service charge.'
  },
  metadata: {
    createdAt: new Date().toISOString(),
    description: 'Sample data for invoice template with company, customer, and line items',
    sampleDataIncluded: true
  }
}

// Sales Report Sample Data
export const salesData: TemplateData = {
  name: 'Sales Report Sample Data',
  tables: {
    sales: [
      { month: 'Jan', revenue: 125000, units: 450, region: 'North' },
      { month: 'Feb', revenue: 132000, units: 480, region: 'North' },
      { month: 'Mar', revenue: 145000, units: 520, region: 'North' },
      { month: 'Apr', revenue: 138000, units: 495, region: 'North' },
      { month: 'May', revenue: 155000, units: 580, region: 'North' },
      { month: 'Jun', revenue: 162000, units: 610, region: 'North' },
      { month: 'Jan', revenue: 98000, units: 350, region: 'South' },
      { month: 'Feb', revenue: 105000, units: 375, region: 'South' },
      { month: 'Mar', revenue: 115000, units: 410, region: 'South' },
      { month: 'Apr', revenue: 108000, units: 385, region: 'South' },
      { month: 'May', revenue: 122000, units: 440, region: 'South' },
      { month: 'Jun', revenue: 128000, units: 465, region: 'South' }
    ],
    products: [
      { name: 'Product A', category: 'Electronics', q1: 89000, q2: 95000, growth: 6.7 },
      { name: 'Product B', category: 'Software', q1: 125000, q2: 140000, growth: 12.0 },
      { name: 'Product C', category: 'Services', q1: 75000, q2: 82000, growth: 9.3 },
      { name: 'Product D', category: 'Hardware', q1: 45000, q2: 48000, growth: 6.7 }
    ],
    regions: [
      { name: 'North', manager: 'Sarah Johnson', ytdSales: 957000, target: 1000000, performance: 95.7 },
      { name: 'South', manager: 'Mike Chen', ytdSales: 676000, target: 700000, performance: 96.6 },
      { name: 'East', manager: 'Lisa Garcia', ytdSales: 823000, target: 800000, performance: 102.9 },
      { name: 'West', manager: 'David Kim', ytdSales: 745000, target: 750000, performance: 99.3 }
    ]
  },
  variables: {
    reportPeriod: 'Q2 2024',
    totalRevenue: 3201000,
    growthRate: 8.5,
    topPerformer: 'East Region'
  },
  metadata: {
    createdAt: new Date().toISOString(),
    description: 'Sample sales data with monthly trends, product performance, and regional analysis',
    sampleDataIncluded: true
  }
}

// Inventory Report Sample Data
export const inventoryData: TemplateData = {
  name: 'Inventory Report Sample Data',
  tables: {
    inventory: [
      { sku: 'SKU-001', name: 'Wireless Headphones', category: 'Electronics', stock: 245, reorderLevel: 50, unitCost: 45.00, totalValue: 11025.00, supplier: 'TechCorp', lastOrdered: '2024-01-10' },
      { sku: 'SKU-002', name: 'Bluetooth Speaker', category: 'Electronics', stock: 120, reorderLevel: 30, unitCost: 65.00, totalValue: 7800.00, supplier: 'AudioMax', lastOrdered: '2024-01-08' },
      { sku: 'SKU-003', name: 'USB-C Cable', category: 'Accessories', stock: 18, reorderLevel: 100, unitCost: 8.50, totalValue: 153.00, supplier: 'CablePlus', lastOrdered: '2023-12-15' },
      { sku: 'SKU-004', name: 'Laptop Stand', category: 'Accessories', stock: 85, reorderLevel: 25, unitCost: 32.00, totalValue: 2720.00, supplier: 'ErgoCorp', lastOrdered: '2024-01-12' },
      { sku: 'SKU-005', name: 'Webcam HD', category: 'Electronics', stock: 5, reorderLevel: 20, unitCost: 78.00, totalValue: 390.00, supplier: 'VisionTech', lastOrdered: '2023-11-20' }
    ],
    categories: [
      { name: 'Electronics', totalItems: 8, totalValue: 125000, avgTurnover: 4.2 },
      { name: 'Accessories', totalItems: 15, totalValue: 45000, avgTurnover: 6.8 },
      { name: 'Software', totalItems: 5, totalValue: 28000, avgTurnover: 3.1 }
    ],
    suppliers: [
      { name: 'TechCorp', itemCount: 12, totalValue: 89000, rating: 4.8, lastDelivery: '2024-01-10' },
      { name: 'AudioMax', itemCount: 8, totalValue: 56000, rating: 4.5, lastDelivery: '2024-01-08' },
      { name: 'CablePlus', itemCount: 15, totalValue: 23000, rating: 4.2, lastDelivery: '2023-12-15' }
    ]
  },
  variables: {
    reportDate: new Date().toISOString().split('T')[0],
    totalInventoryValue: 198000,
    lowStockItems: 3,
    criticalStockItems: 2,
    warehouseLocation: 'Main Warehouse - Building A'
  },
  metadata: {
    createdAt: new Date().toISOString(),
    description: 'Sample inventory data with stock levels, suppliers, and category analysis',
    sampleDataIncluded: true
  }
}

// Dashboard Template Sample Data
export const dashboardData: TemplateData = {
  name: 'Dashboard Sample Data',
  tables: {
    kpis: [
      { metric: 'Revenue', value: 2450000, target: 2500000, trend: 'up', change: 8.5, period: 'YTD' },
      { metric: 'New Customers', value: 1250, target: 1200, trend: 'up', change: 12.3, period: 'Monthly' },
      { metric: 'Customer Satisfaction', value: 4.7, target: 4.5, trend: 'up', change: 2.1, period: 'Current' },
      { metric: 'Churn Rate', value: 2.3, target: 3.0, trend: 'down', change: -15.2, period: 'Monthly' }
    ],
    traffic: [
      { source: 'Organic Search', visitors: 45000, conversions: 1350, rate: 3.0 },
      { source: 'Paid Ads', visitors: 28000, conversions: 1120, rate: 4.0 },
      { source: 'Social Media', visitors: 18500, conversions: 370, rate: 2.0 },
      { source: 'Direct', visitors: 15200, conversions: 760, rate: 5.0 },
      { source: 'Email', visitors: 12800, conversions: 640, rate: 5.0 }
    ],
    performance: [
      { date: '2024-01-01', sales: 125000, leads: 450, conversions: 67 },
      { date: '2024-01-02', sales: 132000, leads: 480, conversions: 72 },
      { date: '2024-01-03', sales: 118000, leads: 420, conversions: 63 },
      { date: '2024-01-04', sales: 145000, leads: 520, conversions: 78 },
      { date: '2024-01-05', sales: 138000, leads: 495, conversions: 74 }
    ]
  },
  variables: {
    dashboardTitle: 'Executive Dashboard',
    lastUpdated: new Date().toISOString(),
    companyName: 'Acme Corporation',
    reportingPeriod: 'January 2024'
  },
  metadata: {
    createdAt: new Date().toISOString(),
    description: 'Sample dashboard data with KPIs, traffic sources, and performance metrics',
    sampleDataIncluded: true
  }
}

// Export all sample data
export const sampleTemplateData = {
  invoice: invoiceData,
  sales: salesData,
  inventory: inventoryData,
  dashboard: dashboardData
}