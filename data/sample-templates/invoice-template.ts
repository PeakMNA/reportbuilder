import { ReportTemplate } from '@/types/template'
import { invoiceData } from './sample-data'

export const invoiceTemplate: ReportTemplate = {
  id: 'template-invoice-001',
  name: 'Professional Invoice Template',
  description: 'Complete business invoice template with company branding, customer details, itemized billing, and payment terms',
  category: 'business',
  components: [
    // Company Header Section
    {
      id: 'comp-company-logo',
      type: 'image',
      name: 'Company Logo',
      x: 50,
      y: 50,
      width: 120,
      height: 80,
      properties: {
        src: '/logo-placeholder.png',
        alt: 'Company Logo',
        fit: 'contain',
        borderRadius: 8
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'company.logo'
      }
    },
    {
      id: 'comp-company-name',
      type: 'heading',
      name: 'Company Name',
      x: 200,
      y: 50,
      width: 300,
      height: 40,
      properties: {
        text: 'Acme Corp Solutions',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a365d',
        align: 'left'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'company.name'
      }
    },
    {
      id: 'comp-company-address',
      type: 'text-label',
      name: 'Company Address',
      x: 200,
      y: 100,
      width: 300,
      height: 80,
      properties: {
        text: '123 Business Ave\nNew York, NY 10001\n+1 (555) 123-4567',
        fontSize: 12,
        color: '#4a5568',
        align: 'left',
        lineHeight: 1.4
      },
      dataBinding: {
        sourceType: 'calculated',
        calculation: 'company.address + "\\n" + company.city + ", " + company.state + " " + company.zip + "\\n" + company.phone'
      }
    },

    // Invoice Header
    {
      id: 'comp-invoice-title',
      type: 'heading',
      name: 'Invoice Title',
      x: 420,
      y: 50,
      width: 150,
      height: 40,
      properties: {
        text: 'INVOICE',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3748',
        align: 'right'
      }
    },
    {
      id: 'comp-invoice-number',
      type: 'text-label',
      name: 'Invoice Number',
      x: 420,
      y: 100,
      width: 150,
      height: 25,
      properties: {
        text: 'INV-2024-001',
        fontSize: 14,
        fontWeight: 'semibold',
        color: '#2d3748',
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'invoice.number'
      }
    },
    {
      id: 'comp-invoice-date',
      type: 'text-label',
      name: 'Invoice Date',
      x: 420,
      y: 130,
      width: 150,
      height: 25,
      properties: {
        text: 'Date: 2024-01-15',
        fontSize: 12,
        color: '#4a5568',
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'invoice.date',
        format: 'Date: {value}'
      }
    },
    {
      id: 'comp-due-date',
      type: 'text-label',
      name: 'Due Date',
      x: 420,
      y: 155,
      width: 150,
      height: 25,
      properties: {
        text: 'Due: 2024-02-15',
        fontSize: 12,
        color: '#e53e3e',
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'invoice.dueDate',
        format: 'Due: {value}'
      }
    },

    // Customer Information
    {
      id: 'comp-bill-to-label',
      type: 'heading',
      name: 'Bill To Label',
      x: 50,
      y: 220,
      width: 100,
      height: 30,
      properties: {
        text: 'Bill To:',
        fontSize: 16,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-customer-info',
      type: 'text-label',
      name: 'Customer Information',
      x: 50,
      y: 250,
      width: 250,
      height: 100,
      properties: {
        text: 'Global Tech Industries\nJohn Smith\n456 Tech Boulevard\nSan Francisco, CA 94105',
        fontSize: 12,
        color: '#4a5568',
        lineHeight: 1.4
      },
      dataBinding: {
        sourceType: 'calculated',
        calculation: 'customer.name + "\\n" + customer.contactPerson + "\\n" + customer.address + "\\n" + customer.city + ", " + customer.state + " " + customer.zip'
      }
    },

    // Items Table
    {
      id: 'comp-items-table',
      type: 'table',
      name: 'Invoice Items',
      x: 50,
      y: 380,
      width: 520,
      height: 200,
      properties: {
        columns: [
          { key: 'description', header: 'Description', width: '40%', align: 'left' },
          { key: 'quantity', header: 'Qty', width: '15%', align: 'center' },
          { key: 'unitPrice', header: 'Unit Price', width: '20%', align: 'right', format: 'currency' },
          { key: 'total', header: 'Total', width: '25%', align: 'right', format: 'currency' }
        ],
        showHeader: true,
        borderStyle: 'grid',
        headerBg: '#f7fafc',
        alternateRows: true,
        fontSize: 11
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'items'
      }
    },

    // Totals Section
    {
      id: 'comp-subtotal-label',
      type: 'text-label',
      name: 'Subtotal Label',
      x: 400,
      y: 600,
      width: 80,
      height: 25,
      properties: {
        text: 'Subtotal:',
        fontSize: 12,
        fontWeight: 'semibold',
        align: 'right'
      }
    },
    {
      id: 'comp-subtotal-value',
      type: 'text-label',
      name: 'Subtotal Value',
      x: 490,
      y: 600,
      width: 80,
      height: 25,
      properties: {
        text: '$2,650.00',
        fontSize: 12,
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'invoice.subtotal',
        format: 'currency'
      }
    },
    {
      id: 'comp-tax-label',
      type: 'text-label',
      name: 'Tax Label',
      x: 400,
      y: 625,
      width: 80,
      height: 25,
      properties: {
        text: 'Tax (8.75%):',
        fontSize: 12,
        fontWeight: 'semibold',
        align: 'right'
      }
    },
    {
      id: 'comp-tax-value',
      type: 'text-label',
      name: 'Tax Value',
      x: 490,
      y: 625,
      width: 80,
      height: 25,
      properties: {
        text: '$231.88',
        fontSize: 12,
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'invoice.taxAmount',
        format: 'currency'
      }
    },
    {
      id: 'comp-total-label',
      type: 'text-label',
      name: 'Total Label',
      x: 400,
      y: 660,
      width: 80,
      height: 30,
      properties: {
        text: 'TOTAL:',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3748',
        align: 'right'
      }
    },
    {
      id: 'comp-total-value',
      type: 'text-label',
      name: 'Total Value',
      x: 490,
      y: 660,
      width: 80,
      height: 30,
      properties: {
        text: '$2,881.88',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3748',
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'invoice.total',
        format: 'currency'
      }
    },

    // Payment Terms
    {
      id: 'comp-payment-terms',
      type: 'text-label',
      name: 'Payment Terms',
      x: 50,
      y: 720,
      width: 520,
      height: 60,
      properties: {
        text: 'Payment Terms: Net 30 days\nPayment due within 30 days. Late payments subject to 1.5% monthly service charge.',
        fontSize: 11,
        color: '#4a5568',
        lineHeight: 1.4
      },
      dataBinding: {
        sourceType: 'calculated',
        calculation: '"Payment Terms: " + invoice.terms + "\\n" + variables.paymentInstructions'
      }
    }
  ],
  sampleData: invoiceData,
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    version: '1.0.0',
    tags: ['business', 'invoice', 'billing', 'professional'],
    isBuiltIn: true,
    testCoverage: 0
  },
  validation: {
    requiredDataSources: ['company', 'customer', 'invoice', 'items'],
    requiredFields: {
      company: ['name', 'address', 'city', 'state', 'zip', 'phone', 'logo'],
      customer: ['name', 'contactPerson', 'address', 'city', 'state', 'zip'],
      invoice: ['number', 'date', 'dueDate', 'subtotal', 'taxAmount', 'total', 'terms'],
      items: ['description', 'quantity', 'unitPrice', 'total']
    },
    validationRules: [
      {
        field: 'invoice.total',
        type: 'required',
        message: 'Invoice total is required'
      },
      {
        field: 'items',
        type: 'required',
        message: 'At least one item is required'
      }
    ]
  }
}