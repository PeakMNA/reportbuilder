import { ReportTemplate } from '@/types/template'
import { dashboardData } from './sample-data'

export const dashboardTemplate: ReportTemplate = {
  id: 'template-dashboard-001',
  name: 'Executive Dashboard',
  description: 'Comprehensive executive dashboard with KPIs, performance gauges, traffic analysis, and real-time metrics',
  category: 'dashboard',
  components: [
    // Dashboard Header
    {
      id: 'comp-dashboard-title',
      type: 'heading',
      name: 'Dashboard Title',
      x: 50,
      y: 30,
      width: 400,
      height: 50,
      properties: {
        text: 'Executive Dashboard',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a365d',
        align: 'left'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.dashboardTitle'
      }
    },
    {
      id: 'comp-company-name',
      type: 'text-label',
      name: 'Company Name',
      x: 50,
      y: 85,
      width: 200,
      height: 25,
      properties: {
        text: 'Acme Corporation',
        fontSize: 16,
        color: '#4a5568',
        align: 'left'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.companyName'
      }
    },
    {
      id: 'comp-last-updated',
      type: 'text-label',
      name: 'Last Updated',
      x: 450,
      y: 85,
      width: 150,
      height: 25,
      properties: {
        text: 'Updated: 2024-01-15 14:30',
        fontSize: 12,
        color: '#718096',
        align: 'right'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.lastUpdated',
        format: 'Updated: {value}'
      }
    },

    // KPI Section
    {
      id: 'comp-kpi-header',
      type: 'heading',
      name: 'KPI Header',
      x: 50,
      y: 140,
      width: 200,
      height: 30,
      properties: {
        text: 'Key Performance Indicators',
        fontSize: 20,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },

    // Revenue KPI
    {
      id: 'comp-revenue-kpi-bg',
      type: 'rectangle',
      name: 'Revenue KPI Background',
      x: 50,
      y: 180,
      width: 120,
      height: 100,
      properties: {
        backgroundColor: '#f0fff4',
        borderColor: '#9ae6b4',
        borderWidth: 2,
        borderRadius: 12,
        shadow: true
      }
    },
    {
      id: 'comp-revenue-icon',
      type: 'text-label',
      name: 'Revenue Icon',
      x: 60,
      y: 190,
      width: 100,
      height: 20,
      properties: {
        text: '💰',
        fontSize: 16,
        align: 'center'
      }
    },
    {
      id: 'comp-revenue-label',
      type: 'text-label',
      name: 'Revenue Label',
      x: 60,
      y: 210,
      width: 100,
      height: 20,
      properties: {
        text: 'Revenue (YTD)',
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
      width: 100,
      height: 25,
      properties: {
        text: '$2.45M',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#38a169',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'kpis.0.value',
        format: 'currency_short'
      }
    },
    {
      id: 'comp-revenue-trend',
      type: 'text-label',
      name: 'Revenue Trend',
      x: 60,
      y: 255,
      width: 100,
      height: 20,
      properties: {
        text: '↗ +8.5%',
        fontSize: 12,
        color: '#38a169',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'calculated',
        calculation: '"↗ +" + kpis[0].change + "%"'
      }
    },

    // Customers KPI
    {
      id: 'comp-customers-kpi-bg',
      type: 'rectangle',
      name: 'Customers KPI Background',
      x: 190,
      y: 180,
      width: 120,
      height: 100,
      properties: {
        backgroundColor: '#ebf8ff',
        borderColor: '#63b3ed',
        borderWidth: 2,
        borderRadius: 12,
        shadow: true
      }
    },
    {
      id: 'comp-customers-icon',
      type: 'text-label',
      name: 'Customers Icon',
      x: 200,
      y: 190,
      width: 100,
      height: 20,
      properties: {
        text: '👥',
        fontSize: 16,
        align: 'center'
      }
    },
    {
      id: 'comp-customers-label',
      type: 'text-label',
      name: 'Customers Label',
      x: 200,
      y: 210,
      width: 100,
      height: 20,
      properties: {
        text: 'New Customers',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },
    {
      id: 'comp-customers-value',
      type: 'text-label',
      name: 'Customers Value',
      x: 200,
      y: 235,
      width: 100,
      height: 25,
      properties: {
        text: '1,250',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3182ce',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'kpis.1.value',
        format: 'number'
      }
    },
    {
      id: 'comp-customers-trend',
      type: 'text-label',
      name: 'Customers Trend',
      x: 200,
      y: 255,
      width: 100,
      height: 20,
      properties: {
        text: '↗ +12.3%',
        fontSize: 12,
        color: '#3182ce',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'calculated',
        calculation: '"↗ +" + kpis[1].change + "%"'
      }
    },

    // Satisfaction KPI with Gauge
    {
      id: 'comp-satisfaction-kpi-bg',
      type: 'rectangle',
      name: 'Satisfaction KPI Background',
      x: 330,
      y: 180,
      width: 120,
      height: 100,
      properties: {
        backgroundColor: '#fffaf0',
        borderColor: '#fbd38d',
        borderWidth: 2,
        borderRadius: 12,
        shadow: true
      }
    },
    {
      id: 'comp-satisfaction-gauge',
      type: 'gauge',
      name: 'Satisfaction Gauge',
      x: 360,
      y: 190,
      width: 60,
      height: 60,
      properties: {
        value: 4.7,
        min: 0,
        max: 5,
        showValue: true,
        color: '#ed8936',
        backgroundColor: '#fff5ec',
        thickness: 8
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'kpis.2.value'
      }
    },
    {
      id: 'comp-satisfaction-label',
      type: 'text-label',
      name: 'Satisfaction Label',
      x: 340,
      y: 255,
      width: 100,
      height: 20,
      properties: {
        text: 'Satisfaction',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },

    // Churn Rate KPI
    {
      id: 'comp-churn-kpi-bg',
      type: 'rectangle',
      name: 'Churn KPI Background',
      x: 470,
      y: 180,
      width: 120,
      height: 100,
      properties: {
        backgroundColor: '#fed7d7',
        borderColor: '#fc8181',
        borderWidth: 2,
        borderRadius: 12,
        shadow: true
      }
    },
    {
      id: 'comp-churn-icon',
      type: 'text-label',
      name: 'Churn Icon',
      x: 480,
      y: 190,
      width: 100,
      height: 20,
      properties: {
        text: '📉',
        fontSize: 16,
        align: 'center'
      }
    },
    {
      id: 'comp-churn-label',
      type: 'text-label',
      name: 'Churn Label',
      x: 480,
      y: 210,
      width: 100,
      height: 20,
      properties: {
        text: 'Churn Rate',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      }
    },
    {
      id: 'comp-churn-value',
      type: 'text-label',
      name: 'Churn Value',
      x: 480,
      y: 235,
      width: 100,
      height: 25,
      properties: {
        text: '2.3%',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e53e3e',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'kpis.3.value',
        format: 'percentage'
      }
    },
    {
      id: 'comp-churn-trend',
      type: 'text-label',
      name: 'Churn Trend',
      x: 480,
      y: 255,
      width: 100,
      height: 20,
      properties: {
        text: '↘ -15.2%',
        fontSize: 12,
        color: '#38a169',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'calculated',
        calculation: '"↘ " + kpis[3].change + "%"'
      }
    },

    // Traffic Sources Chart
    {
      id: 'comp-traffic-header',
      type: 'heading',
      name: 'Traffic Sources Header',
      x: 50,
      y: 320,
      width: 250,
      height: 30,
      properties: {
        text: 'Traffic Sources',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-traffic-chart',
      type: 'chart',
      name: 'Traffic Sources Chart',
      x: 50,
      y: 360,
      width: 280,
      height: 200,
      properties: {
        chartType: 'pie',
        title: 'Website Traffic by Source',
        showLegend: true,
        colors: ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565'],
        backgroundColor: '#ffffff',
        borderRadius: 8
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'traffic'
      }
    },

    // Conversion Rates Table
    {
      id: 'comp-conversion-header',
      type: 'heading',
      name: 'Conversion Rates Header',
      x: 350,
      y: 320,
      width: 200,
      height: 30,
      properties: {
        text: 'Conversion Rates',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-conversion-table',
      type: 'table',
      name: 'Conversion Rates Table',
      x: 350,
      y: 360,
      width: 240,
      height: 200,
      properties: {
        columns: [
          { key: 'source', header: 'Source', width: '45%', align: 'left' },
          { key: 'visitors', header: 'Visitors', width: '25%', align: 'right', format: 'number' },
          { key: 'rate', header: 'Rate', width: '30%', align: 'right', format: 'percentage' }
        ],
        showHeader: true,
        borderStyle: 'grid',
        headerBg: '#f7fafc',
        alternateRows: true,
        fontSize: 11,
        conditionalFormatting: [
          {
            condition: 'rate >= 4',
            style: { backgroundColor: '#f0fff4', color: '#38a169' }
          },
          {
            condition: 'rate < 3',
            style: { backgroundColor: '#fed7d7', color: '#e53e3e' }
          }
        ]
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'traffic'
      }
    },

    // Performance Trends Chart
    {
      id: 'comp-performance-header',
      type: 'heading',
      name: 'Performance Trends Header',
      x: 50,
      y: 590,
      width: 250,
      height: 30,
      properties: {
        text: 'Performance Trends (5 Days)',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#2d3748'
      }
    },
    {
      id: 'comp-performance-chart',
      type: 'chart',
      name: 'Performance Trends Chart',
      x: 50,
      y: 630,
      width: 540,
      height: 180,
      properties: {
        chartType: 'line',
        title: 'Daily Sales and Leads',
        xAxisLabel: 'Date',
        yAxisLabel: 'Amount',
        showGrid: true,
        showLegend: true,
        colors: ['#4299e1', '#48bb78', '#ed8936'],
        backgroundColor: '#ffffff',
        borderRadius: 8
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'performance'
      }
    },

    // Quick Stats Bar
    {
      id: 'comp-stats-bg',
      type: 'rectangle',
      name: 'Quick Stats Background',
      x: 50,
      y: 840,
      width: 540,
      height: 50,
      properties: {
        backgroundColor: '#2d3748',
        borderRadius: 8
      }
    },
    {
      id: 'comp-stats-title',
      type: 'text-label',
      name: 'Quick Stats Title',
      x: 70,
      y: 850,
      width: 100,
      height: 30,
      properties: {
        text: 'Quick Stats:',
        fontSize: 14,
        fontWeight: 'semibold',
        color: '#ffffff',
        align: 'left'
      }
    },
    {
      id: 'comp-total-visitors',
      type: 'text-label',
      name: 'Total Visitors',
      x: 180,
      y: 850,
      width: 100,
      height: 30,
      properties: {
        text: '119,500 Visitors',
        fontSize: 12,
        color: '#cbd5e0',
        align: 'center'
      }
    },
    {
      id: 'comp-total-conversions',
      type: 'text-label',
      name: 'Total Conversions',
      x: 290,
      y: 850,
      width: 100,
      height: 30,
      properties: {
        text: '4,240 Conversions',
        fontSize: 12,
        color: '#cbd5e0',
        align: 'center'
      }
    },
    {
      id: 'comp-avg-conversion',
      type: 'text-label',
      name: 'Average Conversion',
      x: 400,
      y: 850,
      width: 100,
      height: 30,
      properties: {
        text: '3.5% Avg Rate',
        fontSize: 12,
        color: '#cbd5e0',
        align: 'center'
      }
    },

    // Dashboard Footer
    {
      id: 'comp-refresh-note',
      type: 'text-label',
      name: 'Refresh Note',
      x: 50,
      y: 920,
      width: 540,
      height: 20,
      properties: {
        text: 'Dashboard auto-refreshes every 15 minutes. Data is updated in real-time from multiple sources.',
        fontSize: 10,
        color: '#a0aec0',
        align: 'center',
        style: 'italic'
      }
    },
    {
      id: 'comp-reporting-period',
      type: 'text-label',
      name: 'Reporting Period',
      x: 50,
      y: 940,
      width: 540,
      height: 20,
      properties: {
        text: 'Reporting Period: January 2024',
        fontSize: 12,
        fontWeight: 'semibold',
        color: '#4a5568',
        align: 'center'
      },
      dataBinding: {
        sourceType: 'dynamic',
        source: 'variables.reportingPeriod',
        format: 'Reporting Period: {value}'
      }
    }
  ],
  sampleData: dashboardData,
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System',
    version: '1.0.0',
    tags: ['dashboard', 'kpi', 'metrics', 'analytics', 'executive', 'realtime'],
    isBuiltIn: true,
    testCoverage: 0
  },
  validation: {
    requiredDataSources: ['kpis', 'traffic', 'performance'],
    requiredFields: {
      kpis: ['metric', 'value', 'target', 'trend', 'change', 'period'],
      traffic: ['source', 'visitors', 'conversions', 'rate'],
      performance: ['date', 'sales', 'leads', 'conversions']
    },
    validationRules: [
      {
        field: 'kpis.value',
        type: 'required',
        message: 'KPI values are required'
      },
      {
        field: 'traffic.visitors',
        type: 'range',
        message: 'Visitor count must be positive',
        params: { min: 0 }
      },
      {
        field: 'performance.sales',
        type: 'range',
        message: 'Sales values must be positive',
        params: { min: 0 }
      }
    ]
  }
}