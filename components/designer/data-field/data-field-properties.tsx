'use client';

// Re-export the dynamic property configuration
export { useDataFieldPropertyConfig } from './data-field-property-config';

// Legacy static config for backward compatibility
import { PropertyConfig } from '@/types/property-config';
import { DataFieldProperties } from './data-field-component';

export const DATA_FIELD_PROPERTY_CONFIG: PropertyConfig<DataFieldProperties> = {
  groups: [
    {
      title: 'Data Properties',
      defaultExpanded: true,
      category: 'data',
      properties: [
        {
          key: 'dataSource',
          type: 'select',
          label: 'Data Source',
          options: [], // Will be populated dynamically
          description: 'Which data field to display',
          helpText: 'Select a data source to bind this field to',
          required: true,
          defaultValue: null
        },
        {
          key: 'conditionalFormatting',
          type: 'textarea',
          label: 'Conditional Formatting',
          placeholder: 'value > 1000 ? "#ff0000" : "#000000"',
          description: 'Simple rule builder for color/style rules',
          helpText: 'Use simple expressions to set color rules based on values'
        }
      ]
    },
    {
      title: 'Format Properties',
      defaultExpanded: false,
      category: 'core',
      properties: [
        {
          key: 'formatType',
          type: 'select',
          label: 'Format Type',
          options: [
            { value: 'text', label: 'Text' },
            { value: 'date', label: 'Date' },
            { value: 'number', label: 'Number' },
            { value: 'currency', label: 'Currency' }
          ],
          description: 'How to format the data',
          defaultValue: 'text'
        }
      ]
    },
    {
      title: 'Style Properties',
      defaultExpanded: false,
      category: 'style',
      properties: [
        {
          key: 'fontSize',
          type: 'number',
          label: 'Font Size',
          suffix: 'px',
          min: 8,
          max: 72,
          description: 'Text size in pixels',
          defaultValue: 14
        },
        {
          key: 'color',
          type: 'color',
          label: 'Color',
          description: 'Default text color',
          defaultValue: '#000000'
        },
        {
          key: 'autoFit',
          type: 'boolean',
          label: 'Auto Fit',
          description: 'Auto-resize to fit content',
          defaultValue: true
        }
      ]
    }
  ],
  validation: {
    minProperties: 6,
    maxProperties: 6,
    requiredProperties: ['dataSource']
  },
  defaults: {
    dataSource: null,
    conditionalFormatting: '',
    formatType: 'text',
    fontSize: 14,
    color: '#000000',
    autoFit: true
  },
  metadata: {
    version: '2.0.0',
    description: 'Data field component for displaying dynamic content with formatting',
    category: 'Data',
    priority: 10
  }
};