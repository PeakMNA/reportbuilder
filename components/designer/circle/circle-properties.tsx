/**
 * Circle Component Property Configuration
 * Lean Architecture Pattern - 4 Essential Properties
 * 
 * BEFORE: 3+ legacy properties (backgroundColor, borderWidth, borderColor)
 * AFTER: 4 optimized properties (33% property increase for better control)
 * 
 * Core: size (1 property)
 * Style: backgroundColor, borderColor, borderWidth (3 properties)
 */

import { PropertyConfig } from '@/types/property-config';
import { CircleProperties } from './circle-component';

export const CIRCLE_PROPERTY_CONFIG: PropertyConfig<CircleProperties> = {
  groups: [
    {
      title: 'Core Properties',
      defaultExpanded: true,
      collapsible: false,
      category: 'core',
      properties: [
        {
          key: 'size',
          type: 'number',
          label: 'Circle Size',
          suffix: 'px',
          min: 40,
          max: 200,
          description: 'Diameter of the circle in pixels',
          helpText: 'Controls the size of the circular shape',
          usageExample: '50px for small indicators, 100px for medium elements, 150px for large features',
          bestPractice: 'Use consistent sizes for similar elements, follow your design system',
          validationRules: [
            {
              type: 'min',
              value: 40,
              message: 'Circle size must be at least 40px for visibility'
            },
            {
              type: 'max',
              value: 200,
              message: 'Circle size should not exceed 200px for layout compatibility'
            }
          ],
          defaultValue: 100
        }
      ]
    },
    {
      title: 'Style Properties',
      defaultExpanded: false,
      collapsible: true,
      category: 'style',
      properties: [
        {
          key: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          description: 'Fill color of the circle interior',
          helpText: 'Choose the background color for the circle shape',
          usageExample: '#f3f4f6 for light gray, #ffffff for white, #3b82f6 for blue accent',
          bestPractice: 'Use subtle colors for backgrounds, bold colors for status indicators',
          constraints: 'Ensure good contrast if using as a status indicator',
          validationRules: [
            {
              type: 'pattern',
              value: /^#[0-9A-Fa-f]{6}$/,
              message: 'Background color must be a valid hex code (e.g., #F3F4F6)'
            }
          ],
          defaultValue: '#f3f4f6'
        },
        {
          key: 'borderColor',
          type: 'color',
          label: 'Border Color',
          description: 'Color of the circle border outline',
          helpText: 'Set the color for the circle border',
          usageExample: '#d1d5db for subtle gray, #000000 for strong outline, #10b981 for success indicator',
          bestPractice: 'Use darker shades than background for clear definition',
          validationRules: [
            {
              type: 'pattern',
              value: /^#[0-9A-Fa-f]{6}$/,
              message: 'Border color must be a valid hex code (e.g., #D1D5DB)'
            }
          ],
          defaultValue: '#d1d5db'
        },
        {
          key: 'borderWidth',
          type: 'number',
          label: 'Border Width',
          suffix: 'px',
          min: 0,
          max: 8,
          description: 'Thickness of the circle border in pixels',
          helpText: 'Controls how thick the border outline appears',
          usageExample: '0px for filled circles, 1px for subtle outline, 2-3px for emphasis',
          bestPractice: 'Use 1px for most cases, 0px for solid shapes, 2px+ for indicators',
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Border width cannot be negative'
            },
            {
              type: 'max',
              value: 8,
              message: 'Border width should not exceed 8px for circles'
            }
          ],
          defaultValue: 1
        }
      ]
    }
  ],
  validation: {
    minProperties: 4,
    maxProperties: 4,
    requiredProperties: ['size'],
    customValidators: [
      {
        name: 'border-size-ratio',
        validator: (properties) => {
          const size = properties.size || 100;
          const borderWidth = properties.borderWidth || 1;
          
          // Warn if border is too thick relative to circle size
          if (borderWidth > size / 10) {
            return 'Border width may be too thick for the circle size';
          }
          
          return true;
        },
        message: 'Border thickness may affect circle appearance'
      }
    ]
  },
  defaults: {
    size: 100,
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderWidth: 1
  },
  metadata: {
    version: '2.0.0',
    description: 'Basic circular shape for design elements and status indicators',
    category: 'Shapes',
    priority: 4,
    migrationNotes: 'Migrated from legacy system - simplified to 4 essential properties'
  }
};