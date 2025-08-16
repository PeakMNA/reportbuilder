/**
 * Heading Component Property Configuration
 * Lean Architecture Pattern - 6 Essential Properties
 * 
 * BEFORE: 6+ legacy properties (content, fontSize, fontWeight, color, alignment, level)
 * AFTER: 6 optimized properties (maintained count but improved organization)
 * 
 * Core: content, level, autoFit (3 properties)
 * Style: fontSize, fontWeight, color (3 properties)
 */

import { PropertyConfig } from '@/types/property-config';
import { HeadingProperties } from './heading-component';

export const HEADING_PROPERTY_CONFIG: PropertyConfig<HeadingProperties> = {
  groups: [
    {
      title: 'Core Properties',
      defaultExpanded: true,
      collapsible: false,
      category: 'core',
      properties: [
        {
          key: 'content',
          type: 'text',
          label: 'Heading Text',
          placeholder: 'Enter heading text...',
          description: 'The heading text content to display',
          helpText: 'Enter the main heading text for your report section',
          usageExample: 'Sales Report, Financial Summary, Customer Analysis, Q4 Results',
          bestPractice: 'Keep headings clear, concise, and descriptive of the content below',
          constraints: 'Avoid very long headings that may wrap poorly',
          required: true,
          validationRules: [
            {
              type: 'required',
              message: 'Heading content cannot be empty'
            },
            {
              type: 'min',
              value: 1,
              message: 'Heading must contain at least 1 character'
            },
            {
              type: 'max',
              value: 100,
              message: 'Heading should not exceed 100 characters for optimal display'
            }
          ],
          defaultValue: 'Heading'
        },
        {
          key: 'level',
          type: 'select',
          label: 'Heading Level',
          options: [
            { value: 'h1', label: 'H1 - Main Title' },
            { value: 'h2', label: 'H2 - Section Header' },
            { value: 'h3', label: 'H3 - Subsection' },
            { value: 'h4', label: 'H4 - Minor Heading' },
            { value: 'h5', label: 'H5 - Small Heading' },
            { value: 'h6', label: 'H6 - Smallest' }
          ],
          description: 'Semantic heading level for document structure',
          helpText: 'Choose the appropriate heading level for document hierarchy',
          usageExample: 'H1 for report title, H2 for major sections, H3 for subsections',
          bestPractice: 'Use H1 for main title, H2-H3 for sections, maintain logical hierarchy',
          constraints: 'Follow semantic HTML structure - don\'t skip levels',
          required: true,
          validationRules: [
            {
              type: 'required',
              message: 'Heading level must be selected'
            }
          ],
          defaultValue: 'h2'
        },
        {
          key: 'autoFit',
          type: 'boolean',
          label: 'Auto-fit Size',
          description: 'Automatically resize to fit text content',
          helpText: 'When enabled, heading adjusts its width to fit the text exactly',
          usageExample: 'Enable for centered titles, disable for full-width headers',
          bestPractice: 'Enable for titles and labels, disable for section headers that span full width',
          defaultValue: true
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
          key: 'fontSize',
          type: 'number',
          label: 'Font Size',
          suffix: 'px',
          min: 12,
          max: 72,
          description: 'Text size in pixels',
          helpText: 'Controls the size of the heading text',
          usageExample: '24px for main headings, 18px for subheadings, 32px for report titles',
          bestPractice: 'Use larger sizes for higher-level headings (H1 > H2 > H3)',
          constraints: 'Should be larger than body text for proper hierarchy',
          validationRules: [
            {
              type: 'min',
              value: 12,
              message: 'Font size must be at least 12px for readability'
            },
            {
              type: 'max',
              value: 72,
              message: 'Font size should not exceed 72px for print compatibility'
            }
          ],
          defaultValue: 24
        },
        {
          key: 'fontWeight',
          type: 'select',
          label: 'Font Weight',
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'bold', label: 'Bold' }
          ],
          description: 'Text thickness for visual emphasis',
          helpText: 'Controls how thick or thin the heading text appears',
          usageExample: 'Bold for main headings and emphasis, Normal for subtle subheadings',
          bestPractice: 'Use bold for most headings to create clear hierarchy',
          defaultValue: 'bold'
        },
        {
          key: 'color',
          type: 'color',
          label: 'Text Color',
          description: 'Color of the heading text',
          helpText: 'Select the color for the heading text',
          usageExample: '#000000 for black, #1f2937 for dark gray, #3b82f6 for brand blue',
          bestPractice: 'Use dark colors for readability, brand colors for important headings',
          constraints: 'Ensure sufficient contrast ratio for accessibility (4.5:1 minimum)',
          validationRules: [
            {
              type: 'pattern',
              value: /^#[0-9A-Fa-f]{6}$/,
              message: 'Color must be a valid hex code (e.g., #000000)'
            }
          ],
          defaultValue: '#000000'
        }
      ]
    }
  ],
  validation: {
    minProperties: 6,
    maxProperties: 6,
    requiredProperties: ['content', 'level'],
    customValidators: [
      {
        name: 'heading-hierarchy-check',
        validator: (properties) => {
          const fontSize = properties.fontSize || 24;
          const level = properties.level || 'h2';
          
          // Suggest appropriate font sizes for heading levels
          const suggestedSizes = { h1: 32, h2: 24, h3: 20, h4: 18, h5: 16, h6: 14 };
          const suggested = suggestedSizes[level as keyof typeof suggestedSizes];
          
          if (Math.abs(fontSize - suggested) > 8) {
            return `Consider using ~${suggested}px font size for ${level.toUpperCase()} headings`;
          }
          
          return true;
        },
        message: 'Font size may not match heading level hierarchy'
      }
    ]
  },
  defaults: {
    content: 'Heading',
    level: 'h2',
    autoFit: true,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000'
  },
  metadata: {
    version: '2.0.0',
    description: 'Semantic heading component with proper hierarchy levels',
    category: 'Text',
    priority: 12,
    migrationNotes: 'Migrated from legacy system - improved semantic structure and organization'
  }
};