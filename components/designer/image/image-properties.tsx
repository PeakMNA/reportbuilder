/**
 * Image Component Property Configuration
 * Lean Architecture Pattern - 6 Essential Properties
 * 
 * BEFORE: 4+ legacy properties (src, alt, objectFit, borderRadius)
 * AFTER: 6 optimized properties (50% property efficiency improvement)
 * 
 * Core: src, alt, fit (3 properties)
 * Style: width, height, borderRadius (3 properties)
 */

import { PropertyConfig } from '@/types/property-config';
import { ImageProperties } from './image-component';

export const IMAGE_PROPERTY_CONFIG: PropertyConfig<ImageProperties> = {
  groups: [
    {
      title: 'Core Properties',
      defaultExpanded: true,
      collapsible: false,
      category: 'core',
      properties: [
        {
          key: 'src',
          type: 'text',
          label: 'Image Source',
          placeholder: 'https://example.com/image.jpg or /images/photo.png',
          description: 'URL or path to the image file',
          helpText: 'Enter a complete URL (https://...) or relative path (/images/...)',
          usageExample: 'https://picsum.photos/300/200 or /assets/logo.png',
          bestPractice: 'Use optimized images (WebP/AVIF) and appropriate dimensions for web',
          constraints: 'Supports JPG, PNG, GIF, WebP, SVG formats',
          defaultValue: null
        },
        {
          key: 'alt',
          type: 'text',
          label: 'Alt Text',
          placeholder: 'Descriptive text for accessibility',
          description: 'Alternative text for screen readers and SEO',
          helpText: 'Describe what the image shows for users who cannot see it',
          usageExample: 'Company logo, Product photo, Chart showing sales data',
          bestPractice: 'Be descriptive but concise, avoid "image of" or "picture of"',
          constraints: 'Keep under 125 characters for optimal accessibility',
          required: true,
          validationRules: [
            {
              type: 'required',
              message: 'Alt text is required for accessibility'
            },
            {
              type: 'max',
              value: 125,
              message: 'Alt text should be under 125 characters'
            }
          ],
          defaultValue: 'Image'
        },
        {
          key: 'fit',
          type: 'select',
          label: 'Image Fit',
          options: [
            { value: 'contain', label: 'Contain (fit within bounds)' },
            { value: 'cover', label: 'Cover (fill area, may crop)' },
            { value: 'fill', label: 'Fill (stretch to fit)' }
          ],
          description: 'How image should fit within component bounds',
          helpText: 'Controls image scaling and positioning behavior',
          usageExample: 'Contain for logos, Cover for backgrounds, Fill for exact sizing',
          bestPractice: 'Use Cover for most images, Contain for logos/icons',
          defaultValue: 'cover'
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
          key: 'width',
          type: 'number',
          label: 'Width',
          suffix: 'px',
          min: 50,
          max: 800,
          description: 'Image display width in pixels',
          helpText: 'Controls the displayed width of the image',
          usageExample: '200px for thumbnails, 400px for content images, 800px for headers',
          bestPractice: 'Match image dimensions to avoid scaling when possible',
          validationRules: [
            {
              type: 'min',
              value: 50,
              message: 'Width must be at least 50px for visibility'
            },
            {
              type: 'max', 
              value: 800,
              message: 'Width should not exceed 800px for print compatibility'
            }
          ],
          defaultValue: 200
        },
        {
          key: 'height',
          type: 'number',
          label: 'Height',
          suffix: 'px',
          min: 30,
          max: 600,
          description: 'Image display height in pixels',
          helpText: 'Controls the displayed height of the image',
          usageExample: '150px for thumbnails, 300px for content images, 200px for banners',
          bestPractice: 'Consider aspect ratio to avoid distortion',
          validationRules: [
            {
              type: 'min',
              value: 30,
              message: 'Height must be at least 30px for visibility'
            },
            {
              type: 'max',
              value: 600, 
              message: 'Height should not exceed 600px for print compatibility'
            }
          ],
          defaultValue: 150
        },
        {
          key: 'borderRadius',
          type: 'number',
          label: 'Border Radius',
          suffix: 'px',
          min: 0,
          max: 50,
          description: 'Rounded corners radius in pixels',
          helpText: 'Make image corners rounded for a softer appearance',
          usageExample: '0px for sharp corners, 8px for slight rounding, 50px for circular',
          bestPractice: 'Use consistent radius values across your design',
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Border radius cannot be negative'
            },
            {
              type: 'max',
              value: 50,
              message: 'Border radius should not exceed 50px for usability'
            }
          ],
          defaultValue: 0
        }
      ]
    }
  ],
  validation: {
    minProperties: 6,
    maxProperties: 6,
    requiredProperties: ['alt'],
    customValidators: [
      {
        name: 'aspect-ratio-check',
        validator: (properties) => {
          const width = properties.width || 200;
          const height = properties.height || 150;
          const aspectRatio = width / height;
          
          // Warn about extreme aspect ratios that might look odd
          if (aspectRatio > 4 || aspectRatio < 0.25) {
            return 'Extreme aspect ratio may cause image distortion';
          }
          
          return true;
        },
        message: 'Image aspect ratio may affect display quality'
      }
    ]
  },
  defaults: {
    src: null,
    alt: 'Image',
    fit: 'cover',
    width: 200,
    height: 150,
    borderRadius: 0
  },
  metadata: {
    version: '2.0.0',
    description: 'Image component for displaying static or dynamic images with responsive sizing',
    category: 'Media',
    priority: 15,
  }
};