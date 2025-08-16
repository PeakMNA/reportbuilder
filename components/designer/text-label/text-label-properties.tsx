'use client';

import { PropertyConfig, PropertyGroup } from '@/types/property-config';
import { TextLabelProperties } from './text-label-component';

export const TEXT_LABEL_PROPERTY_CONFIG: PropertyConfig<TextLabelProperties> = {
  groups: [
    {
      title: 'Content',
      defaultExpanded: true,
      collapsible: false,
      properties: [
        {
          key: 'content',
          type: 'text',
          label: 'Text Content',
          description: 'The static text to display in the report',
          helpText: 'Enter static text that will appear exactly as typed on the report',
          usageExample: 'Examples: "Report Title", "Customer Name:", "Total Amount Due"',
          placeholder: 'Enter your text here...',
          bestPractice: 'Use clear, concise labels that describe the data or section',
          required: true,
          validationRules: [
            {
              type: 'required',
              message: 'Text content cannot be empty'
            },
            {
              type: 'min',
              value: 1,
              message: 'Text must contain at least 1 character'
            },
            {
              type: 'max',
              value: 200,
              message: 'Text should not exceed 200 characters for optimal display'
            }
          ],
          defaultValue: 'Label'
        },
        {
          key: 'fontSize',
          type: 'number',
          label: 'Font Size',
          suffix: 'px',
          min: 8,
          max: 72,
          description: 'Text size in pixels for optimal readability',
          helpText: 'Controls the size of the text display',
          constraints: 'Range: 8-72px recommended for print compatibility',
          usageExample: '14px for body text, 18-24px for headings, 12px for labels',
          bestPractice: 'Use 14px as default, larger sizes for titles/headers',
          validationRules: [
            {
              type: 'min',
              value: 8,
              message: 'Font size must be at least 8px for readability'
            },
            {
              type: 'max',
              value: 72,
              message: 'Font size should not exceed 72px for print compatibility'
            }
          ],
          defaultValue: 14
        },
        {
          key: 'autoFit',
          type: 'boolean',
          label: 'Auto-fit Size',
          description: 'Automatically resize component to fit text content',
          helpText: 'When enabled, component adjusts its size to perfectly fit the text',
          usageExample: 'Enable for labels and titles, disable for fixed-width fields',
          bestPractice: 'Enable for dynamic content, disable when precise positioning matters',
          defaultValue: true
        }
      ]
    },
    {
      title: 'Style',
      defaultExpanded: false,
      collapsible: true,
      properties: [
        {
          key: 'fontWeight',
          type: 'select',
          label: 'Font Weight',
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'bold', label: 'Bold' }
          ],
          description: 'Text weight for visual emphasis and hierarchy',
          helpText: 'Controls how thick or thin the text appears',
          usageExample: 'Normal for content text, Bold for headers and important labels',
          bestPractice: 'Use bold sparingly for emphasis and hierarchy',
          defaultValue: 'normal'
        },
        {
          key: 'color',
          type: 'color',
          label: 'Text Color',
          description: 'Color of the text for visibility and design consistency',
          helpText: 'Select color using the picker or enter a hex code',
          usageExample: '#000000 for black text, #333333 for dark gray, #0066CC for accent',
          constraints: 'Ensure sufficient contrast ratio for accessibility (4.5:1 minimum)',
          bestPractice: 'Use dark colors for body text, consider colorblind accessibility',
          validationRules: [
            {
              type: 'pattern',
              value: /^#[0-9A-Fa-f]{6}$/,
              message: 'Color must be a valid hex code (e.g., #FF0000)'
            }
          ],
          defaultValue: '#000000'
        },
        {
          key: 'alignment',
          type: 'select',
          label: 'Text Alignment',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ],
          description: 'Horizontal alignment of text within the component',
          helpText: 'Controls how text is positioned horizontally',
          usageExample: 'Left for labels, Center for titles, Right for numeric values',
          bestPractice: 'Left-align for readability, center for titles, right for numbers',
          defaultValue: 'left'
        }
      ]
    }
  ],
  validation: {
    minProperties: 3,
    maxProperties: 7,
    requiredProperties: ['content'],
    customValidators: [
      {
        name: 'readability-check',
        validator: (properties) => {
          const fontSize = properties.fontSize || 14;
          const color = properties.color || '#000000';
          
          // Check for accessibility - light colors with small fonts
          if (fontSize < 12 && (color === '#CCCCCC' || color === '#DDDDDD')) {
            return 'Small font size with light colors may not be readable';
          }
          
          return true;
        },
        message: 'Text configuration may have readability issues'
      }
    ]
  },
  defaults: {
    content: 'Label',
    fontSize: 14,
    fontWeight: 'normal',
    color: '#000000',
    alignment: 'left',
    autoFit: true
  },
  metadata: {
    version: '2.0.0',
    description: 'Enhanced text label with validation and 80/20 rule compliance',
    category: 'Text',
    priority: 1
  }
};