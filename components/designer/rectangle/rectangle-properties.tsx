/**
 * Rectangle Component Property Configuration
 * Lean Architecture Pattern - 6 Essential Properties
 * 
 * BEFORE: 4+ legacy properties (backgroundColor, borderWidth, borderColor, borderRadius)
 * AFTER: 6 optimized properties (50% property increase for better control)
 * 
 * Core: width, height (2 properties)
 * Style: backgroundColor, borderColor, borderWidth, borderRadius (4 properties)
 */

import { PropertyConfig } from '@/types/property-config';
import { RectangleProperties } from './rectangle-component';

export const RECTANGLE_PROPERTY_CONFIG: PropertyConfig<RectangleProperties> = {
  groups: [
    {
      title: 'Core Properties',
      defaultExpanded: true,
      collapsible: false,
      category: 'core',
      properties: [
        {
          key: 'width',
          type: 'number',
          label: 'Width',
          suffix: 'px',
          min: 50,
          max: 400,
          description: 'Width of the rectangle in pixels',
          helpText: 'Controls the horizontal size of the rectangle',
          usageExample: '150px for buttons, 300px for sections, 100px for dividers',
          bestPractice: 'Use consistent widths for similar elements in your design',
          validationRules: [
            {
              type: 'min',
              value: 50,
              message: 'Width must be at least 50px for visibility'
            },
            {
              type: 'max',
              value: 400,
              message: 'Width should not exceed 400px for layout compatibility'
            }
          ],
          defaultValue: 150
        },
        {
          key: 'height',
          type: 'number',
          label: 'Height',
          suffix: 'px',
          min: 30,
          max: 300,
          description: 'Height of the rectangle in pixels',
          helpText: 'Controls the vertical size of the rectangle',
          usageExample: '100px for sections, 50px for buttons, 20px for dividers',
          bestPractice: 'Consider the golden ratio (1:1.6) for pleasing proportions',
          validationRules: [
            {
              type: 'min',
              value: 30,
              message: 'Height must be at least 30px for visibility'
            },
            {
              type: 'max',
              value: 300,
              message: 'Height should not exceed 300px for layout compatibility'
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
          description: 'Fill color of the rectangle interior',
          helpText: 'Choose the background color for the rectangle shape',
          usageExample: '#f3f4f6 for light gray, #ffffff for white, #3b82f6 for blue accent',
          bestPractice: 'Use subtle colors for backgrounds, bold colors for highlights',
          constraints: 'Ensure good contrast if placing text over the rectangle',
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
          description: 'Color of the rectangle border outline',
          helpText: 'Set the color for the rectangle border',
          usageExample: '#d1d5db for subtle gray, #000000 for strong outline, #ef4444 for red accent',
          bestPractice: 'Use darker shades than background for definition',
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
          max: 10,
          description: 'Thickness of the rectangle border in pixels',
          helpText: 'Controls how thick the border outline appears',
          usageExample: '0px for no border, 1px for subtle outline, 2-3px for emphasis',
          bestPractice: 'Use 1px for most cases, 0px for filled shapes, 2px+ for emphasis',
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Border width cannot be negative'
            },
            {
              type: 'max',
              value: 10,
              message: 'Border width should not exceed 10px for usability'
            }
          ],
          defaultValue: 1
        },
        {
          key: 'borderRadius',
          type: 'number',
          label: 'Border Radius',
          suffix: 'px',
          min: 0,
          max: 50,
          description: 'Roundedness of rectangle corners in pixels',
          helpText: 'Makes corners rounded for a softer appearance',
          usageExample: '0px for sharp corners, 4-8px for slight rounding, 20px+ for pill shapes',
          bestPractice: 'Use consistent radius values throughout your design system',
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Border radius cannot be negative'
            },
            {
              type: 'max',
              value: 50,
              message: 'Border radius should not exceed 50px for typical rectangles'
            }
          ],
          defaultValue: 4
        }
      ]
    }
  ],
  validation: {
    minProperties: 6,
    maxProperties: 6,
    requiredProperties: [],
    customValidators: [
      {
        name: 'proportion-check',
        validator: (properties) => {
          const width = properties.width || 150;
          const height = properties.height || 100;
          const aspectRatio = width / height;
          
          // Warn about extreme aspect ratios that might look odd
          if (aspectRatio > 5 || aspectRatio < 0.2) {
            return 'Very wide or tall rectangles may not display well';
          }
          
          return true;
        },
        message: 'Rectangle proportions may affect visual appearance'
      }
    ]
  },
  defaults: {
    width: 150,
    height: 100,
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 4
  },
  metadata: {
    version: '2.0.0',
    description: 'Basic rectangle shape for layouts and design elements',
    category: 'Shapes',
    priority: 5,
  }
};