'use client';

import { PropertyConfig } from '@/types/property-config';
import { TableProperties } from './table-component';

export const TABLE_PROPERTY_CONFIG: PropertyConfig<TableProperties> = {
  groups: [
    {
      title: 'Table Settings',
      defaultExpanded: true,
      collapsible: false,
      properties: [
        {
          key: 'rows',
          type: 'number',
          label: 'Number of Rows',
          description: 'Maximum number of data rows to display in the table',
          helpText: 'Controls how many rows of data are shown. Useful for limiting large datasets.',
          usageExample: '5 rows for summaries, 10-20 rows for detailed listings',
          bestPractice: 'Use 5-10 rows for most reports to maintain readability',
          min: 1,
          max: 20,
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 1,
              message: 'Table must display at least 1 row'
            },
            {
              type: 'max',
              value: 20,
              message: 'Maximum 20 rows recommended for print compatibility'
            }
          ],
          defaultValue: 5
        },
        {
          key: 'showHeader',
          type: 'boolean',
          label: 'Show Header',
          description: 'Display column headers at the top of the table',
          helpText: 'When enabled, shows column names above the data rows',
          usageExample: 'Enable for data tables, disable for layout tables',
          bestPractice: 'Keep enabled for better data understanding and accessibility',
          defaultValue: true
        },
        {
          key: 'columns',
          type: 'array',
          label: 'Column Names',
          description: 'Names of the table columns, comma-separated',
          helpText: 'Define the column headers that will be displayed in the table',
          usageExample: 'Product, Price, Quantity or Name, Email, Phone',
          bestPractice: 'Use clear, concise column names that describe the data',
          constraints: 'Maximum 8 columns recommended for readability',
          validationRules: [
            {
              type: 'required',
              message: 'At least one column is required'
            },
            {
              type: 'max',
              value: 8,
              message: 'Maximum 8 columns recommended for optimal display'
            }
          ],
          defaultValue: ['Column 1', 'Column 2', 'Column 3']
        }
      ]
    },
    {
      title: 'Style',
      defaultExpanded: false,
      collapsible: true,
      properties: [
        {
          key: 'borderStyle',
          type: 'select',
          label: 'Border Style',
          options: [
            { value: 'none', label: 'None' },
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' }
          ],
          description: 'Style of table borders and cell dividers',
          helpText: 'Controls the appearance of lines between cells and around the table',
          usageExample: 'Solid for formal reports, None for clean layouts, Dashed for drafts',
          bestPractice: 'Use solid borders for data clarity, none for minimal design',
          defaultValue: 'solid'
        },
        {
          key: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          description: 'Background color of table cells',
          helpText: 'Sets the background color for all data cells in the table',
          usageExample: '#ffffff for white, #f9f9f9 for light gray, #f0f8ff for light blue',
          constraints: 'Ensure sufficient contrast with text color for accessibility',
          bestPractice: 'Use light colors to maintain text readability',
          validationRules: [
            {
              type: 'pattern',
              value: /^#[0-9A-Fa-f]{6}$/,
              message: 'Color must be a valid hex code (e.g., #FFFFFF)'
            }
          ],
          defaultValue: '#ffffff'
        },
        {
          key: 'headerBackgroundColor',
          type: 'color',
          label: 'Header Background',
          description: 'Background color of the table header row',
          helpText: 'Sets a distinct background color for column headers',
          usageExample: '#f8f9fa for light gray, #e9ecef for medium gray, #007bff for brand color',
          constraints: 'Should contrast with regular cell background for visual separation',
          bestPractice: 'Use a slightly darker shade than cell background for hierarchy',
          validationRules: [
            {
              type: 'pattern',
              value: /^#[0-9A-Fa-f]{6}$/,
              message: 'Color must be a valid hex code (e.g., #F8F9FA)'
            }
          ],
          defaultValue: '#f8f9fa'
        }
      ]
    }
  ],
  validation: {
    minProperties: 6,
    maxProperties: 6,
    requiredProperties: ['rows', 'showHeader', 'columns'],
    customValidators: [
      {
        name: 'column-row-balance',
        validator: (properties) => {
          const columns = properties.columns || [];
          const rows = properties.rows || 5;
          
          // Warn if too many columns for the number of rows
          if (columns.length > 6 && rows < 5) {
            return 'Many columns with few rows may create a cramped layout';
          }
          
          return true;
        },
        message: 'Column and row configuration may affect readability'
      },
      {
        name: 'color-contrast-check',
        validator: (properties) => {
          const bgColor = properties.backgroundColor || '#ffffff';
          const headerBgColor = properties.headerBackgroundColor || '#f8f9fa';
          
          // Basic contrast check - avoid same colors
          if (bgColor.toLowerCase() === headerBgColor.toLowerCase()) {
            return 'Header background should differ from cell background for visual separation';
          }
          
          return true;
        },
        message: 'Header and cell colors should provide visual distinction'
      }
    ]
  },
  defaults: {
    rows: 5,
    showHeader: true,
    columns: ['Column 1', 'Column 2', 'Column 3'],
    borderStyle: 'solid',
    backgroundColor: '#ffffff',
    headerBackgroundColor: '#f8f9fa'
  },
  metadata: {
    version: '2.0.0',
    description: 'Lean table component with 6 optimized properties (3 Core + 3 Style)',
    category: 'Data',
    priority: 2,
    migration: {
      from: '1.0.0',
      reducedFrom: 13,
      optimizedProperties: [
        'Removed: width, height (handled by canvas)',
        'Removed: borderWidth, borderColor (simplified to borderStyle)',
        'Removed: textColor, fontSize (inherited from theme)',
        'Removed: cellPadding, headerTextStyle (simplified)',
        'Combined: styling properties into 3 essential style controls'
      ]
    }
  }
};