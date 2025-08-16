'use client';

import { PropertyConfig } from '@/types/property-config';
import { DataFieldProperties } from './data-field-component';
import { useDataBinding } from '../data-binding/data-binding-context';
import { useMemo } from 'react';

export function useDataFieldPropertyConfig(): PropertyConfig<DataFieldProperties> {
  const { dataSources } = useDataBinding();
  
  const config = useMemo((): PropertyConfig<DataFieldProperties> => {
    // Build data source options from available data sources
    const dataSourceOptions = dataSources.flatMap(ds => 
      (ds.columns || []).map(column => ({
        value: `${ds.id}.${column}`,
        label: `${ds.name} → ${column}`
      }))
    );

    return {
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
              options: dataSourceOptions.length > 0 ? dataSourceOptions : [
                { value: '', label: 'No data sources available' }
              ],
              description: 'Which data field to display',
              helpText: 'Select a data source to bind this field to',
              usageExample: 'Choose "Sales Data → Customer Name" to display customer names',
              bestPractice: 'Always bind to a data source for dynamic content',
              required: true,
              defaultValue: null
            },
            {
              key: 'conditionalFormatting',
              type: 'textarea',
              label: 'Conditional Formatting',
              placeholder: 'value > 1000 ? "#ff0000" : "#000000"',
              description: 'Simple rule builder for color/style rules',
              helpText: 'Use simple expressions to set color rules based on values',
              usageExample: 'value < 0 ? "#ff0000" : "#000000" (red for negative values)',
              bestPractice: 'Keep rules simple for better performance',
              constraints: 'Must be valid JavaScript expression returning color string'
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
              helpText: 'Choose the appropriate format for your data type',
              usageExample: 'Use "currency" for monetary values, "date" for timestamps',
              bestPractice: 'Match format type to your data source type',
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
              helpText: 'Adjust the size of the displayed text',
              usageExample: '14px for body text, 18px for headers',
              bestPractice: 'Use consistent font sizes across your report',
              defaultValue: 14
            },
            {
              key: 'color',
              type: 'color',
              label: 'Color',
              description: 'Default text color',
              helpText: 'Choose the color for the text display',
              usageExample: '#000000 for black text, #374151 for dark gray',
              bestPractice: 'Ensure sufficient contrast for readability',
              defaultValue: '#000000'
            },
            {
              key: 'autoFit',
              type: 'boolean',
              label: 'Auto Fit',
              description: 'Auto-resize to fit content',
              helpText: 'Automatically adjust field size based on content',
              usageExample: 'Enable for variable-length data like names',
              bestPractice: 'Enable for dynamic content, disable for fixed layouts',
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
  }, [dataSources]);
  
  return config;
}