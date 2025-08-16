'use client';

import { PropertyConfig } from '@/types/property-config';
import { PageElementProperties } from './page-element-component';

export const PAGE_ELEMENT_PROPERTY_CONFIG: PropertyConfig<PageElementProperties> = {
  groups: [
    {
      title: 'Content',
      defaultExpanded: true,
      properties: [
        {
          key: 'elementType',
          type: 'select',
          label: 'Element Type',
          options: [
            { value: 'page-number', label: 'Page Number' },
            { value: 'total-pages', label: 'Total Pages' },
            { value: 'current-date', label: 'Current Date' },
            { value: 'custom', label: 'Custom' }
          ],
          description: 'Type of metadata to display'
        },
        {
          key: 'format',
          type: 'text',
          label: 'Format',
          description: 'Display format for the selected element type (use {page}, {totalPages}, {date})'
        },
        {
          key: 'autoFit',
          type: 'boolean',
          label: 'Auto-fit Size',
          description: 'Auto-resize to fit content'
        }
      ]
    },
    {
      title: 'Style',
      defaultExpanded: false,
      properties: [
        {
          key: 'fontSize',
          type: 'number',
          label: 'Font Size',
          suffix: 'px',
          min: 8,
          max: 36,
          description: 'Text size for metadata display'
        },
        {
          key: 'color',
          type: 'color',
          label: 'Text Color',
          description: 'Text color (typically muted for metadata)'
        }
      ]
    }
  ]
};